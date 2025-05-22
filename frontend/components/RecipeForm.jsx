import { useState } from "react";
import ReactMarkdown from "react-markdown";

const RecipeForm = ({ onSubmit }) => {
  const [input, setInput] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const result = await onSubmit(input, "ai");
      setGeneratedRecipe(result); // Show JSON below
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-xl resize-none h-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Describe the kind of recipe you'd like AI to generate (e.g. quick vegan pasta)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
        >
          Generate Recipe with AI
        </button>
      </form>

    </div>
  );
};

export default RecipeForm;
