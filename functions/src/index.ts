import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { OpenAI } from "openai";

admin.initializeApp();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const categorizeItems = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { items } = data;
    if (!items || !Array.isArray(items)) {
        throw new functions.https.HttpsError("invalid-argument", "Missing items array");
    }

    if (items.length === 0) return { categorized: [] };
    if (items.length > 100) throw new functions.https.HttpsError("invalid-argument", "Too many items");

    const categories = "Produce, Meat, Seafood, Dairy, Bakery, Pantry, Frozen, Snacks, Beverages, Household, Personal Care, Other";
    const prompt = `
      Categorize the following grocery items into one of these categories:
      ${categories}
      
      Items:
      ${items.join("\n")}
      
      Output JSON format:
      {
        "categorized": [
          {"name": "string", "category": "string"}
        ]
      }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "You are a grocery categorization AI." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content returned from AI");

        return JSON.parse(content);
    } catch (error: any) {
        console.error("Error categorizing items:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

export const extractWhiteboard = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { image } = data;
    if (!image) throw new functions.https.HttpsError("invalid-argument", "Missing image data");

    const prompt = `
      You are an AI that extracts grocery items from valid whiteboard photos.
      Extract items into a structured JSON list.
      
      Rules:
      - Normalize item names (e.g. "tomatos" -> "tomatoes")
      - Split combined items ("eggs milk bread" -> 3 items)
      - If quantity unclear, set null and lower confidence
      - Detect category from standard list: Produce, Meat, Seafood, Dairy, Bakery, Pantry, Frozen, Snacks, Beverages, Household, Personal Care, Other
      - Never invent items not seen
      
      Output JSON format:
      {
        "items": [
          {"name": "string", "quantity": number|null, "unit": "string|null", "category": "string|null", "confidence": number (0-1), "notes": "string|null"}
        ],
        "warnings": ["string"]
      }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract grocery items from this whiteboard." },
                        { type: "image_url", image_url: { url: image } },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content returned from AI");

        return JSON.parse(content);
    } catch (error: any) {
        console.error("Error extracting whiteboard:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

export const generateMealplan = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { items, preferences } = data;
    if (!items || !Array.isArray(items)) throw new functions.https.HttpsError("invalid-argument", "Missing items array");
    if (items.length === 0) throw new functions.https.HttpsError("invalid-argument", "At least 1 ingredient needed");

    const prompt = `
      Generate a 3-day meal plan based on the following available ingredients and preferences.
      
      Available Ingredients: ${items.map((i: any) => i.name).join(", ")}
      Preferences: ${JSON.stringify(preferences || {})}
      
      Rules:
      - Use purchased items first.
      - "shopping_additions" should be minimal.
      - 3 days only for MVP.
      
      Output JSON format:
      {
        "days": [
          {
            "day": 1,
            "meals": [
              {
                "title": "string",
                "time_minutes": number,
                "ingredients_used": [{"name":"string","amount":"string|null"}],
                "optional_staples": ["string"],
                "steps": ["string"]
              }
            ]
          }
        ],
        "shopping_additions": ["string"]
      }
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "You are a helpful meal planner AI." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content returned from AI");

        return JSON.parse(content);
    } catch (error: any) {
        console.error("Error generating meal plan:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
