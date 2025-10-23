import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, Book, List, UserCog, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav ref={navRef} className="flex items-center justify-between px-6 py-4 shadow-md bg-[var(--color-paynesgray)] text-white border-b font-lato relative z-50">
      {/* Left - Brand */}
      <h1 className="text-3xl font-fenix text-white"><a href="/">Lexisium</a></h1>

      {/* Right - Menus */}
      <div className="hidden md:flex space-x-8">
        {/* Categories */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("categories")}
            className="flex items-center gap-1 hover:text-[var(--color-coral)]"
          >
            <List size={18} />
            Categories
            <ChevronDown size={16} />
          </button>
          {openMenu === "categories" && (
            <div className="absolute mt-2 bg-[var(--color-paynesgray)] border b-2 rounded shadow-lg w-48 p-2">
              <Link to="/" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded">
                Find Categories
              </Link>
            </div>
          )}
        </div>

        {/* Words */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("words")}
            className="flex items-center gap-1 hover:text-[var(--color-coral)]"
          >
            <Book size={18} />
            Words
            <ChevronDown size={16} />
          </button>
          {openMenu === "words" && (
            <div className="absolute mt-2 bg-[var(--color-paynesgray)] border rounded shadow-lg w-48 p-2">
              <Link to="/" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded">
                Add Word
              </Link>
              <Link to="/explore-words" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded">
                Explore Words
              </Link>
            </div>
          )}
        </div>

        {/* Query */}
    

        {/* Admin */}
        <Link to="/admin" className="flex items-center gap-1 hover:text-[var(--color-coral)]">
          <UserCog size={18} /> Admin
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden">
        <Menu size={22} />
      </button>
    </nav>
  );
}
