import { z } from "zod";

const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number(),
  unit: z.string(),
  notes: z.string(),
});

export const RecipeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(), // We'll generate it
  description: z.string(),
  servings: z.number().int().min(1),
  prep_time_minutes: z.number().int().nonnegative(),
  cook_time_minutes: z.number().int().nonnegative(),
  total_time_minutes: z.number().int().nonnegative(),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  author: z.string().min(1),
});
