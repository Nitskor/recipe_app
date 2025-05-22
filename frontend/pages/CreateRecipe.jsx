import { useState } from "react";
import RecipeForm from "../components/RecipeForm";
import {
  createRecipeFromText,
  generateRecipeWithAI,
} from "../src/api/recipes.js";

const CreateRecipe = () => {
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (input, mode) => {
    try {
      setError(null);
      const res =
        mode === "raw"
          ? await createRecipeFromText(input)
          : await generateRecipeWithAI(input);

      // Set the recipe result here instead of navigating
      setGeneratedRecipe(res.data);
      return res.data;  // return so RecipeForm can use it if needed
    } catch (err) {
      console.error("Error submitting recipe:", err.response?.data || err.message);
      setError("Something went wrong. Please try again.");
      return null;
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Create a Recipe</h1>

      <RecipeForm onSubmit={handleFormSubmit} />

      {error && (
        <div className="mt-4 text-red-600 font-semibold text-center">{error}</div>
      )}

      {generatedRecipe && (
        <div className="mt-6 p-4 border border-gray-300 rounded-xl bg-gray-50 prose max-w-none whitespace-pre-wrap">
          <pre>{JSON.stringify(generatedRecipe, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CreateRecipe;
