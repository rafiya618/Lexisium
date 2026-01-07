import { useState, useEffect, useContext, useRef } from "react";
import AudioRecorder from "./AudioRecorder";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";
import { Loader2, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { KeyboardContext } from "../context/KeyboardContext";

export default function WordForm({ 
  initialData = {}, 
  categories = [], 
  onSubmit, 
  onCancel, 
  submitLabel = "Submit",
  showCategorySelect = true 
}) {
  const keyboardContext = useContext(KeyboardContext);
  const { registerInput, unregisterInput, focusInput } = keyboardContext || {};
  const inputRefs = useRef({});
  
  const [selectedCategory, setSelectedCategory] = useState(
    initialData.selectedCategory || initialData.category?._id || ""
  );
  
  // Multiple dialects state
  const [dialects, setDialects] = useState(
    initialData.words && initialData.words.length > 0
      ? initialData.words.map(w => ({
          word: w.word || "",
          dialect: w.dialect || "",
          meanings: w.meanings || [],
          audio: w.audio || null,
          audioFile: null,
          description: w.description || "",
          expanded: false
        }))
      : [{ word: "", dialect: "", meanings: [{ language: "english", value: "" }], audio: null, audioFile: null, description: "", expanded: true }]
  );

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [openLanguageKey, setOpenLanguageKey] = useState(null);

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

  const addDialect = () => {
    setDialects([
      ...dialects,
      { word: "", dialect: "", meanings: [{ language: "english", value: "" }], audio: null, audioFile: null, description: "", expanded: true }
    ]);
    showAlert("New dialect field added", "info");
  };

  const removeDialect = (index) => {
    if (dialects.length === 1) {
      showAlert("You must have at least one dialect", "warning");
      return;
    }
    const newDialects = dialects.filter((_, i) => i !== index);
    setDialects(newDialects);
    showAlert("Dialect removed", "info");
  };

  const updateDialect = (index, field, value) => {
    const newDialects = [...dialects];
    newDialects[index][field] = value;
    setDialects(newDialects);
  };

  const updateMeaning = (dialectIndex, meaningIndex, field, value) => {
    const newDialects = [...dialects];
    newDialects[dialectIndex].meanings[meaningIndex][field] = value;
    setDialects(newDialects);
  };

  const addMeaning = (dialectIndex) => {
    const newDialects = [...dialects];
    newDialects[dialectIndex].meanings.push({ language: "urdu", value: "" });
    setDialects(newDialects);
  };

  const removeMeaning = (dialectIndex, meaningIndex) => {
    const newDialects = [...dialects];
    if (newDialects[dialectIndex].meanings.length === 1) {
      showAlert("Each dialect must have at least one meaning", "warning");
      return;
    }
    newDialects[dialectIndex].meanings = newDialects[dialectIndex].meanings.filter((_, i) => i !== meaningIndex);
    setDialects(newDialects);
  };

  const toggleExpandDialect = (index) => {
    const newDialects = [...dialects];
    newDialects[index].expanded = !newDialects[index].expanded;
    setDialects(newDialects);
  };

  const handleAudioRecorded = (audioBlob, dialectIndex) => {
    if (audioBlob) {
      if (audioBlob.size > 2 * 1024 * 1024) {
        showAlert("Audio size must be less than 2MB", "warning");
        return;
      }
      const newDialects = [...dialects];
      newDialects[dialectIndex].audioFile = audioBlob;
      setDialects(newDialects);
      showAlert("Audio recorded successfully", "success");
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!selectedCategory.trim()) {
      showAlert("Please select a category", "warning");
      return;
    }

    for (let i = 0; i < dialects.length; i++) {
      if (!dialects[i].word.trim()) {
        showAlert(`Dialect ${i + 1}: Please enter a word`, "warning");
        return;
      }
      if (!dialects[i].dialect.trim()) {
        showAlert(`Dialect ${i + 1}: Please enter a dialect name (e.g., Kandahari, Yousafzai)`, "warning");
        return;
      }
      if (dialects[i].meanings.length === 0 || !dialects[i].meanings.some(m => m.value.trim())) {
        showAlert(`Dialect ${i + 1}: Please add at least one meaning`, "warning");
        return;
      }
    }

    if (isSubmitting) return;

    await submitFormData();
  };

  const submitFormData = async () => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("category", selectedCategory);
    // uploadedBy will be handled by backend when auth is implemented
    
    const wordsData = dialects.map(d => ({
      word: d.word,
      dialect: d.dialect,
      meanings: d.meanings.filter(m => m.value.trim()),
      description: d.description
    }));

    formData.append("words", JSON.stringify(wordsData));

    // Add audio files
    dialects.forEach((d, index) => {
      if (d.audioFile) {
        console.log(`WordForm - Adding audio[${index}]:`, d.audioFile);
        formData.append(`audio[${index}]`, d.audioFile);
      } else {
        console.log(`WordForm - No audio for dialect ${index}`);
      }
    });

    console.log("WordForm - FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      await onSubmit(formData);
      showAlert("Word submitted successfully!", "success");
      // Reset form
      setDialects([{ word: "", dialect: "", meanings: [{ language: "english", value: "" }], audio: null, audioFile: null, description: "", expanded: true }]);
      setSelectedCategory("");
    } catch (error) {
      showAlert("Error submitting word: " + (error.response?.data?.message || error.message || "Unknown error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Category:</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className="border border-gray-300 p-3 w-full rounded-lg pr-10 flex items-center justify-between text-left focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all text-gray-700 bg-white hover:border-gray-400"
            >
              <span className={selectedCategory ? "" : "text-gray-400"}>
                {selectedCategory
                  ? categories.find((cat) => cat._id === selectedCategory)?.word || "Selected Category"
                  : "Select a category..."}
              </span>
              <ChevronDown
                size={18}
                className={`text-[var(--color-paynesgray)] transition-transform ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setIsCategoryOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[var(--color-background)]"
                >
                  Select a category...
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat._id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-background)] ${
                      selectedCategory === cat._id
                        ? "bg-[var(--color-background)] font-semibold text-[var(--color-gunmetal-darker)]"
                        : "text-gray-700"
                    }`}
                  >
                    {cat.word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        selectedCategory && (
          <div className="p-3 border border-[var(--color-border)] bg-[var(--color-background)] rounded-lg">
            <span className="text-sm text-[var(--color-gunmetal)] font-lato">
              Adding to category: <strong>{categories.find(cat => cat._id === selectedCategory)?.word || "Selected Category"}</strong>
            </span>
          </div>
        )
      )}

      <h3 className="text-xl font-bold text-[var(--color-gunmetal-darker)]">Add Words (Multiple Dialects)</h3>

      {/* Dialects List */}
      <div className="space-y-3">
        {dialects.map((dialect, dialectIndex) => (
          <div key={dialectIndex} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Dialect Header */}
            <div className="bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-coral-dark)] text-white p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
              onClick={() => toggleExpandDialect(dialectIndex)}>
              <div className="flex items-center gap-3 flex-1">
                {dialect.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                <span className="font-semibold">
                  Dialect {dialectIndex + 1}: {dialect.word || "New Dialect"} ({dialect.dialect || "Dialect Name"})
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDialect(dialectIndex);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors border border-gray-300"
                title="Remove dialect"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dialect Content */}
            {dialect.expanded && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Word:</label>
                    <input
                      ref={(el) => {
                        if (el && registerInput) {
                          inputRefs.current[`word-${dialectIndex}`] = el;
                          registerInput(`word-${dialectIndex}`, el);
                        }
                      }}
                      type="text"
                      placeholder="Enter the word"
                      value={dialect.word}
                      onChange={(e) => updateDialect(dialectIndex, "word", e.target.value)}
                      onClick={() => focusInput && focusInput(`word-${dialectIndex}`)}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Dialect Name:</label>
                    <input
                      type="text"
                      placeholder="e.g., Kandahari, Yousafzai, Kohistani"
                      value={dialect.dialect}
                      onChange={(e) => updateDialect(dialectIndex, "dialect", e.target.value)}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Meanings */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <label className="block font-semibold text-gray-700">Meanings:</label>
                    <button
                      onClick={() => addMeaning(dialectIndex)}
                      className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors font-medium"
                    >
                      <Plus size={14} />
                      Add Meaning
                    </button>
                  </div>

                  <div className="space-y-2 pl-2 border-l-4 border-gray-300">
                    {dialect.meanings.map((meaning, meaningIndex) => (
                      <div
                        key={meaningIndex}
                        className="flex flex-col sm:flex-row gap-2 sm:items-center"
                      >
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const key = `${dialectIndex}-${meaningIndex}`;
                              setOpenLanguageKey((prev) => (prev === key ? null : key));
                            }}
                            className="border border-gray-300 p-2 pr-8 rounded-lg text-sm bg-white hover:border-gray-400 focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all flex items-center justify-start min-w-[130px] h-[40px]"
                          >
                            <span className="mr-2 text-gray-700 capitalize">{meaning.language}</span>
                          </button>
                          <ChevronDown
                            size={16}
                            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-paynesgray)] transition-transform ${
                              openLanguageKey === `${dialectIndex}-${meaningIndex}` ? "rotate-180" : ""
                            }`}
                          />
                          {openLanguageKey === `${dialectIndex}-${meaningIndex}` && (
                            <div className="absolute z-20 mt-1 w-full rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden">
                              {[
                                { value: "english", label: "English" },
                                { value: "urdu", label: "Urdu" },
                                { value: "roman", label: "Roman" },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    updateMeaning(dialectIndex, meaningIndex, "language", opt.value);
                                    setOpenLanguageKey(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-background)] ${
                                    meaning.language === opt.value
                                      ? "bg-[var(--color-background)] font-semibold text-[var(--color-gunmetal-darker)]"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          ref={(el) => {
                            if (el && registerInput) {
                              inputRefs.current[`meaning-${dialectIndex}-${meaningIndex}`] = el;
                              registerInput(`meaning-${dialectIndex}-${meaningIndex}`, el);
                            }
                          }}
                          type="text"
                          placeholder={`${meaning.language.charAt(0).toUpperCase() + meaning.language.slice(1)} meaning`}
                          value={meaning.value}
                          onChange={(e) => updateMeaning(dialectIndex, meaningIndex, "value", e.target.value)}
                          onClick={() => focusInput && focusInput(`meaning-${dialectIndex}-${meaningIndex}`)}
                          className="border border-gray-300 p-2 rounded-lg flex-1 h-[40px] focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all w-full"
                        />

                        <button
                          onClick={() => removeMeaning(dialectIndex, meaningIndex)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors border border-gray-300"
                          title="Remove meaning"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Audio Recording (Max 2MB):</label>
                  <AudioRecorder 
                    onAudioRecorded={(blob) => handleAudioRecorded(blob, dialectIndex)}
                    maxDuration={6}
                  />
                  {dialect.audioFile && (
                    <p className="text-sm text-green-600 mt-2 font-lato">
                      ✓ Audio recorded
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Description (Optional):</label>
                  <textarea
                    ref={(el) => {
                      if (el && registerInput) {
                        inputRefs.current[`desc-${dialectIndex}`] = el;
                        registerInput(`desc-${dialectIndex}`, el);
                      }
                    }}
                    placeholder="Additional notes about this dialect word..."
                    value={dialect.description}
                    onChange={(e) => updateDialect(dialectIndex, "description", e.target.value)}
                    onClick={() => focusInput && focusInput(`desc-${dialectIndex}`)}
                    rows={2}
                    className="border border-gray-300 w-full p-3 rounded-lg focus:ring-1 focus:ring-[var(--color-paynesgray)] focus:border-[var(--color-paynesgray)] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Dialect Button */}
      <button
        onClick={addDialect}
        className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
      >
        <Plus size={18} />
        Add Another Dialect
      </button>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
        
        {onCancel && (
          <button 
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-lato font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}