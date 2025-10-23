import { useEffect, useState } from "react";
import {
  getWords, approveWord, hideWord, deleteWord,
  updateWord, searchWord, addWord, getCategories,
  getApprovedWords
} from "../api/api";
import WordForm from "./WordForm";
import {
  CheckCircle, EyeOff, Pencil, Trash2, PlusCircle, XCircle,
  Search, Volume2, Image as ImageIcon, Keyboard
} from "lucide-react";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import VirtualKeyboard from "./VirtualKeyboard";
import KeyboardInput from "./KeyboardInput";
import AudioRecorder from "./AudioRecorder";

export default function WordManager() {
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingWord, setEditingWord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({
    word: "",
    translation: { english: "", urdu: "", roman: "" },
    description: "",
    audio: null,
    image: null,
  });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [showEditKeyboard, setShowEditKeyboard] = useState(false);
  const [editKeyboardField, setEditKeyboardField] = useState("");
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);

  const load = async () => {
    try {
      setWords(await getApprovedWords());
      setCategories(await getCategories());
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const res = await searchWord(query);
        setWords(res.data.words);
      } catch (error) {
        console.error("Error searching words:", error);
      }
    } else load();
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
      load();
      showAlert("Word approved successfully!", "success");
    } catch {
      showAlert("Error approving word.", "error");
    }
  };

  const handleHide = async (id) => {
    try {
      await hideWord(id);
      load();
      showAlert("Word hidden successfully!", "success");
    } catch {
      showAlert("Error hiding word.", "error");
    }
  };

  const handleDelete = async (id) => {
    showConfirm("Are you sure you want to delete this word? This action cannot be undone.", async () => {
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

  const startEditing = (word) => {
    setEditingWord(word._id);
    setEditForm({
      word: word.word,
      translation: {
        english: word.translation?.english || "",
        urdu: word.translation?.urdu || "",
        roman: word.translation?.roman || "",
      },
      description: word.description || "",
      audio: null,
      image: null,
    });
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("word", editForm.word);
      formData.append("translation", JSON.stringify(editForm.translation));
      formData.append("description", editForm.description);
      
      if (editForm.audio) formData.append("audio", editForm.audio);
      if (editForm.image) formData.append("image", editForm.image);

      await updateWord(id, formData);
      setEditingWord(null);
      load();
      showAlert("Word updated successfully!", "success");
    } catch {
      showAlert("Error updating word.", "error");
    }
  };

  const handleEditKeyPress = (key) => {
    if (key === "BACKSPACE") {
      if (editKeyboardField === "word") {
        setEditForm({ ...editForm, word: editForm.word.slice(0, -1) });
      } else if (editKeyboardField === "urdu") {
        setEditForm({
          ...editForm,
          translation: { ...editForm.translation, urdu: editForm.translation.urdu.slice(0, -1) }
        });
      } else if (editKeyboardField === "roman") {
        setEditForm({
          ...editForm,
          translation: { ...editForm.translation, roman: editForm.translation.roman.slice(0, -1) }
        });
      } else if (editKeyboardField === "description") {
        setEditForm({ ...editForm, description: editForm.description.slice(0, -1) });
      }
    } else {
      if (editKeyboardField === "word") {
        setEditForm({ ...editForm, word: editForm.word + key });
      } else if (editKeyboardField === "urdu") {
        setEditForm({
          ...editForm,
          translation: { ...editForm.translation, urdu: editForm.translation.urdu + key }
        });
      } else if (editKeyboardField === "roman") {
        setEditForm({
          ...editForm,
          translation: { ...editForm.translation, roman: editForm.translation.roman + key }
        });
      } else if (editKeyboardField === "description") {
        setEditForm({ ...editForm, description: editForm.description + key });
      }
    }
  };

  const handleSearchKeyPress = (key) => {
    if (key === "BACKSPACE") {
      setSearchQuery(searchQuery.slice(0, -1));
    } else {
      setSearchQuery(searchQuery + key);
    }
  };

  const handleAddWord = async (formData) => {
    try {
      await addWord(formData);
      setShowAddForm(false);
      load();
      showAlert("Word added successfully!", "success");
    } catch {
      showAlert("Error adding word.", "error");
    }
  };

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
          Word Management
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all
            ${showAddForm
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark)]"
            }`}
        >
          {showAddForm ? <><XCircle size={18} /> Cancel</> : <><PlusCircle size={18} /> Add Word</>}
        </button>
      </div>

      {/* Add Word Form */}
      {showAddForm && (
        <div className="mb-6 bg-[var(--color-background)] shadow rounded-lg p-5 border border-gray-100">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Add New Word</h4>
          <WordForm
            categories={categories}
            onSubmit={handleAddWord}
            onCancel={() => setShowAddForm(false)}
            submitLabel="Add Word"
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Search words..."
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
        {words.length > 0 ? (
          <div className="divide-y divide-gray-300">
            {words.map((w) => (
              <div key={w._id} className="p-5 hover:bg-gray-200 transition">
                {editingWord === w._id ? (
                  <div className="space-y-4 bg-gradient-to-br from-paynesgray/5 to-paynesgray/10 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Edit Word</h4>
                    
                    {/* Pashto Word */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Pashto Word:</label>
                      <div className="relative">
                        <input
                          placeholder="Pashto Word"
                          value={editForm.word}
                          onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                          className="border-2 border-gray-300 p-3 w-full rounded-lg text-gray-600 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none pr-12"
                        />
                        <button
                          onClick={() => {
                            setEditKeyboardField("word");
                            setShowEditKeyboard(!showEditKeyboard);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Keyboard size={20} className="text-[var(--color-coral)]" />
                        </button>
                      </div>
                    </div>
                    
                    {/* English Translation */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">English Translation:</label>
                      <input
                        placeholder="English Translation"
                        value={editForm.translation.english}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            translation: { ...editForm.translation, english: e.target.value },
                          })
                        }
                        className="border-2 border-gray-300 p-3 w-full rounded-lg text-gray-600 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none"
                      />
                    </div>
                    
                    {/* Urdu Translation */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Urdu Translation:</label>
                      <div className="relative">
                        <input
                          placeholder="Urdu Translation"
                          value={editForm.translation.urdu}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              translation: { ...editForm.translation, urdu: e.target.value },
                            })
                          }
                          className="border-2 border-gray-300 p-3 w-full rounded-lg text-gray-600 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none pr-12"
                        />
                        <button
                          onClick={() => {
                            setEditKeyboardField("urdu");
                            setShowEditKeyboard(!showEditKeyboard);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Keyboard size={20} className="text-[var(--color-coral)]" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Roman Translation */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Roman Translation:</label>
                      <div className="relative">
                        <input
                          placeholder="Roman Translation"
                          value={editForm.translation.roman}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              translation: { ...editForm.translation, roman: e.target.value },
                            })
                          }
                          className="border-2 border-gray-300 p-3 w-full rounded-lg text-gray-600 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none pr-12"
                        />
                        <button
                          onClick={() => {
                            setEditKeyboardField("roman");
                            setShowEditKeyboard(!showEditKeyboard);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Keyboard size={20} className="text-[var(--color-coral)]" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Description:</label>
                      <div className="relative">
                        <textarea
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows="3"
                          className="border-2 border-gray-300 p-3 w-full rounded-lg text-gray-600 focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Virtual Keyboard */}
                    {showEditKeyboard && (
                      <div className="mt-3">
                        <VirtualKeyboard
                          language={editKeyboardField === "word" ? "pashto" : editKeyboardField === "urdu" ? "urdu" : "roman"}
                          onKeyPress={handleEditKeyPress}
                          isVisible={showEditKeyboard}
                          onToggle={() => setShowEditKeyboard(false)}
                        />
                      </div>
                    )}

                    {/* Image Upload */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Update Image (Optional):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
                        className="border-2 border-gray-300 p-3 w-full rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] transition-all"
                      />
                      {editForm.image && (
                        <p className="text-sm text-green-600 mt-2 font-lato">
                          ✓ New image selected: {editForm.image.name}
                        </p>
                      )}
                    </div>

                    {/* Audio Upload */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Update Audio (Optional, Max 6 seconds):</label>
                      <AudioRecorder 
                        onAudioRecorded={(audioBlob) => {
                          if (audioBlob) {
                            setEditForm({ ...editForm, audio: audioBlob });
                            showAlert("Audio recorded successfully", "success");
                          }
                        }}
                        maxDuration={6}
                      />
                      {editForm.audio && (
                        <p className="text-sm text-green-600 mt-2 font-lato">
                          ✓ New audio recorded
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleUpdate(w._id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-lato font-semibold"
                      >
                        <CheckCircle size={18} /> Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingWord(null);
                          setShowEditKeyboard(false);
                        }}
                        className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-lato font-semibold"
                      >
                        <XCircle size={18} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
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
                        <span className={`px-2 py-1 rounded ${
                          w.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : w.status === "Hidden"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
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
                          onClick={() => handleApprove(w._id)}
                          className="flex items-center gap-1 bg-[var(--color-coral)] text-white px-4 py-2 rounded-lg text-xs hover:bg-[var(--color-coral-dark)] shadow-sm transition-all"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleHide(w._id)}
                          className="flex items-center gap-1 bg-[var(--color-paynesgray)] text-white px-4 py-2 rounded-lg text-xs hover:bg-[var(--color-paynesgray-dark)] shadow-sm transition-all"
                        >
                          <EyeOff size={14} /> Hide
                        </button>
                        <button
                          onClick={() => startEditing(w)}
                          className="flex items-center gap-1 bg-[var(--color-gunmetal)] text-white px-4 py-2 rounded-lg text-xs hover:bg-[var(--color-gunmetal-dark)] shadow-sm transition-all"
                        >
                          <Pencil size={14} /> Edit
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
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No words found</div>
        )}
      </div>
    </>
  );
}
