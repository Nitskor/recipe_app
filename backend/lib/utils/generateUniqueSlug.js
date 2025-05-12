import Recipe from "../../models/recipe.model.js"; // Correct relative path


// 👇 Helper: Ensure the slug is unique by appending -1, -2, etc.
export const generateUniqueSlug = async (baseSlug) =>{
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (await Recipe.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter++}`;
  }
  return uniqueSlug;
}