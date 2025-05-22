// src/api/recipes.js
import axios from "axios";

const API = axios.create({
  baseURL: "/recipes",
  withCredentials: true, // send cookies
});

// Create a recipe from raw text (AI formatting)
export const createRecipeFromText = (rawRecipeText) =>
  API.post("/", { rawRecipeText });

// Create a recipe directly from JSON (used after editing AI output)
export const saveRecipeFromJSON = (recipeData) =>
  API.post("/from-json", recipeData);

// Ask AI to generate a recipe from a prompt
export const generateRecipeWithAI = (query) => {
  console.log("Sending to API:", query);
  return API.post("/ask-ai", { query });
};

// Get all recipes
export const getAllRecipes = () => API.get("/");

// Get one recipe by slug
export const getRecipeBySlug = (slug) => API.get(`/${slug}`);

// Update a recipe
export const updateRecipe = (slug, updatedData) =>
  API.put(`/${slug}`, updatedData);

// Delete a recipe
export const deleteRecipe = (slug) => API.delete(`/${slug}`);

// Like a recipe
export const likeRecipe = (slug) => API.post(`/${slug}/like`);
