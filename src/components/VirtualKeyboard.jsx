import { useState } from "react";
import { Keyboard, Globe2, X } from "lucide-react";

const keyboards = {
  urdu: [
    ['ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ'],
    ['د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص'],
    ['ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل'],
    ['م', 'ن', 'ں', 'و', 'ہ', 'ھ', 'ء', 'ی', 'ے', '۔'],
    ['آ', 'أ', 'إ', 'ؤ', 'ئ', 'ة', 'ً', 'ٌ', 'ٍ', 'َ'],
    ['ُ', 'ِ', 'ّ', 'ْ', '٠', '١', '٢', '٣', '٤', '٥'],
    ['٦', '٧', '٨', '٩', 'Space', 'Backspace']
  ],
 pashto: [
  ['ا', 'آ', 'أ', 'پ', 'ب', 'ت', 'ټ', 'ث', 'ج', 'چ'],
  ['ح', 'خ', 'د', 'ډ', 'ذ', 'ر', 'ړ', 'ز', 'ژ', 'ږ'],
  ['س', 'ش', 'ښ', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'],
  ['ک', 'ګ', 'ګ', 'م', 'ن', 'ڼ', 'و', 'ؤ', 'ه', 'ۀ'],
  ['ي', 'ی', 'ۍ', 'ې', 'ۍ', 'ي', 'ى', 'ځ', 'څ', 'ښ'],
  ['ل', 'ب', 'پ', 'ئ', 'ئ‌', 'ة', 'ژ', 'ط', 'ظ', 'ړ'],
  ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', 'Space', 'Backspace']
],

  roman: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['ā', 'ē', 'ī', 'ō', 'ū', 'ṅ', 'ṭ', 'ḍ', 'ṛ', 'ṣ'],
    ['Space', 'Backspace']
  ]
};

export default function VirtualKeyboard({ language, onKeyPress, isVisible, onToggle, onLanguageChange }) {
  const [currentLang, setCurrentLang] = useState(language || "urdu");
  const isGlobalKeyboard = !onToggle && isVisible;

  // Use context-provided language for global keyboard, local state for inline keyboard
  const activeLang = isGlobalKeyboard ? (language || "urdu") : currentLang;
  const currentKeyboard = keyboards[activeLang] || keyboards.roman;

  const handleLanguageChange = () => {
    const nextLang = currentLang === "urdu" ? "pashto" : currentLang === "pashto" ? "roman" : "urdu";
    setCurrentLang(nextLang);
    if (onLanguageChange) onLanguageChange(nextLang);
  };

  const handleKeyPress = (key) => {
    if (key === "Space") onKeyPress(" ");
    else if (key === "Backspace") onKeyPress("BACKSPACE");
    else onKeyPress(key);
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-coral)] text-[var(--color-coral)] bg-[var(--color-background)] hover:bg-[var(--color-coral)]/5 text-sm font-medium shadow-sm transition"
      >
        <Keyboard size={16} /> Keyboard
      </button>
    );
  }

  // Build rows for rendering: for the global keyboard, pack more characters per line
  const rowsToRender = (() => {
    if (!isGlobalKeyboard) return currentKeyboard;

    const flat = currentKeyboard.flat();
    const perRow = 22; // pack even more keys per row on wide screens
    const result = [];
    for (let i = 0; i < flat.length; i += perRow) {
      result.push(flat.slice(i, i + perRow));
    }
    return result;
  })();

  return (
    <div
      className={
        isGlobalKeyboard
          ? "px-2 pb-2"
          : "bg-[var(--color-background)] border border-[var(--color-paynesgray)] rounded-2xl shadow-md p-3 sm:p-3.5 transition-all duration-300"
      }
    >
      {/* Header - only for inline keyboard */}
      {!isGlobalKeyboard && (
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handleLanguageChange}
            title="Switch Language (Urdu  Pashto  Roman)"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[var(--color-coral)] text-[var(--color-coral)] bg-white hover:bg-[var(--color-coral)]/5 transition text-xs sm:text-sm font-semibold"
          >
            <Globe2 size={14} />
            <span className="capitalize">{currentLang}</span>
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              title="Close Keyboard"
              className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 text-[var(--color-paynesgray)] hover:text-red-600 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Keys */}
      <div className={isGlobalKeyboard ? "space-y-1.5" : "space-y-1.5"}>
        {rowsToRender.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex justify-center gap-1 flex-wrap ${rowIndex === 0 && isGlobalKeyboard ? "mt-1" : ""}`}
          >
            {row.map((key, keyIndex) => (
              <button
                key={keyIndex}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${isGlobalKeyboard ? "px-4 py-2 text-xl sm:text-2xl" : "px-3 py-1.5 text-sm sm:text-base"}
                  rounded-lg border border-gray-200 text-[var(--color-gunmetal-darker)]
                  bg-white hover:bg-[var(--color-background)] hover:border-[var(--color-coral)]
                  transition min-w-[38px] shadow-sm
                  ${key === "Space" ? (isGlobalKeyboard ? "min-w-[200px]" : "min-w-[130px] sm:min-w-[150px]") : ""}
                  ${key === "Backspace" ? "bg-red-50 text-red-600 font-semibold border-red-200" : ""}
                `}
              >
                {key === "Space" ? "⎵" : key === "Backspace" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
