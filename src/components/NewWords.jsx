import { useEffect, useState, useContext, useRef } from "react";
import { getPendingWords, approveWord, hideWord, deleteWord } from "../api/api";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import {
  CheckCircle,
  EyeOff,
  Trash2,
  X,
  Eye,
  Search,
  Layers,
  Type,
  Languages,
  BookText,
  Volume2,
} from "lucide-react";
import { searchWords } from "../lib/searchUtils";
import { KeyboardContext } from "../context/KeyboardContext";

export default function NewWords() {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const searchInputRef = useRef(null);

  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [filteredWords, setFilteredWords] = useState([]);

  // Register search input with keyboard context
  useEffect(() => {
    if (registerInput && searchInputRef.current) {
      registerInput("newwords-search", searchInputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput("newwords-search");
      }
    };
  }, [registerInput, unregisterInput]);

  const fetchData = async () => {
    try {
      const pendingWords = await getPendingWords();
      setPending(pendingWords);
      setFilteredWords(pendingWords);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPending([]);
      setFilteredWords([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = searchWords(pending, query);
    setFilteredWords(filtered);
  };

  const handleSearchInputClick = () => {
    if (focusInput) {
      focusInput("newwords-search");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const handleApprove = async (id) => {
    try {
      await approveWord(id);
      fetchData();
      showAlert("Word approved successfully!", "success");
      setSelectedWord(null);
    } catch (error) {
      showAlert("Error approving word: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  const handleHide = async (id) => {
    try {
      await hideWord(id);
      fetchData();
      showAlert("Word hidden successfully!", "success");
      setSelectedWord(null);
    } catch (error) {
      showAlert("Error hiding word: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirm("Are you sure you want to delete this word? This action cannot be undone.", async () => {
      try {
        await deleteWord(id);
        fetchData();
        showAlert("Word deleted successfully!", "success");
        setSelectedWord(null);
      } catch (error) {
        showAlert("Error deleting word: " + (error.response?.data?.message || "Unknown error"), "error");
      }
      setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
    });
  };

  return (
    <>
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />

      <ConfirmDialog
        message={confirmDialog.message}
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: "", onConfirm: null })}
      />

      <div className="p-4 md:p-6 bg-[var(--color-background)] rounded-lg">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-gunmetal-darker)] mb-6">Pending Words</h1>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by word, dialect, meaning, or category..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchInputClick}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none text-gray-800 font-lato shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Words Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {filteredWords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-sm">Word</th>
                    <th className="px-6 py-4 text-left font-bold text-sm">Dialect</th>
                    <th className="px-6 py-4 text-left font-bold text-sm hidden sm:table-cell">Category</th>
                    <th className="px-6 py-4 text-left font-bold text-sm hidden md:table-cell">Meaning (EN)</th>
                    <th className="px-6 py-4 text-center font-bold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWords.map((wordDoc) =>
                    wordDoc.words?.map((dialectWord, dialectIdx) => (
                      <tr
                        key={`${wordDoc._id}-${dialectIdx}`}
                        className="hover:bg-gray-50 transition-colors"
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
                            {wordDoc.category?.word}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-700">
                            {dialectWord.meanings?.find((m) => m.language === "english")?.value || "-"}
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
                              onClick={() => handleApprove(wordDoc._id)}
                              title="Approve Word"
                              className="p-2 hover:bg-[var(--color-silver-light)]/70 text-[var(--color-paynesgray-dark)] rounded-lg transition"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleHide(wordDoc._id)}
                              title="Hide Word"
                              className="p-2 hover:bg-[var(--color-paynesgray-light)]/70 text-[var(--color-paynesgray-dark)] rounded-lg transition"
                            >
                              <EyeOff size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(wordDoc._id)}
                              title="Delete Word"
                              className="p-2 hover:bg-[var(--color-silver-light)]/70 text-[var(--color-paynesgray-dark)] rounded-lg transition"
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
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-semibold">No pending words</p>
              <p className="text-sm mt-2">All words have been reviewed</p>
            </div>
          )}
        </div>
      </div>

      {/* Word Detail Popup - same card layout as WordManager with pending actions */}
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

              {/* Admin Actions for pending word */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(selectedWord._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-coral)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[var(--color-coral-dark)] transition-colors shadow-md"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => handleHide(selectedWord._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-paynesgray)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[var(--color-paynesgray-dark)] transition-colors shadow-md"
                >
                  <EyeOff size={18} /> Hide
                </button>
                <button
                  onClick={() => handleDelete(selectedWord._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-coral-dark)] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[var(--color-coral-darker)] transition-colors shadow-md"
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
