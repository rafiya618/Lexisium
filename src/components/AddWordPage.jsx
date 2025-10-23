import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCategories, addWord, getWordsByCategory } from "../api/api";
import WordForm from "./WordForm";
import CustomAlert from "./CustomAlert";
import VirtualKeyboard from "./VirtualKeyboard";
import { Search, Keyboard, X, Volume2, Image as ImageIcon } from "lucide-react";

export default function AddWordPage() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWords, setFilteredWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null); // 🔹 for popup modal
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [showKeyboard, setShowKeyboard] = useState(false);

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
    if (searchTerm.trim() === "") {
      setFilteredWords(words);
    } else {
      const filtered = words.filter((w) =>
        w.word.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWords(filtered);
    }
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

  const handleKeyPress = (key) => {
    if (key === "BACKSPACE") {
      setSearchTerm(searchTerm.slice(0, -1));
    } else {
      setSearchTerm(searchTerm + key);
    }
  };

  if (!selectedCategory)
    return <div className="p-6 text-[var(--color-paynesgray)]">Loading category...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-[var(--color-lightgray)]">
      {/* Custom Alert */}
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />

      {/* Left: Word List */}
      <div className="md:w-1/2 w-full border-r border-[var(--color-paynesgray)] p-4 overflow-y-auto bg-[var(--color-background)]">
        <h2 className="text-xl font-semibold mb-3 text-[var(--color-paynesgray)]">
          {selectedCategory.name} Words
        </h2>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border-2 border-[var(--color-coral)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-coral)] font-lato"
            />
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] transition-colors"
              title="Toggle Virtual Keyboard"
            >
              <Keyboard size={22} />
            </button>
          </div>

          {/* Virtual Keyboard */}
          {showKeyboard && (
            <div className="mt-3">
              <VirtualKeyboard
                language="urdu"
                isVisible={showKeyboard}
                onToggle={() => setShowKeyboard(false)}
                onKeyPress={handleKeyPress}
              />
            </div>
          )}
        </div>

        {/* Words Table */}
        {filteredWords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-left rounded-lg overflow-hidden">
              <thead className="bg-[var(--color-coral)] text-white">
                <tr>
                  <th className="px-4 py-2 border-r border-gray-200">Word</th>
                  <th className="px-4 py-2 border-r border-gray-200">English</th>
                  <th className="px-4 py-2 border-r border-gray-200">Urdu</th>
                  <th className="px-4 py-2">Roman</th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map((w) => (
                  <tr
                    key={w._id}
                    onClick={() => setSelectedWord(w)}
                    className="cursor-pointer hover:bg-[var(--color-lightgray)] transition border-b border-gray-200"
                  >
                    <td className="px-4 py-2 font-medium text-[var(--color-coral-dark)]">{w.word}</td>
                    <td className="px-4 py-2">{w.translation?.english || ""}</td>
                    <td className="px-4 py-2">{w.translation?.urdu || ""}</td>
                    <td className="px-4 py-2">{w.translation?.roman || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic mt-4">
            No words found in this category.
          </p>
        )}
      </div>

      {/* Right: Add Word Form */}
      <div className="md:w-1/2 w-full p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-paynesgray)]">
          Add a New Word to{" "}
          <span className="text-[var(--color-coral)]">{selectedCategory.name}</span>
        </h2>

        <div className="bg-[var(--color-background)] p-4 rounded-xl">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setSelectedWord(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold font-fenix pr-12">
                {selectedWord.word}
              </h2>
              {selectedWord.category && (
                <p className="text-white/90 mt-1 font-lato">
                  Category: {selectedWord.category.name}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Translations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedWord.translation?.english && (
                  <div className="p-3 bg-[var(--color-background)] border-l-4 border-[var(--color-coral)] rounded-lg">
                    <p className="text-xs font-semibold text-[var(--color-coral)] mb-1">English</p>
                    <p className="text-[var(--color-gunmetal)] font-lato">{selectedWord.translation.english}</p>
                  </div>
                )}
                {selectedWord.translation?.urdu && (
                  <div className="p-3 bg-[var(--color-background)] border-l-4 border-[var(--color-paynesgray)] rounded-lg">
                    <p className="text-xs font-semibold text-[var(--color-paynesgray)] mb-1">Urdu</p>
                    <p className="text-[var(--color-gunmetal)] font-lato text-right">{selectedWord.translation.urdu}</p>
                  </div>
                )}
                {selectedWord.translation?.roman && (
                  <div className="p-3 bg-[var(--color-background)] border-l-4 border-[var(--color-gunmetal)] rounded-lg">
                    <p className="text-xs font-semibold text-[var(--color-gunmetal)] mb-1">Roman</p>
                    <p className="text-[var(--color-paynesgray)] font-lato">{selectedWord.translation.roman}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedWord.description && (
                <div className="p-4 bg-[var(--color-background)] border border-gray-200 rounded-lg">
                  <p className="text-sm font-semibold text-[var(--color-gunmetal)] mb-2">Description</p>
                  <p className="text-[var(--color-paynesgray)] font-lato leading-relaxed">{selectedWord.description}</p>
                </div>
              )}

              {/* Media Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audio */}
                {selectedWord.audio && (
                  <div className="p-4 bg-[var(--color-background)] border-2 border-[var(--color-coral)] rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-coral)] mb-3">
                      <Volume2 size={18} />
                      <span>Audio Pronunciation</span>
                    </div>
                    <audio 
                      controls 
                      src={selectedWord.audio} 
                      className="w-full rounded-lg"
                      style={{ height: '40px' }}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Image */}
                {selectedWord.image && (
                  <div className="p-4 bg-[var(--color-background)] border-2 border-[var(--color-paynesgray)] rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-paynesgray)] mb-3">
                      <ImageIcon size={18} />
                      <span>Visual Reference</span>
                    </div>
                    <img
                      src={selectedWord.image}
                      alt={selectedWord.word}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p class="text-sm text-gray-500 italic">Image failed to load</p>';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-4 rounded-b-2xl">
              <button
                onClick={() => setSelectedWord(null)}
                className="w-full bg-[var(--color-coral)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-coral-dark)] transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
