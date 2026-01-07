import { useContext, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { KeyboardContext } from "../context/KeyboardContext";

export default function SearchBar({ placeholder, value, onChange, inputId = "search-bar" }) {
  const inputRef = useRef(null);
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};

  // Register input with keyboard context on mount
  useEffect(() => {
    if (registerInput && inputRef.current) {
      registerInput(inputId, inputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput(inputId);
      }
    };
  }, [inputId, registerInput, unregisterInput]);

  const handleInputClick = () => {
    if (focusInput) {
      focusInput(inputId);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 mb-10 w-full">
      {/* Search Input */}
      <div className="relative w-full md:w-2/3 lg:w-1/2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputClick}
          placeholder={placeholder}
          className="w-full px-12 py-3 text-lg border-2 rounded-lg focus:outline-none focus:border-[var(--color-coral)] shadow-sm placeholder:text-gray-600 text-gray-600 font-lato border-gray-300"
        />
      </div>
    </div>
  );
}
