import express from "express";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  dangerouslyAllowBrowser: true,
  apiKey: process.env.GROQ_API_KEY
});

const formatPrompt = (rawText,author) => `
Convert the following recipe into this JSON format:

{
  "title": "...",
  "slug": "...",
  "description": "...",
  "servings": ...,
  "prep_time_minutes": ...,
  "cook_time_minutes": ...,
  "total_time_minutes": ...,
  "ingredients": [
    { "name": "...", "quantity": ..., "unit": "...", "notes": "..." }
  ],
  "instructions": ["..."],
  "tags": ["..."],
  "author": "${author}"
}

Here is the recipe:
"""
${rawText}
"""
Only return valid JSON without any explanation, markdown, or commentary.
`;

router.post("/format-recipe", async (req, res) => {
  const { rawRecipeText } = req.body;
  const author = req.user?.name || "Unknown Author";
  // // Check if the user is logged in
  // if (!req.user) {
  //   return res.status(401).json({ error: "Unauthorized: User not logged in" });
  // }
  // Check if the recipe text is provided   
  if (!rawRecipeText) {
    return res.status(400).json({ error: "No recipe text provided" });
  }

  try {
    const response = await llm.invoke([
      { role: "system", content: "You are a helpful assistant that formats recipes into structured JSON." },
      { role: "user", content: formatPrompt(rawRecipeText, author) }
    ]);

    const content = response.content;

    // Extract JSON block using regex
    const match = content.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/);
    if (!match) {
      return res.status(500).json({ error: "No JSON found in model response" });
    }

    // Get the JSON from either markdown block or direct response
    const jsonText = match[1] || match[2];

    // Try to parse the JSON response
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err) {
    console.error("Error formatting recipe:", err.message);
    res.status(500).json({ error: "Failed to format recipe" });
  }
});

export default router;
