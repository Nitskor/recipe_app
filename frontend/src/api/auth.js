// src/api/auth.js
import axios from "axios";

const API = axios.create({
  baseURL: "/auth",
  withCredentials: true, // send cookies (jwt)
});

// Register new user
export const registerUser = (userData) => 
  API.post("/register", userData);

// Login user
export const loginUser = (credentials) => 
  API.post("/login", credentials);

// Logout user
export const logoutUser = () => 
  API.post("/logout");

// Optionally, get current user info if you add such route in backend
// export const getCurrentUser = () => API.get("/me");
