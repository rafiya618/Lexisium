import { useEffect, useState } from "react";
import { getPendingWords, approveWord, hideWord, deleteWord, moveWord, getCategories } from "../api/api";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import { CheckCircle, EyeOff, Trash2, Volume2, Image as ImageIcon, MoveRight } from "lucide-react";

export default function NewWords() {
  const [pending, setPending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });

  const fetchData = async () => {
    try {
      const pendingWords = await getPendingWords();
      setPending(pendingWords);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPending([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (error) {
      showAlert("Error approving word: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  const handleHide = async (id) => {
    try {
      await hideWord(id);
      fetchData();
      showAlert("Word hidden successfully!", "success");
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
      } catch (error) {
        showAlert("Error deleting word: " + (error.response?.data?.message || "Unknown error"), "error");
      }
      setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
    });
  };

  const handleMove = async (wordId, newCategoryId) => {
    if (!newCategoryId) return;
    try {
      await moveWord(wordId, newCategoryId);
      fetchData();
      showAlert("Word moved and approved successfully!", "success");
    } catch (error) {
      showAlert("Error moving word: " + (error.response?.data?.message || "Unknown error"), "error");
    }
  };

  const handleReject = async (id) => {
    showConfirm("Are you sure you want to reject this word submission?", async () => {
      try {
        await deleteWord(id);
        fetchData();
        showAlert("Word submission rejected", "success");
      } catch (error) {
        showAlert("Failed to reject word", "error");
      }
      setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
    });
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

      <h3 className="text-3xl font-bold text-gray-800 tracking-tight mb-6">
        Pending Words for Review
      </h3>
      
      {pending.length > 0 ? (
        <div className="bg-[var(--color-background)] shadow border rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-300">
            {pending.map((w) => (
              <div key={w._id} className="p-5 hover:bg-gray-200 transition">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Text Information */}
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
                    
                    {/* Description */}
                    {w.description && (
                      <div className="text-sm text-gray-800 mb-2 p-3 bg-gray-100 border border-gray-200 rounded-lg leading-relaxed">
                        <span className="font-semibold text-gray-900">Description:</span><br />
                        {w.description}
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        Category: {w.category?.name}
                      </span>
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Status: {w.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right Column - Media & Actions */}
                  <div>
                    {/* Audio */}
                    {w.audio && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Volume2 size={16} /> Audio:
                        </div>
                        <audio controls src={w.audio} className="w-full h-[35px]" />
                      </div>
                    )}
                    
                    {/* Image */}
                    {w.image && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <ImageIcon size={16} /> Image:
                        </div>
                        <img 
                          src={w.image} 
                          alt={w.word}
                          className="w-full max-w-[160px] rounded-lg border shadow-sm"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    
                    {/* Move to Category */}
                    <div className="mb-3">
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                        <MoveRight size={16} /> Move to Category:
                      </label>
                      <select 
                        onChange={(e) => handleMove(w._id, e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all bg-white"
                        defaultValue=""
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Action Buttons */}
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
        </div>
      ) : (
        <div className="text-center py-16 bg-silver-light/10 rounded-2xl border-2 border-dashed border-silver">
          <p className="text-xl font-lato text-paynesgray-dark">No pending words to review</p>
          <p className="text-paynesgray font-lato mt-2">All submissions have been processed</p>
        </div>
      )}
    </>
  );
}
