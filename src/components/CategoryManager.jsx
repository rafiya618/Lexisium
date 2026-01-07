import { useEffect, useState, useContext, useRef } from "react";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/api";
import { Edit3, PlusCircle, CheckCircle, XCircle, Search, Loader2, X, Trash2, Image as ImageIcon } from "lucide-react";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import AudioRecorder from "./AudioRecorder";
import { KeyboardContext } from "../context/KeyboardContext";
import { searchCategories } from "../lib/searchUtils";

export default function CategoryManager() {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const inputRefs = useRef({});
  const searchInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [word, setWord] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [english, setEnglish] = useState("");
  const [urdu, setUrdu] = useState("");
  const [roman, setRoman] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ word: "", description: "", english: "", urdu: "", roman: "" });
  const [editImage, setEditImage] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "add" | "list"
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

  // Register search input with keyboard context
  useEffect(() => {
    if (registerInput && searchInputRef.current) {
      registerInput("categorymanager-search", searchInputRef.current);
    }

    return () => {
      if (unregisterInput) {
        unregisterInput("categorymanager-search");
      }
    };
  }, [registerInput, unregisterInput]);

  const load = async () => {
    try {
      const res = await getCategories();
      setCategories(res);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  // 🟢 Add Category
  const handleAdd = async () => {
    if (!word.trim()) {
      showAlert("Please enter a category word", "warning");
      return;
    }
    
    setIsAddingCategory(true);
    try {
      const fd = new FormData();
      fd.append("word", word);
      fd.append("description", desc);
      fd.append("translation", JSON.stringify({ english, urdu, roman }));
      if (image) fd.append("image", image);
      if (audio) fd.append("audio", audio);
      
      await addCategory(fd);
      setWord("");
      setDesc("");
      setImage(null);
      setAudio(null);
      setEnglish("");
      setUrdu("");
      setRoman("");
      await load();
      showAlert("Category added successfully!", "success");
    } catch (error) {
      showAlert("Failed to add category: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsAddingCategory(false);
    }
  };

  // 🟡 Update Category
  const handleUpdate = async (id) => {
    if (!editForm.word.trim()) {
      showAlert("Please enter a category word", "warning");
      return;
    }
    
    setIsUpdatingCategory(true);
    try {
      const fd = new FormData();
      fd.append("word", editForm.word);
      fd.append("description", editForm.description);
      fd.append("translation", JSON.stringify({ 
        english: editForm.english, 
        urdu: editForm.urdu, 
        roman: editForm.roman 
      }));
      if (editImage) fd.append("image", editImage);

      await updateCategory(id, fd);
      setEditingCategory(null);
      setEditForm({ word: "", description: "", english: "", urdu: "", roman: "" });
      setEditImage(null);
      await load();
      showAlert("Category updated successfully!", "success");
    } catch (error) {
      showAlert("Failed to update category: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // 🔴 Delete Category
  const handleDelete = async (id) => {
    showConfirm("Are you sure you want to delete this category? This action cannot be undone.", async () => {
      try {
        await deleteCategory(id);
        await load();
        showAlert("Category deleted successfully!", "success");
      } catch (error) {
        showAlert("Failed to delete category", "error");
      }
      setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
    });
  };

  // 🔍 Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearchInputClick = () => {
    if (focusInput) {
      focusInput("categorymanager-search");
    }
  };

  const filteredCategories = searchCategories(categories, searchQuery);

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

      {/* Header + local view switcher */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-gunmetal-darker)] tracking-tight">
          Categories
        </h3>
        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white overflow-hidden self-start">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-[var(--color-coral)] text-white"
                : "text-[var(--color-gunmetal)] hover:bg-[var(--color-background)]"
            }`}
          >
            Category List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("add")}
            className={`px-4 py-2 text-sm font-medium border-l border-[var(--color-border)] transition-colors ${
              viewMode === "add"
                ? "bg-[var(--color-coral)] text-white"
                : "text-[var(--color-gunmetal)] hover:bg-[var(--color-background)]"
            }`}
          >
            Add Category
          </button>
        </div>
      </div>

      {/* ➕ Add Category - shown only in Add view */}
      {viewMode === "add" && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-4">
          <div>
            <h4 className="text-lg md:text-xl font-bold text-[var(--color-gunmetal-darker)] mb-1">Add a New Category</h4>
            <p className="text-sm text-gray-600">Fill in the category word, translations, and optional image/audio.</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Category Word (Pashto)</label>
              <input
                ref={(el) => {
                  if (el && registerInput) {
                    inputRefs.current["add-word"] = el;
                    registerInput("add-word", el);
                  }
                }}
                placeholder="پښتو کټه ګوري"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onClick={() => focusInput && focusInput("add-word")}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Category Description</label>
              <input
                ref={(el) => {
                  if (el && registerInput) {
                    inputRefs.current["add-desc"] = el;
                    registerInput("add-desc", el);
                  }
                }}
                placeholder="Short description of this category"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onClick={() => focusInput && focusInput("add-desc")}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Translations */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white">
            <p className="text-xs font-bold text-[var(--color-paynesgray-dark)] uppercase mb-2">Translations</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">English</label>
                <input
                  ref={(el) => {
                    if (el && registerInput) {
                      inputRefs.current["add-english"] = el;
                      registerInput("add-english", el);
                    }
                  }}
                  placeholder="English translation"
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  onClick={() => focusInput && focusInput("add-english")}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Urdu</label>
                <input
                  ref={(el) => {
                    if (el && registerInput) {
                      inputRefs.current["add-urdu"] = el;
                      registerInput("add-urdu", el);
                    }
                  }}
                  placeholder="Urdu translation"
                  value={urdu}
                  onChange={(e) => setUrdu(e.target.value)}
                  onClick={() => focusInput && focusInput("add-urdu")}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">Roman</label>
                <input
                  ref={(el) => {
                    if (el && registerInput) {
                      inputRefs.current["add-roman"] = el;
                      registerInput("add-roman", el);
                    }
                  }}
                  placeholder="Roman translation"
                  value={roman}
                  onChange={(e) => setRoman(e.target.value)}
                  onClick={() => focusInput && focusInput("add-roman")}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white space-y-3">
            <p className="text-xs font-bold text-[var(--color-paynesgray-dark)] uppercase">Media (Optional)</p>
            <div className="text-xs text-gray-600 mb-1">
              You can add an image and/or record a short audio cue for this category.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-2 max-w-sm">
                <label className="block text-xs font-semibold text-gray-700">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="border border-gray-300 p-2.5 rounded-lg w-full text-sm bg-white file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] file:transition-all"
                  title="Upload Category Image"
                />
              </div>
              <div className="space-y-2 max-w-sm">
                <label className="block text-xs font-semibold text-gray-700">Category Audio</label>
                <AudioRecorder
                  maxDuration={6}
                  onAudioRecorded={(file) => setAudio(file)}
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleAdd}
              disabled={isAddingCategory}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-gunmetal)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--color-gunmetal-dark)] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              {isAddingCategory ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  Add Category
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 🔍 Search + List - shown only in List view */}
      {viewMode === "list" && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={searchInputRef}
                placeholder="Search categories, description, translations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={handleSearchInputClick}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none text-gray-800 font-lato shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {filteredCategories.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white text-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Description</th>
                      <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Translations</th>
                      <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Media</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {filteredCategories.map((cat) => (
                      editingCategory === cat._id ? (
                        <tr key={cat._id} className="bg-[var(--color-background)]">
                          <td colSpan={5} className="p-4">
                            <div className="flex flex-col gap-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        ref={(el) => {
                          if (el && registerInput) {
                            inputRefs.current["edit-word"] = el;
                            registerInput("edit-word", el);
                          }
                        }}
                        value={editForm.word}
                        onChange={(e) =>
                          setEditForm({ ...editForm, word: e.target.value })
                        }
                        onClick={() => focusInput && focusInput("edit-word")}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                        placeholder="Edit category word"
                      />
                      <input
                        ref={(el) => {
                          if (el && registerInput) {
                            inputRefs.current["edit-desc"] = el;
                            registerInput("edit-desc", el);
                          }
                        }}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        onClick={() => focusInput && focusInput("edit-desc")}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                        placeholder="Edit description"
                      />
                      <input
                        ref={(el) => {
                          if (el && registerInput) {
                            inputRefs.current["edit-english"] = el;
                            registerInput("edit-english", el);
                          }
                        }}
                        value={editForm.english}
                        onChange={(e) =>
                          setEditForm({ ...editForm, english: e.target.value })
                        }
                        onClick={() => focusInput && focusInput("edit-english")}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                        placeholder="English translation"
                      />
                      <input
                        ref={(el) => {
                          if (el && registerInput) {
                            inputRefs.current["edit-urdu"] = el;
                            registerInput("edit-urdu", el);
                          }
                        }}
                        value={editForm.urdu}
                        onChange={(e) =>
                          setEditForm({ ...editForm, urdu: e.target.value })
                        }
                        onClick={() => focusInput && focusInput("edit-urdu")}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                        placeholder="Urdu translation"
                      />
                      <input
                        ref={(el) => {
                          if (el && registerInput) {
                            inputRefs.current["edit-roman"] = el;
                            registerInput("edit-roman", el);
                          }
                        }}
                        value={editForm.roman}
                        onChange={(e) =>
                          setEditForm({ ...editForm, roman: e.target.value })
                        }
                        onClick={() => focusInput && focusInput("edit-roman")}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                        placeholder="Roman translation"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditImage(e.target.files[0])}
                        className="border p-2 rounded-lg file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] file:transition-all"
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleUpdate(cat._id)}
                        disabled={isUpdatingCategory}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingCategory ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-2 bg-[var(--color-paynesgray)] hover:bg-[var(--color-paynesgray-dark)] text-white rounded-md transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
                      ) : (
                        <tr
                          key={cat._id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedCategoryDetails(cat)}
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md border object-cover flex-shrink-0 overflow-hidden bg-gradient-to-br from-[var(--color-coral)]/10 to-[var(--color-paynesgray)]/10 flex items-center justify-center">
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt={cat.word}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target.style.display = "none")}
                                  />
                                ) : (
                                  <ImageIcon size={18} className="text-gray-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--color-gunmetal-darker)] text-sm md:text-base">
                                  {cat.word}
                                </p>
                                {cat.description && (
                                  <p className="text-xs text-gray-500 md:hidden mt-1 line-clamp-2">
                                    {cat.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell align-top">
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                              {cat.description || "-"}
                            </p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell align-top">
                            {cat.translation ? (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-[var(--color-paynesgray-dark)]">
                                {cat.translation.english && (
                                  <span className="inline-flex items-center">
                                    <span className="font-semibold text-[var(--color-gunmetal-darker)] mr-1">EN:</span>
                                    <span className="truncate max-w-[120px] lg:max-w-[160px]">{cat.translation.english}</span>
                                  </span>
                                )}
                                {cat.translation.urdu && (
                                  <span className="inline-flex items-center">
                                    <span className="font-semibold text-[var(--color-gunmetal-darker)] mr-1">UR:</span>
                                    <span className="truncate max-w-[120px] lg:max-w-[160px]">{cat.translation.urdu}</span>
                                  </span>
                                )}
                                {cat.translation.roman && (
                                  <span className="inline-flex items-center">
                                    <span className="font-semibold text-[var(--color-gunmetal-darker)] mr-1">RO:</span>
                                    <span className="truncate max-w-[120px] lg:max-w-[160px]">{cat.translation.roman}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell align-top">
                            <span className="text-xs text-gray-600">
                              {cat.image && "Image"}
                              {cat.image && cat.audio && " • "}
                              {cat.audio && "Audio"}
                              {!cat.image && !cat.audio && "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(cat._id);
                                  setEditForm({
                                    word: cat.word,
                                    description: cat.description || "",
                                    english: cat.translation?.english || "",
                                    urdu: cat.translation?.urdu || "",
                                    roman: cat.translation?.roman || "",
                                  });
                                }}
                                className="p-2 bg-[var(--color-gunmetal)] hover:bg-[var(--color-gunmetal-dark)] text-white rounded-md transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(cat._id);
                                }}
                                className="p-2 bg-[var(--color-coral-dark)] hover:bg-[var(--color-coral-darker)] text-white rounded-md transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No categories found</div>
            )}
          </div>
        </>
      )}

      {/* Category Details Modal - match public CategoryCard popup with placeholder image */}
      {selectedCategoryDetails && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          onClick={() => setSelectedCategoryDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-gunmetal)] leading-snug">
                  {selectedCategoryDetails.word}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryDetails(null)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-coral)] text-[var(--color-coral)] hover:bg-[var(--color-coral)]/5 transition"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:gap-5">
                {/* Image block with placeholder */}
                <div className="md:w-5/12 mb-3 md:mb-0">
                  {selectedCategoryDetails.image ? (
                    <img
                      src={selectedCategoryDetails.image}
                      alt={selectedCategoryDetails.word}
                      className="w-full rounded-xl object-cover max-h-64"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-40 rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-[var(--color-coral)]/5 to-[var(--color-paynesgray)]/5 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="md:flex-1 space-y-4 text-sm md:text-base text-[var(--color-gunmetal)]">
                  {selectedCategoryDetails.translation && (
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1">Translations</p>
                      {selectedCategoryDetails.translation.english && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">English:</span>
                          <span>{selectedCategoryDetails.translation.english}</span>
                        </div>
                      )}
                      {selectedCategoryDetails.translation.urdu && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">Urdu:</span>
                          <span>{selectedCategoryDetails.translation.urdu}</span>
                        </div>
                      )}
                      {selectedCategoryDetails.translation.roman && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">Roman:</span>
                          <span>{selectedCategoryDetails.translation.roman}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCategoryDetails.description && (
                    <div className="space-y-1 pt-3 border-t border-gray-200">
                      <p className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1">Description</p>
                      <p className="text-gray-700 font-lato text-sm md:text-base leading-relaxed">
                        {selectedCategoryDetails.description}
                      </p>
                    </div>
                  )}

                  {selectedCategoryDetails.audio && (
                    <div className="space-y-1 pt-3 border-t border-gray-200">
                      <label className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1 block">Audio</label>
                      <audio
                        controls
                        src={selectedCategoryDetails.audio}
                        className="w-full h-9 rounded-lg"
                        controlsList="nodownload"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
