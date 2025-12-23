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
        const { image } = await req.json();

        if (!image) {
            return new Response(JSON.stringify({ error: "Missing image data" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Validate image size (base64 string length check, ~10MB limit)
        if (image.length > 13500000) { // ~10MB in base64
            return new Response(JSON.stringify({ error: "Image too large. Maximum size is 10MB" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

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

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract grocery items from this whiteboard." },
                        {
                            type: "image_url",
                            image_url: {
                                url: image, // Expecting data:image/jpeg;base64,...
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content returned from AI");
        }

        // Validate output schema
        const parsedData = JSON.parse(content);
        if (!parsedData.items || !Array.isArray(parsedData.items)) {
            throw new Error("Invalid response format from AI");
        }

        return new Response(content, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error extracting whiteboard:", error);
        return new Response(JSON.stringify({
            error: error.message || "Failed to extract items from image. Please try again."
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config: Config = {
    path: "/.netlify/functions/extract-whiteboard",
};
