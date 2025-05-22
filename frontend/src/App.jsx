import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRecipe from "../pages/CreateRecipe.jsx";
import Login from "../pages/Login.jsx";
import HomePage from "../pages/HomePage.jsx";
import Register from "../pages/Register.jsx";


function App() {
  return (
  
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create" element={<CreateRecipe />} />
      {/* <Route path="/recipes/:slug" element={<RecipeDetail />} /> */}
    </Routes>
    
  );
}

export default App;
