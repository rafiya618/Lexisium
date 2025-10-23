import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import CategoryGrid from "../components/CategoryGrid";
import { getCategories, searchCategory } from "../api/api";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleSearch = async (query) => {
    setCategorySearch(query);
    if (query.trim()) {
      const res = await searchCategory(query);
      setCategories(res.data.categories);
    } else {
      const data = await getCategories();
      setCategories(data);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-lato">

      {/* Search Bar */}
      <SearchBar
        placeholder="Search categories..."
        value={categorySearch}
        onChange={handleSearch}
      />

      {/* Category Grid */}
      <section className="px-6 mb-10">
        <h2 className="text-3xl font-fenix mb-6 text-center text-gradient">
          Explore Categories
        </h2>
        <CategoryGrid
          categories={categories}
          onSelect={(id) => console.log("Navigate to Add Word for", id)}
        />
      </section>
    </div>
  );
}
