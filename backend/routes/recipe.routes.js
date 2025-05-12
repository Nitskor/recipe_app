import express from "express";
import Recipe from "../models/recipe.model.js";
import slugify from "slugify";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { protectRoute } from "../middleware/protectRoute.js";
import { generateUniqueSlug } from "../lib/utils/generateUniqueSlug.js";
import { APIChain } from "langchain/chains";

dotenv.config();
const router = express.Router();

const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  dangerouslyAllowBrowser: true,
  apiKey: process.env.GROQ_API_KEY,
});




const formatPrompt = (rawText, author) => `
Convert the following recipe into **valid JSON**, following this format:
{
  "title": "...",
  "slug": "...",
  "description": "...",
  "servings": 1,
  "prep_time_minutes": 0,
  "cook_time_minutes": 0,
  "total_time_minutes": 0,
  "ingredients": [
    { "name": "...", "quantity": 1, "unit": "", "notes": "" }
  ],
  "instructions": ["..."],
  "tags": [],
  "author": "${author}"
}
Recipe:
"""
${rawText}
"""
ONLY return a valid JSON object — no explanations, markdown, or backticks.
If any value is missing, use a best-guess default (e.g., 1, 0, empty string, etc.).
`;

// Create a new recipe
router.post("/",protectRoute, async (req, res) => {
  const { rawRecipeText } = req.body;
  const author = req.user?._id;

  if (!rawRecipeText) {
    return res.status(400).json({ error: "No recipe text provided" });
  }

  try {
    const response = await llm.invoke([
      {
        role: "system",
        content: "You are a helpful assistant that formats recipes into structured JSON.",
      },
      { role: "user", content: formatPrompt(rawRecipeText, author) },
    ]);

    const content = response.content;
    const match = content.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/);
    if (!match) {
      return res.status(500).json({ error: "No JSON found in model response" });
    }

    const jsonText = match[1] || match[2];
    const formattedRecipe = JSON.parse(jsonText);

    // Make sure slug is safe
    const baseSlug = slugify(formattedRecipe.slug || formattedRecipe.title, { lower: true });
    formattedRecipe.slug = await generateUniqueSlug(baseSlug);

    const newRecipe = new Recipe(formattedRecipe);
    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (err) {
    console.error("Error creating recipe:", err.message);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Get all recipes
router.get("/",protectRoute, async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a specific recipe by slug
router.get("/:slug",protectRoute, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).populate('liked_by');
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a recipe
router.put("/:slug", protectRoute, async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { slug: req.params.slug, author: req.user._id }, // Ensure the user is the author
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found or you are not the author" });
    }

    res.status(200).json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a recipe
router.delete("/:slug", protectRoute, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete(
      { slug: req.params.slug, author: req.user._id } // Ensure the user is the author
    );

    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found or you are not the author" });
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Like a recipe
router.post("/:slug/like", protectRoute, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Add user to the "liked_by" array
    if (recipe.liked_by.includes(req.user._id)) {
      return res.status(400).json({ error: "You have already liked this recipe" });
    }

    recipe.liked_by.push(req.user._id);
    await recipe.save();

    res.status(200).json({ message: "Recipe liked successfully", recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ask AI to generate a recipe
router.post("/ask-ai", protectRoute, async (req, res) => {
  const { query } = req.body;
  const author = req.user._id;

  if (!query) {
    return res.status(400).json({ error: "No query provided" });
  }

  const prompt = `
Generate a recipe based on the following request: "${query}"

Format the recipe as **valid JSON**:
{
  "title": "...",
  "slug": "...",
  "description": "...",
  "servings": 1,
  "prep_time_minutes": 0,
  "cook_time_minutes": 0,
  "total_time_minutes": 0,
  "ingredients": [
    { "name": "...", "quantity": 1, "unit": "", "notes": "" }
  ],
  "instructions": ["..."],
  "tags": [],
  "author": "${author}"
}

Only return the JSON. No explanations, markdown, or extra text.
**Important**: Convert all fractions like 1/2 to decimal format like 0.5.
If something is unclear, use best-guess defaults.
`;

  try {
    const response = await llm.invoke([
      {
        role: "system",
        content: "You are a helpful recipe assistant that returns structured recipes.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.content;

    // Strip markdown formatting (```json ... ```)
    const cleaned = content
      .replace(/^```json|```$/g, "")
      .replace(/^```|```$/g, "")
      .trim();

    // Optional: fix known bad patterns like 1/2 to 0.5
    const fixedFractions = cleaned.replace(/"quantity":\s*([0-9]+)\/([0-9]+)/g, (_, num, denom) => {
      const decimal = parseFloat((+num / +denom).toFixed(2));
      return `"quantity": ${decimal}`;
    });

    let recipeData;
    try {
      recipeData = JSON.parse(fixedFractions);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr.message);
      console.log("Raw AI Response:", content);
      return res.status(500).json({ error: "AI returned invalid JSON", raw: content });
    }

    // Generate unique slug
    const baseSlug = slugify(recipeData.slug || recipeData.title, { lower: true });
    recipeData.slug = await generateUniqueSlug(baseSlug);

    res.status(200).json(recipeData);
  } catch (err) {
    console.error("Error generating AI recipe:", err.message);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

router.post("/from-json", protectRoute, async (req, res) => {
  try {
    const recipeData = req.body;
    const baseSlug = slugify(recipeData.slug || recipeData.title, { lower: true });
    recipeData.slug = await generateUniqueSlug(baseSlug);

    const newRecipe = new Recipe(recipeData);
    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (err) {
    console.error("Error saving recipe from JSON:", err.message);
    res.status(500).json({ error: "Failed to save recipe" });
  }
});


export default router;
