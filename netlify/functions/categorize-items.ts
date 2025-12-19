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
        const { items } = await req.json();

        if (!items || !Array.isArray(items)) {
            return new Response("Missing items array", { status: 400 });
        }

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

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a grocery categorization AI.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content returned from AI");
        }

        return new Response(content, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error categorizing items:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config: Config = {
    path: "/.netlify/functions/categorize-items",
};
