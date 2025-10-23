import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, Book, List, UserCog, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
        setMobileMenuOpen(false);
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
      <h1 className="text-3xl font-fenix text-white"><Link to="/">Lexisium</Link></h1>

      {/* Right - Desktop Menus */}
      <div className="hidden md:flex space-x-8">
        {/* Categories */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("categories")}
            className="flex items-center gap-1 hover:text-[var(--color-coral)] transition-colors"
          >
            <List size={18} />
            Categories
            <ChevronDown size={16} />
          </button>
          {openMenu === "categories" && (
            <div className="absolute mt-2 bg-[var(--color-paynesgray)] border border-[var(--color-paynesgray-light)] rounded shadow-lg w-48 p-2">
              <Link to="/" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors">
                Find Categories
              </Link>
            </div>
          )}
        </div>

        {/* Words */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("words")}
            className="flex items-center gap-1 hover:text-[var(--color-coral)] transition-colors"
          >
            <Book size={18} />
            Words
            <ChevronDown size={16} />
          </button>
          {openMenu === "words" && (
            <div className="absolute mt-2 bg-[var(--color-paynesgray)] border border-[var(--color-paynesgray-light)] rounded shadow-lg w-48 p-2">
              <Link to="/" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors">
                Add Word
              </Link>
              <Link to="/explore-words" className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors">
                Explore Words
              </Link>
            </div>
          )}
        </div>

        {/* Admin */}
        <Link to="/admin" className="flex items-center gap-1 hover:text-[var(--color-coral)] transition-colors">
          <UserCog size={18} /> Admin
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-white hover:text-[var(--color-coral)] transition-colors"
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--color-paynesgray)] border-t border-[var(--color-paynesgray-light)] shadow-lg md:hidden">
          <div className="flex flex-col p-4 space-y-2">
            {/* Categories Mobile */}
            <div>
              <button
                onClick={() => toggleMenu("categories-mobile")}
                className="flex items-center justify-between w-full px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
              >
                <span className="flex items-center gap-2">
                  <List size={18} />
                  Categories
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${openMenu === "categories-mobile" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "categories-mobile" && (
                <div className="pl-6 mt-2 space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
                  >
                    Find Categories
                  </Link>
                </div>
              )}
            </div>

            {/* Words Mobile */}
            <div>
              <button
                onClick={() => toggleMenu("words-mobile")}
                className="flex items-center justify-between w-full px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Book size={18} />
                  Words
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${openMenu === "words-mobile" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "words-mobile" && (
                <div className="pl-6 mt-2 space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
                  >
                    Add Word
                  </Link>
                  <Link 
                    to="/explore-words" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
                  >
                    Explore Words
                  </Link>
                </div>
              )}
            </div>

            {/* Admin Mobile */}
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-paynesgray-light)] rounded transition-colors"
            >
              <UserCog size={18} /> Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
