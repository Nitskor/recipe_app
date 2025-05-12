import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  liked_recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  saved_recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  created_recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;



