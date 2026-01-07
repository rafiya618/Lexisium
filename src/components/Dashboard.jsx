import { useState, useEffect, useRef } from "react";
import CategoryManager from "./CategoryManager";
import WordManager from "./WordManager";
import NewWords from "./NewWords";
import HiddenWords from "./HiddenWords";
import { LogOut, LayoutGrid, FolderOpen, BookOpen, EyeOff, ChevronDown, PlusCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("categories");
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const mobileDropdownRef = useRef(null);

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
    { id: "addword", label: "Add Word", icon: <PlusCircle size={18} />, component: <WordManager defaultView="add" /> },
    { id: "newwords", label: "New Words", icon: <LayoutGrid size={18} />, component: <NewWords /> },
    { id: "hidden", label: "Hidden Words", icon: <EyeOff size={18} />, component: <HiddenWords /> },
  ];

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label || "Sections";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setMobileTabsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
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

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop/tablet) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r">
          <div className="px-5 py-4 border-b">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-paynesgray)]">Sections</p>
          </div>
          <nav className="flex-1 py-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-left rounded-r-full transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--color-coral)] text-white"
                    : "text-[var(--color-gunmetal)] hover:bg-[var(--color-background)]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 bg-[var(--color-background)]">
          {/* Mobile section selector */}
          <div ref={mobileDropdownRef} className="mb-4 md:hidden">
            <button
              onClick={() => setMobileTabsOpen((prev) => !prev)}
              aria-expanded={mobileTabsOpen}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border-2 border-[var(--color-border)] bg-white text-[var(--color-gunmetal)] hover:border-[var(--color-coral)] transition"
            >
              <span className="font-medium">{activeLabel}</span>
              <ChevronDown
                size={20}
                className={`text-[var(--color-coral)] transition-transform ${mobileTabsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileTabsOpen && (
              <div className="mt-2 bg-white border border-[var(--color-paynesgray)] rounded-lg shadow-lg z-10 overflow-hidden">
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
                        : "text-[var(--color-gunmetal)] hover:bg-[var(--color-background)]"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {tabs.find((tab) => tab.id === activeTab)?.component}
        </main>
      </div>
    </div>
  );
}
