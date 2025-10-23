import { useState } from "react";
import { Keyboard } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";

export default function KeyboardInput({
  placeholder,
  value,
  onChange,
  language = "urdu",
  isTextarea = false,
  rows = 3,
  className = "",
}) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const handleKeyPress = (key) => {
    if (key === "BACKSPACE") onChange(value.slice(0, -1));
    else onChange(value + key);
  };

  return (
    <div className="relative">
      {isTextarea ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={className}
          style={{ paddingRight: "48px" }}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          style={{ paddingRight: "48px" }}
        />
      )}

      <button
        type="button"
        onClick={() => setIsKeyboardVisible((prev) => !prev)}
        className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        title="Toggle Virtual Keyboard"
      >
        <Keyboard size={20} className="text-[var(--color-coral)]" />
      </button>

      {isKeyboardVisible && (
        <div className="mt-2">
          <VirtualKeyboard
            language={language}
            onKeyPress={handleKeyPress}
            isVisible={isKeyboardVisible}
            onToggle={() => setIsKeyboardVisible(false)}
          />
        </div>
      )}
    </div>
  );
}
