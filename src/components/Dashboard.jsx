import { useState, useEffect, useRef } from "react";
import CategoryManager from "./CategoryManager";
import WordManager from "./WordManager";
import NewWords from "./NewWords";
import HiddenWords from "./HiddenWords";
import { LogOut, LayoutGrid, FolderOpen, BookOpen, EyeOff, ChevronDown } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("categories");
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const activeLabel = tabs.find(t => t.id === activeTab)?.label || "Sections";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileTabsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* Mobile Tabs (arrow dropdown) */}
      <div ref={dropdownRef} className="bg-white border-b px-4 py-3 md:hidden relative">
        <button
          onClick={() => setMobileTabsOpen((prev) => !prev)}
          aria-expanded={mobileTabsOpen}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg border-2 border-gray-200 text-[var(--color-gunmetal)] hover:border-[var(--color-coral)] transition"
        >
          <span className="font-medium">{activeLabel}</span>
          <ChevronDown
            size={20}
            className={`text-[var(--color-coral)] transition-transform ${mobileTabsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mobileTabsOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-white border border-[var(--color-paynesgray)] rounded-lg shadow-lg z-10 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileTabsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left transition ${
                  activeTab === tab.id
                    ? "bg-[var(--color-coral)] text-white"
                    : "text-[var(--color-gunmetal)] hover:bg-[var(--color-paynesgray)]/10"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs (Desktop/Tablet) */}
      <nav className="bg-white border-b px-6 hidden md:flex space-x-6">
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
