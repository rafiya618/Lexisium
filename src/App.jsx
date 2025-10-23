import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import AddWordPage from "./components/AddWordPage";
import ExploreWords from "./components/ExploreWords";
import { useState, useEffect } from "react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={isAdmin ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <AdminLogin onLogin={setIsAdmin} />
        )} />
        <Route path="/add-word/:categoryId" element={<AddWordPage />} />
        <Route path="/explore-words" element={<ExploreWords />} />
      </Routes>
    </BrowserRouter>
  );
}
