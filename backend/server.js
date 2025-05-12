import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"; // Import the auth routes
import { protectRoute } from "./middleware/protectRoute.js"; // Protect Route middleware
import { connectDB } from "./config/db.js";
import recipeRoutes from "./routes/recipe.routes.js";

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // To parse cookies



// Authentication Routes
app.use("/auth", authRoutes);
app.use("/recipes", recipeRoutes); // Add auth routes

// Recipe Routes
// app.use("/recipes", protectRoute, recipeRoutes); // Protect recipe routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
