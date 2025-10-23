import { useEffect, useState } from "react";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  searchCategory,
} from "../api/api";
import { Edit3, Trash2, PlusCircle, CheckCircle, XCircle, Keyboard, Search, Loader2 } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";
import CustomAlert from "./CustomAlert";
import ConfirmDialog from "./ConfirmDialog";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editImage, setEditImage] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearchKeyboardVisible, setSearchKeyboardVisible] = useState(false);
  const [keyboardLanguage, setKeyboardLanguage] = useState("roman");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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
    if (!name.trim()) {
      showAlert("Please enter a category name", "warning");
      return;
    }
    
    setIsAddingCategory(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", desc);
      if (image) fd.append("image", image);
      await addCategory(fd);
      setName("");
      setDesc("");
      setImage(null);
      await load();
      showAlert("Category added successfully!", "success");
    } catch (error) {
      showAlert("Failed to add category", "error");
    } finally {
      setIsAddingCategory(false);
    }
  };

  // 🟡 Update Category
  const handleUpdate = async (id) => {
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("description", editForm.description);
      if (editImage) fd.append("image", editImage);

      await updateCategory(id, fd);
      setEditingCategory(null);
      setEditForm({ name: "", description: "" });
      setEditImage(null);
      await load();
      showAlert("Category updated successfully!", "success");
    } catch (error) {
      showAlert("Failed to update category", "error");
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
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const res = await searchCategory(query);
        setCategories(res.data.categories);
      } catch (error) {
        console.error("Error searching categories:", error);
      }
    } else {
      load();
    }
  };

  const handleKeyPress = (key) => {
    if (key === "BACKSPACE") setDesc((prev) => prev.slice(0, -1));
    else setDesc((prev) => prev + key);
  };

  const handleSearchKeyPress = (key) => {
    if (key === "BACKSPACE") setSearchQuery((prev) => prev.slice(0, -1));
    else setSearchQuery((prev) => prev + key);
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
        Manage Categories
      </h3>

      {/* ➕ Add Category */}
      <div className="mb-6 bg-[var(--color-background)] border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-coral)]"
          />

          <div className="relative">
            <input
              placeholder="Category Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-[var(--color-coral)] pr-10"
            />
            <button
              type="button"
              onClick={() => setKeyboardVisible((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition"
              title="Show Virtual Keyboard"
            >
              <Keyboard size={18} className="text-[var(--color-coral)]" />
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="border p-2 rounded-lg file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] file:transition-all"
          />
        </div>

        {isKeyboardVisible && (
          <div className="mt-3">
            <VirtualKeyboard
              language={keyboardLanguage}
              onKeyPress={handleKeyPress}
              isVisible={isKeyboardVisible}
              onToggle={() => setKeyboardVisible(false)}
            />
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={isAddingCategory}
          className="flex items-center gap-2 bg-[var(--color-coral)] text-white px-5 py-2 rounded-lg hover:bg-[var(--color-coral-dark)] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* 🔍 Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-2 border-gray-300 p-2.5 pl-10 pr-12 rounded-lg w-full outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] transition-all"
          />
          <button
            type="button"
            onClick={() => setSearchKeyboardVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition"
            title="Toggle Virtual Keyboard"
          >
            <Keyboard size={20} className="text-[var(--color-coral)]" />
          </button>
        </div>

        {/* Virtual Keyboard for Search */}
        {isSearchKeyboardVisible && (
          <div className="mt-3">
            <VirtualKeyboard
              language="urdu"
              onKeyPress={handleSearchKeyPress}
              isVisible={isSearchKeyboardVisible}
              onToggle={() => setSearchKeyboardVisible(false)}
            />
          </div>
        )}
      </div>

      {/* 📋 Category List */}
      <div className="bg-[var(--color-background)] shadow border rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-300">
          {categories.length ? (
            categories.map((cat) => (
              <div key={cat._id} className="p-5 hover:bg-gray-200 transition">
                {editingCategory === cat._id ? (
                  // ✏️ Edit Mode
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="border p-2 rounded-lg w-full md:w-1/3"
                      placeholder="Edit category name"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      className="border p-2 rounded-lg w-full md:w-1/2"
                      placeholder="Edit description"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImage(e.target.files[0])}
                      className="border p-2 rounded-lg w-full md:w-1/4 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-coral)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-coral-dark)] file:transition-all"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(cat._id)}
                        className="p-2 bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white rounded-md transition-all"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-2 bg-[var(--color-paynesgray)] hover:bg-[var(--color-paynesgray-dark)] text-white rounded-md transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // 📦 Normal View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {cat.image && (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-14 h-14 rounded-lg border object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <div>
                        <div className="font-semibold text-[var(--color-gunmetal)] text-lg">
                          {cat.name}
                        </div>
                        {cat.description && (
                          <p className="text-gray-600 text-sm">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat._id);
                          setEditForm({
                            name: cat.name,
                            description: cat.description || "",
                          });
                        }}
                        className="p-2 bg-[var(--color-gunmetal)] hover:bg-[var(--color-gunmetal-dark)] text-white rounded-md transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 bg-[var(--color-coral-dark)] hover:bg-[var(--color-coral-darker)] text-white rounded-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No categories found</p>
          )}
        </div>
      </div>
    </>
  );
}
