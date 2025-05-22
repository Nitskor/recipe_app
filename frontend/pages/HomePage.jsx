import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../src/api/auth";
import axios from "axios";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null); // not logged in
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">🍲 Welcome to RecipeAI</h1>
      <p className="mb-6 max-w-xl text-gray-600">
        Create, generate, and explore recipes powered by AI. Whether you're a pro or beginner in the kitchen, RecipeAI has something for you.
      </p>

      {user ? (
        <>
          <p className="text-lg mb-4 text-gray-700">Welcome back, <span className="font-semibold">{user.name}</span>!</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/create")}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow"
            >
              Create Recipe
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl shadow"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl shadow"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-xl shadow"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
