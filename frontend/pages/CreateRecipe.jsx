import { useState, useEffect } from "react";
import RecipeForm from "../components/RecipeForm";
import { generateRecipeWithAI, saveRecipeFromJSON, getAllRecipes } from "../src/api/recipes.js";

const CreateRecipe = () => {
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [isDuplicateSlug, setIsDuplicateSlug] = useState(false);
  const [allRecipes, setAllRecipes] = useState([]);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const response = await getAllRecipes();
        setAllRecipes(response.data);
      } catch (err) {
        console.error("Error fetching all recipes:", err);
      }
    };

    fetchAllRecipes();
  }, []);

  const handleFormSubmit = async (input, mode) => {
    if (mode !== "ai") return;
    setLoading(true);
    setGeneratedRecipe(null);
    setError(null);
    setIsDuplicateSlug(false);
    try {
      const res = await generateRecipeWithAI(input);
      const generated = res.data;
      setGeneratedRecipe(generated);
      // Check if a recipe with the same slug already exists
      const slugExists = allRecipes.some(recipe => recipe.slug === generated.slug);
      setIsDuplicateSlug(slugExists);
    } catch (err) {
      console.error("AI Recipe Generation Error:", err.response?.data || err.message);
      setError("Failed to generate recipe. Please try again with a different description.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) {
      setError("No recipe generated to save.");
      return;
    }

    setSaving(true);
    setSaveSuccess(null);
    setError(null);

    try {
      await saveRecipeFromJSON(generatedRecipe);
      setSaveSuccess(`Recipe "${generatedRecipe.title}" saved successfully!`);
      // Optionally, refetch all recipes to update the list
      const response = await getAllRecipes();
      setAllRecipes(response.data);
    } catch (err) {
      console.error("Error saving recipe:", err);
      setError("Failed to save recipe.");
    } finally {
      setSaving(false);
    }
  };

  // Function to get the displayed title (append if duplicate slug)
  const getDisplayedTitle = () => {
    if (generatedRecipe) {
      return isDuplicateSlug ? `${generatedRecipe.title} (Similar recipe exists)` : generatedRecipe.title;
    }
    return "";
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-indigo-600 py-6 px-8">
          <h1 className="text-3xl font-semibold text-white text-center">
            ✨ AI Recipe Generator ✨
          </h1>
          <p className="mt-2 text-lg text-indigo-200 text-center">
            Describe your desired recipe, and let AI work its magic!
          </p>
        </div>
        <div className="p-8">
          <RecipeForm onSubmit={handleFormSubmit} />

          {loading && (
            <div className="mt-6 text-center">
              <svg className="animate-spin h-6 w-6 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c-3.87 0-7 3.13-7 7h0a5 5 0 01-5 5v0A8 8 0 014 12z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Generating recipe...</p>
            </div>
          )}

          {error && !saveSuccess && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <strong className="font-semibold">Error:</strong> {error}
            </div>
          )}

          {generatedRecipe && (
            <div className="mt-8 p-6 bg-gray-50 rounded-md shadow-inner">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {getDisplayedTitle()}
              </h2>
              {isDuplicateSlug && (
                <p className="text-yellow-600 mb-2">A recipe with a similar name already exists.</p>
              )}
              <p className="text-gray-700 mb-4">{generatedRecipe.description}</p>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ingredients</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {generatedRecipe.ingredients.map((item, index) => (
                    <li key={index}>
                      {item.quantity} {item.unit}{" "}
                      {item.name} {item.notes && `(${item.notes})`}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Instructions</h3>
                <ol className="list-decimal list-inside text-gray-600">
                  {generatedRecipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              {(generatedRecipe.prep_time_minutes || generatedRecipe.cook_time_minutes || generatedRecipe.servings) && (
                <div className="mt-6 border-t pt-4 text-sm text-gray-500">
                  {generatedRecipe.servings && <p><strong>Servings:</strong> {generatedRecipe.servings}</p>}
                  {generatedRecipe.prep_time_minutes && <p><strong>Prep Time:</strong> {generatedRecipe.prep_time_minutes} minutes</p>}
                  {generatedRecipe.cook_time_minutes && <p><strong>Cook Time:</strong> {generatedRecipe.cook_time_minutes} minutes</p>}
                  {generatedRecipe.total_time_minutes && <p><strong>Total Time:</strong> {generatedRecipe.total_time_minutes} minutes</p>}
                </div>
              )}

              {generatedRecipe.tags && generatedRecipe.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedRecipe.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {generatedRecipe.metadata && Object.keys(generatedRecipe.metadata).length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h3>
                  <pre className="bg-gray-100 rounded-md p-3 overflow-auto text-xs">
                    {JSON.stringify(generatedRecipe.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <button
                onClick={handleSaveRecipe}
                disabled={saving || !generatedRecipe}
                className={`mt-6 w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-green-400 transition ${
                  saving || !generatedRecipe ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? (
                  <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c-3.87 0-7 3.13-7 7h0a5 5 0 01-5 5v0A8 8 0 014 12z"></path>
                  </svg>
                ) : (
                  "Save Recipe"
                )}
              </button>

              {saveSuccess && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  {saveSuccess}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;