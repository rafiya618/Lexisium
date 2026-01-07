import { useEffect, useState, useContext, useRef } from "react";
import { getHiddenWords, approveWord, deleteWord } from "../api/api";
import {
  Trash2,
  Search,
  Volume2,
  Eye,
  X,
  CheckCircle,
  Layers,
  Type,
  Languages,
  BookText,
} from "lucide-react";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import { searchWords } from "../lib/searchUtils";
import { KeyboardContext } from "../context/KeyboardContext";

export default function HiddenWords() {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const searchInputRef = useRef(null);

  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [selectedWord, setSelectedWord] = useState(null);

  // Register search input with keyboard context
  useEffect(() => {
    if (registerInput && searchInputRef.current) {
      registerInput("hiddenwords-search", searchInputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput("hiddenwords-search");
      }
    };
  }, [registerInput, unregisterInput]);

  const load = async () => {
    try {
      const res = await getHiddenWords();
      setWords(res);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearchInputClick = () => {
    if (focusInput) {
      focusInput("hiddenwords-search");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const handleUnhide = async (id) => {
    try {
      await approveWord(id); // This will change status to "Approved"
      load();
      showAlert("Word unhidden and approved successfully!", "success");
    } catch {
      showAlert("Error unhiding word.", "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirm("Are you sure you want to delete this hidden word? This action cannot be undone.", async () => {
      try {
        await deleteWord(id);
        load();
        showAlert("Word deleted successfully!", "success");
      } catch {
        showAlert("Error deleting word.", "error");
      }
      setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
    });
  };

  const handleSearchKeyPress = (key) => {
    if (key === "BACKSPACE") {
      setSearchQuery(searchQuery.slice(0, -1));
    } else {
      setSearchQuery(searchQuery + key);
    }
  };

  const filteredWords = searchWords(words, searchQuery);

  return (
    <>
      {/* Custom Alert */}
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        message={confirmDialog.message}
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: "", onConfirm: null })}
      />

      <div className="p-4 md:p-6 bg-[var(--color-background)] rounded-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <h3 className="text-3xl font-bold text-[var(--color-gunmetal-darker)] tracking-tight">
            Hidden Words
          </h3>
          <div className="text-sm text-gray-600 font-lato">
            Total: <span className="font-semibold text-[var(--color-gunmetal-darker)]">{words.length}</span> hidden words
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              placeholder="Search hidden words, meanings, or category..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchInputClick}
              className="pl-10 pr-4 py-3.5 w-full rounded-xl border border-gray-300 focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none text-gray-800 font-lato shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Word List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {filteredWords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-sm">Word</th>
                    <th className="px-6 py-4 text-left font-bold text-sm">Dialect</th>
                    <th className="px-6 py-4 text-left font-bold text-sm hidden sm:table-cell">Category</th>
                    <th className="px-6 py-4 text-left font-bold text-sm hidden md:table-cell">Status</th>
                    <th className="px-6 py-4 text-center font-bold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWords.map((wordDoc) =>
                    wordDoc.words?.map((dialectWord, dialectIndex) => (
                      <tr
                        key={`${wordDoc._id}-${dialectIndex}`}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedWord(wordDoc)}
                            className="font-semibold text-[var(--color-gunmetal-darker)] hover:text-[var(--color-paynesgray-dark)] transition"
                          >
                            {dialectWord.word}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{dialectWord.dialect}</span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="inline-block bg-[var(--color-silver-light)] text-[var(--color-gunmetal-darker)] px-3 py-1 rounded-full text-xs font-semibold">
                            {wordDoc.category?.word || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--color-paynesgray-light)]/30 text-[var(--color-paynesgray-dark)] text-xs font-semibold">
                            Hidden
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedWord(wordDoc)}
                              title="View Details"
                              className="p-2 hover:bg-[var(--color-silver-light)]/70 text-[var(--color-paynesgray)] rounded-lg transition"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleUnhide(wordDoc._id)}
                              title="Unhide Word"
                              className="p-2 hover:bg-[var(--color-paynesgray-light)]/70 text-[var(--color-paynesgray-dark)] rounded-lg transition"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(wordDoc._id)}
                              title="Delete Word"
                              className="p-2 hover:bg-[var(--color-coral-light)]/70 text-[var(--color-coral-dark)] rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              {searchQuery ? "No words found matching your search" : "No hidden words"}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Word Detail Popup - same card as WordManager/AddWordPage with admin actions */}
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
                  {/* Category + status section */}
                  <div className="pb-2 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Layers className="text-[var(--color-paynesgray)]" size={22} />
                      <div className="space-y-1 text-sm md:text-base text-[var(--color-gunmetal)]">
                        <p className="text-base md:text-lg">
                          <span className="font-semibold text-[var(--color-paynesgray)] mr-1">Category:</span>
                          <span className="font-bold text-[var(--color-gunmetal-darker)]">
                            {selectedWord.category?.word || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-paynesgray-light)]/30 text-[var(--color-paynesgray-dark)] text-xs font-semibold">
                      Hidden
                    </span>
                  </div>

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

              {/* Admin Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleUnhide(selectedWord._id);
                    setSelectedWord(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-paynesgray)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[var(--color-paynesgray-dark)] transition-colors shadow-md"
                >
                  <CheckCircle size={18} /> Unhide
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedWord._id);
                    setSelectedWord(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-coral)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[var(--color-coral-dark)] transition-colors shadow-md"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
