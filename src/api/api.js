import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- CATEGORY ---
export const getCategories = async () => {
  const res = await API.get("/categories");
  return res.data.categories || [];
};

export const addCategory = async (fd) => API.post("/categories", fd);
export const deleteCategory = async (id) => API.delete(`/categories/${id}`);
export const updateCategory = async (id, data) => API.put(`/categories/${id}`, data);
export const searchCategory = async (query) =>
  API.get(`/categories/search?query=${query}`);

// --- WORDS ---
export const getWords = async () => {
  const res = await API.get("/words");
  return res.data.words || [];
};

export const getApprovedWords = async () => {
  const res = await API.get("/words/approved");
  return res.data.words || [];
};

export const getHiddenWords = async () => {
  const res = await API.get("/words/hidden");
  return res.data.words || [];
};

export const getPendingWords = async () => {
  const res = await API.get("/words/pending");
  return res.data.words || [];
};

export const getWordsByCategory = async (categoryId) => {
  const res = await API.get(`/words/category/${categoryId}`);
  return res.data.words || [];
};

export const addWord = async (fd) => API.post("/words", fd);
export const deleteWord = async (id) => API.delete(`/words/${id}`);
export const approveWord = async (id) => API.put(`/words/approve/${id}`);
export const hideWord = async (id) => API.put(`/words/hide/${id}`);
export const moveWord = async (id, newCategory) => API.put(`/words/move/${id}`, { newCategory });
export const updateWord = async (id, data) => API.put(`/words/${id}`, data);
export const searchWord = async (query) => API.get(`/words/search?query=${query}`);

// --- ADMIN AUTH ---
export const loginAdmin = async (data) => API.post("/auth/admin-login", data);
