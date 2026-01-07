import { useContext, useState, useRef, useEffect } from "react";
import { KeyboardContext } from "../context/KeyboardContext";
import VirtualKeyboard from "./VirtualKeyboard";
import { X, ChevronUp, ChevronDown } from "lucide-react";

export default function GlobalKeyboard() {
  const context = useContext(KeyboardContext);
  const [keyboardHeight, setKeyboardHeight] = useState(240);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newHeight = Math.max(160, window.innerHeight - e.clientY);
    setKeyboardHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  if (!context || !context.isKeyboardVisible) return null;

  const { currentLanguage, setCurrentLanguage, insertText, backspace, cycleLanguage, setIsKeyboardVisible } = context;

  const handleLanguageSelect = (lang) => {
    setCurrentLanguage(lang);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-40 flex flex-col"
      style={{ height: isMinimized ? "50px" : `${keyboardHeight}px` }}
    >
      {/* Resize Handle - Top Border */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        className={`h-1 w-full ${isResizing ? "bg-[var(--color-coral)]" : "bg-gray-300 hover:bg-[var(--color-coral)]"} cursor-ns-resize transition-colors`}
        title="Drag to resize keyboard"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 rounded transition"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Keyboard
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[
              { id: "urdu", label: "Urdu" },
              { id: "pashto", label: "Pashto" },
              { id: "roman", label: "Roman" },
            ].map((lang) => {
              const isActive = currentLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors
                    ${
                      isActive
                        ? "border-[var(--color-coral)] text-[var(--color-coral)] bg-[var(--color-coral)]/5"
                        : "border-gray-200 text-gray-600 bg-white hover:border-[var(--color-coral)]/60 hover:text-[var(--color-coral)]"
                    }
                  `}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => setIsKeyboardVisible(false)}
          className="p-1 hover:bg-red-100 text-red-600 rounded transition"
          title="Close keyboard"
        >
          <X size={20} />
        </button>
      </div>

      {/* Keyboard Content */}
      {!isMinimized && (
        <div className="overflow-y-auto flex-1">
          <div className="w-full px-3 pb-3">
            <VirtualKeyboard
              language={currentLanguage}
              onKeyPress={(key) => {
                if (key === "BACKSPACE") {
                  backspace();
                } else if (key === " ") {
                  insertText(" ");
                } else {
                  insertText(key);
                }
              }}
              isVisible={true}
              onLanguageChange={cycleLanguage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
