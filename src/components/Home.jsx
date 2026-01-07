import { useState, useEffect, useContext, useRef } from "react";
import { Search } from "lucide-react";
import CategoryGrid from "../components/CategoryGrid";
import { getCategories } from "../api/api";
import { searchCategories } from "../lib/searchUtils";
import { KeyboardContext } from "../context/KeyboardContext";

export default function Home() {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const searchInputRef = useRef(null);

  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  // Register search input with keyboard context
  useEffect(() => {
    if (registerInput && searchInputRef.current) {
      registerInput("home-search", searchInputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput("home-search");
      }
    };
  }, [registerInput, unregisterInput]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setAllCategories(data);
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleSearch = (query) => {
    setCategorySearch(query);
    const filtered = searchCategories(allCategories, query);
    setCategories(filtered);
  };

  const handleSearchInputClick = () => {
    if (focusInput) {
      focusInput("home-search");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-lato">
      {/* Heading */}
      <section className="px-4 sm:px-6 md:px-8 pt-10 pb-0">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-fenix font-bold text-center text-[var(--color-gunmetal-darker)] mb-4">
          Explore Categories
        </h2>
      </section>

      {/* Search Bar */}
      <section className="px-4 sm:px-6 md:px-8 pb-0">
        <div className="w-full max-w-6xl lg:max-w-7xl mx-auto">
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories by name or meaning..."
                value={categorySearch}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={handleSearchInputClick}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[var(--color-coral)] hover:border-[var(--color-coral-dark)] focus:ring-1 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none text-[var(--color-gunmetal-darker)] font-lato shadow-sm bg-[var(--color-background)] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="px-4 sm:px-6 md:px-8 pb-10">
        <div className="w-full max-w-6xl lg:max-w-7xl mx-auto">
          <CategoryGrid
            categories={categories}
            onSelect={(id) => console.log("Navigate to Add Word for", id)}
          />
        </div>
      </section>
    </div>
  );
}
