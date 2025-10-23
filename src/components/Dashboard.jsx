import { useState, useEffect } from "react";
import CategoryManager from "./CategoryManager";
import WordManager from "./WordManager";
import NewWords from "./NewWords";
import HiddenWords from "./HiddenWords";
import { LogOut, LayoutGrid, FolderOpen, BookOpen, EyeOff } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("categories");

  // ✅ Token Expiry Check
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        onLogout(); // no token
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; // in seconds
        if (decoded.exp && decoded.exp < now) {
          localStorage.removeItem("token");
          onLogout(); // expired
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        onLogout(); // invalid token
      }
    };

    checkToken(); // check immediately on mount
    const interval = setInterval(checkToken, 10 * 60 * 1000); // every 10 minutes
    return () => clearInterval(interval);
  }, [onLogout]);

  const tabs = [
    { id: "categories", label: "Categories", icon: <FolderOpen size={18} />, component: <CategoryManager /> },
    { id: "words", label: "Words", icon: <BookOpen size={18} />, component: <WordManager /> },
    { id: "newwords", label: "New Words", icon: <LayoutGrid size={18} />, component: <NewWords /> },
    { id: "hidden", label: "Hidden Words", icon: <EyeOff size={18} />, component: <HiddenWords /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-fenix font-bold text-gradient">Lexisium Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            onLogout();
          }}
          className="flex items-center gap-2 bg-[var(--color-coral)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-coral-dark)] transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b flex space-x-6 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "border-[var(--color-coral)] text-[var(--color-coral)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="px-6 py-8">{tabs.find((tab) => tab.id === activeTab)?.component}</main>
    </div>
  );
}
