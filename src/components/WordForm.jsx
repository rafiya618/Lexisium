import { useState, useEffect } from "react";
import KeyboardInput from "./KeyboardInput";
import AudioRecorder from "./AudioRecorder";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import { Loader2 } from "lucide-react";

export default function WordForm({ 
  initialData = {}, 
  categories = [], 
  onSubmit, 
  onCancel, 
  submitLabel = "Submit",
  showCategorySelect = true 
}) {
  const [word, setWord] = useState(initialData.word || "");
  const [english, setEnglish] = useState(initialData.translation?.english || "");
  const [urdu, setUrdu] = useState(initialData.translation?.urdu || "");
  const [roman, setRoman] = useState(initialData.translation?.roman || "");
  const [desc, setDesc] = useState(initialData.description || "");
  const [selectedCategory, setSelectedCategory] = useState(
    initialData.selectedCategory || initialData.category?._id || ""
  );
  const [audio, setAudio] = useState(null);
  const [image, setImage] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  // Update selectedCategory when initialData changes
  useEffect(() => {
    const newCategory = initialData.selectedCategory || initialData.category?._id || "";
    if (newCategory && newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
    }
  }, [initialData, selectedCategory]);

  const handleSubmit = async () => {
    if (!word.trim()) {
      showAlert("Please enter a word", "warning");
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    // Validate media files
    const hasMediaIssues = (image && image.size > 5 * 1024 * 1024) || (audio && audio.size > 2 * 1024 * 1024);
    
    if (hasMediaIssues) {
      showConfirm(
        "Image or Audio file size is too large and cannot be uploaded. Do you want to proceed with just the text data?",
        () => {
          submitFormData(true); // Submit without media
          setConfirmDialog({ isOpen: false, message: "", onConfirm: null });
        }
      );
      return;
    }

    await submitFormData(false);
  };

  const submitFormData = async (skipMedia) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("word", word);
    formData.append("translation", JSON.stringify({ english, urdu, roman }));
    if (selectedCategory) {
      formData.append("category", selectedCategory);
    }
    formData.append("description", desc);
    
    if (!skipMedia) {
      if (audio) formData.append("audio", audio);
      if (image) formData.append("image", image);
    }

    try {
      await onSubmit(formData);
      if (skipMedia) {
        showAlert("Word submitted successfully without media files", "info");
      }
    } catch (error) {
      showAlert("Error submitting word: " + (error.message || "Unknown error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setWord("");
    setEnglish("");
    setUrdu("");
    setRoman("");
    setDesc("");
    setSelectedCategory("");
    setAudio(null);
    setImage(null);
    showAlert("Form cleared successfully", "info");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert("Image size must be less than 5MB", "warning");
        e.target.value = "";
        return;
      }
      setImage(file);
      showAlert("Image selected successfully", "success");
    }
  };

  const handleAudioRecorded = (audioBlob) => {
    if (audioBlob) {
      if (audioBlob.size > 2 * 1024 * 1024) {
        showAlert("Audio size must be less than 2MB", "warning");
        return;
      }
      setAudio(audioBlob);
      showAlert("Audio recorded successfully", "success");
    }
  };

  return (
    <div className="border-2 border-gray-200 p-6 rounded-xl bg-[var(--color-background)] shadow-sm">
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

      {showCategorySelect ? (
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        selectedCategory && (
          <div className="mb-4 p-3 border border-blue-300 rounded-lg">
            <span className="text-sm text-[var(--color-paynesgray-light)] font-lato">
              Adding to category: <strong>{categories.find(cat => cat._id === selectedCategory)?.name || 'Selected Category'}</strong>
            </span>
          </div>
        )
      )}

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Pashto Word:</label>
          <KeyboardInput
            placeholder="پښتو کلمه"
            value={word}
            onChange={setWord}
            language="pashto"
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600 placeholder:text-gray-400"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold text-gray-700">English Translation:</label>
          <input
            type="text"
            placeholder="English Translation"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600 placeholder:text-gray-400"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Urdu Translation:</label>
          <KeyboardInput
            placeholder="اردو ترجمہ"
            value={urdu}
            onChange={setUrdu}
            language="urdu"
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600 placeholder:text-gray-400"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Roman Translation:</label>
          <KeyboardInput
            placeholder="Roman Translation"
            value={roman}
            onChange={setRoman}
            language="roman"
            className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">Audio Recording (Max 6 seconds, Max 2MB):</label>
        <AudioRecorder 
          onAudioRecorded={handleAudioRecorded}
          maxDuration={6}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">Image (Optional, Max 5MB):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          className="border-2 border-gray-300 p-3 w-full rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] transition-all" 
        />
        {image && (
          <p className="text-sm text-green-600 mt-2 font-lato">
            ✓ Image selected: {image.name} ({(image.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">Description (Optional):</label>
        <KeyboardInput
          placeholder="Additional description or notes..."
          value={desc}
          onChange={setDesc}
          language="urdu"
          isTextarea={true}
          rows={3}
          className="border-2 border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none transition-all text-gray-600 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-[var(--color-gunmetal)] text-white px-6 py-3 rounded-lg font-lato font-semibold hover:bg-[var(--color-coral-dark)] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            submitLabel
          )}
        </button>
        
        <button 
          onClick={resetForm}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-lato font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Form
        </button>
        
        
      </div>
    </div>
  );
}