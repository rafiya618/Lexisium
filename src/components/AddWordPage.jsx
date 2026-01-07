import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { getCategories, addWord, getWordsByCategory } from "../api/api";
import WordForm from "./WordForm";
import CustomAlert from "./CustomAlert";
import { Search, X, Volume2, Image as ImageIcon, BookText, Layers, Languages, Type } from "lucide-react";
import { searchWords } from "../lib/searchUtils";
import { KeyboardContext } from "../context/KeyboardContext";

export default function AddWordPage() {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const searchInputRef = useRef(null);

  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWords, setFilteredWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null); // 🔹 for popup modal
  const [alert, setAlert] = useState({ message: "", type: "" });

  // Register search input with keyboard context
  useEffect(() => {
    if (registerInput && searchInputRef.current) {
      registerInput("addwordpage-search", searchInputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput("addwordpage-search");
      }
    };
  }, [registerInput, unregisterInput]);

  const handleSearchInputClick = () => {
    if (focusInput) {
      focusInput("addwordpage-search");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
      if (categoryId) {
        const cat = data.find((c) => c._id === categoryId);
        setSelectedCategory(cat);
      }
    };
    loadCategories();
  }, [categoryId]);

  // Load words
  useEffect(() => {
    const loadWords = async () => {
      if (categoryId) {
        const data = await getWordsByCategory(categoryId);
        setWords(data);
        setFilteredWords(data);
      }
    };
    loadWords();
  }, [categoryId]);

  // Search filter
  useEffect(() => {
    const filtered = searchWords(words, searchTerm);
    setFilteredWords(filtered);
  }, [searchTerm, words]);

  // Handle add word
  const handleAddWord = async (formData) => {
    try {
      if (!formData.has("category")) formData.append("category", selectedCategory._id);
      await addWord(formData);
      showAlert("✅ Word submitted for approval!", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);
      showAlert("Error adding word: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  if (!selectedCategory)
    return <div className="p-6 text-[var(--color-paynesgray)]">Loading category...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-4rem)] bg-[var(--color-lightgray)]">
      {/* Custom Alert */}
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />

      {/* Left: Word List */}
      <div className="lg:w-1/2 w-full border-r border-[var(--color-paynesgray)] p-4 lg:p-6 overflow-y-auto bg-[var(--color-background)] min-h-screen lg:min-h-full">
        <h2 className="text-2xl lg:text-3xl font-bold mb-1 text-[var(--color-gunmetal-darker)]">
          {selectedCategory.word} Words
        </h2>
        <p className="text-xs lg:text-sm text-gray-600 mb-4">
          Showing all approved words in this category.
        </p>

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search words, meanings, dialect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchInputClick}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-paynesgray)] rounded-lg outline-none focus:ring-1 focus:ring-[var(--color-paynesgray)] font-lato"
            />
          </div>
        </div>

        {/* Virtual Keyboard removed - uses global navbar keyboard */}

        {/* Words Table */}
        {filteredWords.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm lg:text-base">
                <thead className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-bold text-xs lg:text-sm">Word</th>
                    <th className="px-5 py-3 font-bold text-xs lg:text-sm">Dialect</th>
                    <th className="px-5 py-3 font-bold text-xs lg:text-sm hidden sm:table-cell">English</th>
                    <th className="px-5 py-3 font-bold text-xs lg:text-sm hidden md:table-cell">Urdu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWords.map((wordDoc) => (
                    wordDoc.words && wordDoc.words.map((dialectWord, dialectIdx) => (
                      <tr
                        key={`${wordDoc._id}-${dialectIdx}`}
                        onClick={() => setSelectedWord(wordDoc)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-5 py-3 font-semibold text-[var(--color-gunmetal-darker)]">
                          {dialectWord.word}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{dialectWord.dialect}</td>
                        <td className="px-5 py-3 text-sm hidden sm:table-cell">
                          {dialectWord.meanings?.find((m) => m.language === "english")?.value || "-"}
                        </td>
                        <td className="px-5 py-3 text-sm hidden md:table-cell">
                          {dialectWord.meanings?.find((m) => m.language === "urdu")?.value || "-"}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic mt-4 text-center">
            No words found in this category.
          </p>
        )}
      </div>

      {/* Right: Add Word Form */}
      <div className="lg:w-1/2 w-full p-4 lg:p-6 overflow-y-auto min-h-screen lg:min-h-full">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-[var(--color-gunmetal)]">
          Add a New Word
        </h2>

        <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
          <WordForm
            categories={categories}
            onSubmit={handleAddWord}
            submitLabel="Submit Word for Approval"
            showCategorySelect={false}
            initialData={{ category: selectedCategory }}
          />
        </div>
      </div>

      {/* Word Detail Popup */}
      {selectedWord && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWord(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
	    className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold font-fenix text-[var(--color-gunmetal-darker)] leading-snug">
                    {selectedWord.words && selectedWord.words.length > 0 ? selectedWord.words[0].word : "Word"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWord(null)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-coral)] text-[var(--color-coral)] hover:bg-[var(--color-coral)]/5 transition"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Category + Dialect variants */}
              {selectedWord.words && selectedWord.words.length > 0 && (
                <div className="space-y-5">
                  {/* Category section */}
                  {selectedWord.category && (
                    <div className="pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Layers className="text-[var(--color-paynesgray)]" size={22} />
                        <div className="space-y-1 text-sm md:text-base text-[var(--color-gunmetal)]">
                          <p className="text-base md:text-lg">
                            <span className="font-semibold text-[var(--color-paynesgray)] mr-1">Category:</span>
                            <span className="font-bold text-[var(--color-gunmetal-darker)]">
                              {selectedWord.category.word}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWord.words.map((dialectWord, idx) => (
                    <div
                      key={idx}
                      className="space-y-3"
                    >
                      {/* Word & Dialect */}
                      <div className="flex items-start gap-3 mb-3 pb-2 border-b border-gray-200">
                        <Type className="mt-0.5 text-[var(--color-paynesgray)]" size={20} />
                        <div className="space-y-1 text-sm md:text-base text-[var(--color-gunmetal)]">
                          <p className="text-base md:text-lg">
                            <span className="font-semibold text-[var(--color-paynesgray)] mr-1">Word:</span>
                            <span className="font-bold text-[var(--color-gunmetal-darker)]">{dialectWord.word}</span>
                          </p>
                          <p className="text-xs md:text-sm">
                            <span className="font-semibold text-[var(--color-paynesgray)] mr-1">Dialect:</span>
                            <span className="uppercase tracking-wide text-gray-600 font-medium">{dialectWord.dialect}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm md:text-base text-[var(--color-gunmetal)]">
                        {/* Meanings */}
                        {dialectWord.meanings && dialectWord.meanings.length > 0 && (
                          <div className="space-y-2 pt-3">
                            <div className="flex items-center gap-3">
                              <Languages className="text-[var(--color-paynesgray)]" size={20} />
                              <p className="text-base md:text-lg font-semibold text-[var(--color-paynesgray)]">
                                Meanings
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 pl-8">
                              {dialectWord.meanings.map((meaning, midx) => (
                                <p
                                  key={midx}
                                  className="text-sm md:text-base text-[var(--color-gunmetal-darker)] font-lato"
                                >
                                  <span className="font-semibold text-[var(--color-paynesgray)] text-xs md:text-sm mr-1">
                                    {`${meaning.language?.charAt(0).toUpperCase()}${meaning.language?.slice(1).toLowerCase()}`}:
                                  </span>
                                  {meaning.value}
                                </p>
                              ))}
                           </div>
                          </div>
                        )}

                        {/* Description */}
                        {dialectWord.description && (
                          <div className="space-y-2 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <BookText className="text-[var(--color-paynesgray)]" size={20} />
                              <p className="text-base md:text-lg font-semibold text-[var(--color-paynesgray)] mb-0">
                                Description
                              </p>
                            </div>
                            <p className="text-sm md:text-base text-gray-700 font-lato leading-relaxed pl-8">
                              {dialectWord.description}
                            </p>
                          </div>
                        )}

                        {/* Audio */}
                        {dialectWord.audio && (
                          <div className="space-y-2 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <Volume2 className="text-[var(--color-paynesgray)]" size={20} />
                              <p className="text-base md:text-lg font-semibold text-[var(--color-paynesgray)] mb-0">
                                Media
                              </p>
                            </div>
                            <div className="pl-8">
                              <audio
                                controls
                                src={dialectWord.audio}
                                className="w-full h-9 rounded-lg"
                                controlsList="nodownload"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
