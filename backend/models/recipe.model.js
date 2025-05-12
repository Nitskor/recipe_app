import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  servings: Number,
  prep_time_minutes: Number,
  cook_time_minutes: Number,
  total_time_minutes: Number,
  ingredients: [{
    _id: false, // Disable auto _id for subdocuments
    name: String,
    quantity: Number,
    unit: String,
    notes: String
  }],
  instructions: [String],
  tags: [String],
  created_at: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Use ObjectId,
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('Recipe', recipeSchema);
