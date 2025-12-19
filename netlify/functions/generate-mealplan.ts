import { OpenAI } from "openai";
import type { Config, Context } from "@netlify/functions";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async (req: Request, context: Context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { items, preferences } = await req.json();

        if (!items || !Array.isArray(items)) {
            return new Response("Missing items array", { status: 400 });
        }

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

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful meal planner AI.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content returned from AI");
        }

        return new Response(content, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error generating meal plan:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config: Config = {
    path: "/.netlify/functions/generate-mealplan",
};
