import { useState } from "react";
import { Keyboard } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";

export default function SearchBar({ placeholder, value, onChange }) {
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleKeyPress = (key) => {
    if (key === "BACKSPACE") {
      onChange(value.slice(0, -1));
    } else {
      onChange(value + key);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 mb-10 w-full">
      {/* Search Input + Keyboard Icon */}
      <div className="relative w-full md:w-2/3 lg:w-1/2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-3 text-lg border-2 rounded-lg focus:outline-none focus:border-[var(--color-coral)] shadow-sm pr-12 placeholder:text-gray-600 text-gray-600 font-lato"
        />
        <button
          onClick={() => setShowKeyboard((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] transition"
          title="Open Keyboard"
        >
          <Keyboard size={22} />
        </button>
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="mt-4 w-full md:w-2/3 lg:w-1/2">
          <VirtualKeyboard
            language="urdu"
            isVisible={showKeyboard}
            onToggle={() => setShowKeyboard(false)}
            onKeyPress={handleKeyPress}
          />
        </div>
      )}
    </div>
  );
}
