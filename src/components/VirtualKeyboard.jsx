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

export default function VirtualKeyboard({ language, onKeyPress, isVisible, onToggle }) {
  const [currentLang, setCurrentLang] = useState(language || "urdu");
  const [currentKeyboard, setCurrentKeyboard] = useState(keyboards[language] || keyboards.roman);

  const handleLanguageChange = () => {
    const nextLang = currentLang === "urdu" ? "pashto" : currentLang === "pashto" ? "roman" : "urdu";
    setCurrentLang(nextLang);
    setCurrentKeyboard(keyboards[nextLang]);
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
        className="flex items-center gap-2 bg-[var(--color-green)] text-white px-3 py-2 rounded-lg shadow-sm hover:bg-[var(--color-green-dark)] transition"
      >
        <Keyboard size={18} /> Keyboard
      </button>
    );
  }

  return (
    <div className="bg-white border border-[var(--color-lightgray)] rounded-xl shadow-md p-3 mt-3 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={handleLanguageChange}
          title="Switch Language"
          className="flex items-center gap-2 px-3 py-2 bg-[var(--color-coral)] text-white rounded-md hover:bg-[var(--color-coral-dark)] transition"
        >
          <Globe2 size={16} />
          <span className="capitalize text-sm">{currentLang}</span>
        </button>
        <button
          onClick={onToggle}
          title="Close Keyboard"
          className="p-2 rounded-md bg-gray-100 hover:bg-red-100 text-[var(--color-paynesgray)] hover:text-red-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Keys */}
      <div className="space-y-1">
        {currentKeyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 flex-wrap">
            {row.map((key, keyIndex) => (
              <button
                key={keyIndex}
                onClick={() => handleKeyPress(key)}
                className={`
                  px-3 py-2 rounded-lg border text-[var(--color-paynesgray)]
                  bg-gray-50 hover:bg-[var(--color-green-light)] hover:text-[var(--color-gunmetal)]
                  transition min-w-[32px] text-sm shadow-sm
                  ${key === "Space" ? "min-w-[120px]" : ""}
                  ${key === "Backspace" ? "bg-red-50 text-red-600 font-semibold" : ""}
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
