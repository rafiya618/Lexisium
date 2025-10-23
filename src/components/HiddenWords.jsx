import { useEffect, useState } from "react";
import {
  getHiddenWords, approveWord, deleteWord, getCategories
} from "../api/api";
import {
  CheckCircle, Trash2, Search, Volume2, Image as ImageIcon, Keyboard, Eye
} from "lucide-react";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import VirtualKeyboard from "./VirtualKeyboard";

export default function HiddenWords() {
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);

  const load = async () => {
    try {
      const res = await getHiddenWords();
      setWords(res);
      setCategories(await getCategories());
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Simple client-side filtering
    if (!query.trim()) {
      load();
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

  const filteredWords = searchQuery.trim()
    ? words.filter(w => 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation?.english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation?.urdu?.includes(searchQuery) ||
        w.translation?.roman?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : words;

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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
          Hidden Words
        </h3>
        <div className="text-sm text-gray-600 font-lato">
          Total: <span className="font-semibold text-gray-800">{words.length}</span> hidden words
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Search hidden words..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-14 py-3.5 w-full rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none text-gray-800 font-lato shadow-sm transition-all"
          />
          <button
            onClick={() => setShowSearchKeyboard(!showSearchKeyboard)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] transition-colors"
            title="Toggle Virtual Keyboard"
          >
            <Keyboard size={22} />
          </button>
        </div>

        {/* Virtual Keyboard for Search */}
        {showSearchKeyboard && (
          <div className="mt-4">
            <VirtualKeyboard
              language="urdu"
              isVisible={showSearchKeyboard}
              onToggle={() => setShowSearchKeyboard(false)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
        )}
      </div>

      {/* Word List */}
      <div className="bg-[var(--color-background)] shadow border rounded-lg overflow-hidden">
        {filteredWords.length > 0 ? (
          <div className="divide-y divide-gray-300">
            {filteredWords.map((w) => (
              <div key={w._id} className="p-5 hover:bg-gray-200 transition">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="font-semibold text-xl text-gray-900 mb-2">{w.word}</div>

                    {/* Translations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                      {w.translation?.english && (
                        <div className="text-sm p-2 bg-blue-50 border border-blue-100 rounded">
                          <span className="font-medium text-blue-600">English:</span><br />
                          {w.translation.english}
                        </div>
                      )}
                      {w.translation?.urdu && (
                        <div className="text-sm p-2 bg-green-50 border border-green-100 rounded">
                          <span className="font-medium text-green-600">Urdu:</span><br />
                          {w.translation.urdu}
                        </div>
                      )}
                      {w.translation?.roman && (
                        <div className="text-sm p-2 bg-purple-50 border border-purple-100 rounded">
                          <span className="font-medium text-purple-600">Roman:</span><br />
                          {w.translation.roman}
                        </div>
                      )}
                    </div>

                    {w.description && (
                      <div className="text-sm text-gray-800 mb-2 p-3 bg-gray-100 border border-gray-200 rounded-lg leading-relaxed">
                        <span className="font-semibold text-gray-900">Description:</span><br />
                        {w.description}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Status: {w.status}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        Category: {w.category?.name}
                      </span>
                    </div>
                  </div>

                  {/* Media & Actions */}
                  <div>
                    {w.audio && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Volume2 size={16} /> Audio:
                        </div>
                        <audio controls src={w.audio} className="w-full h-[35px]" />
                      </div>
                    )}

                    {w.image && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <ImageIcon size={16} /> Image:
                        </div>
                        <img
                          src={w.image}
                          alt={w.word}
                          className="w-full max-w-[160px] rounded-lg border shadow-sm"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUnhide(w._id)}
                        className="flex items-center gap-1 bg-[var(--color-coral)] text-white px-4 py-2 rounded-lg text-xs hover:bg-[var(--color-coral-dark)] shadow-sm transition-all"
                      >
                        <Eye size={14} /> Unhide
                      </button>
                      <button
                        onClick={() => handleDelete(w._id)}
                        className="flex items-center gap-1 bg-[var(--color-coral-dark)] text-white px-4 py-2 rounded-lg text-xs hover:bg-[var(--color-coral-darker)] shadow-sm transition-all"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? "No words found matching your search" : "No hidden words"}
          </div>
        )}
      </div>
    </>
  );
}
