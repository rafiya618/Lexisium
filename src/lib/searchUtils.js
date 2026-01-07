/**
 * Comprehensive search utility for searching across all fields in word documents
 * Searches words, meanings, dialects, categories, descriptions, etc.
 */

/**
 * Perform comprehensive search on word documents
 * @param {Array} words - Array of word documents to search
 * @param {string} query - Search query string
 * @returns {Array} Filtered words matching the query
 */
export const searchWords = (words, query) => {
  if (!query.trim()) return words;

  const searchTerm = query.toLowerCase().trim();

  return words.filter((wordDoc) => {
    // Search in category word and translation
    if (
      wordDoc.category?.word?.toLowerCase().includes(searchTerm) ||
      wordDoc.category?.translation?.english?.toLowerCase().includes(searchTerm) ||
      wordDoc.category?.translation?.urdu?.toLowerCase().includes(searchTerm) ||
      wordDoc.category?.translation?.roman?.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }

    // Search in word dialects and meanings
    if (wordDoc.words && Array.isArray(wordDoc.words)) {
      return wordDoc.words.some((dialectWord) => {
        // Search word text
        if (dialectWord.word?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search dialect
        if (dialectWord.dialect?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search descriptions
        if (dialectWord.description?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search meanings (English, Urdu, Roman)
        if (dialectWord.meanings && Array.isArray(dialectWord.meanings)) {
          return dialectWord.meanings.some((meaning) => {
            return (
              meaning.value?.toLowerCase().includes(searchTerm) ||
              meaning.language?.toLowerCase().includes(searchTerm)
            );
          });
        }

        return false;
      });
    }

    return false;
  });
};

/**
 * Search categories by word, translation, and description
 * @param {Array} categories - Array of category documents
 * @param {string} query - Search query string
 * @returns {Array} Filtered categories
 */
export const searchCategories = (categories, query) => {
  if (!query.trim()) return categories;

  const searchTerm = query.toLowerCase().trim();

  return categories.filter((category) => {
    return (
      category.word?.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm) ||
      category.translation?.english?.toLowerCase().includes(searchTerm) ||
      category.translation?.urdu?.toLowerCase().includes(searchTerm) ||
      category.translation?.roman?.toLowerCase().includes(searchTerm)
    );
  });
};

/**
 * Get all searchable text from a word document (for highlighting)
 * @param {Object} wordDoc - Word document
 * @returns {Array} Array of all searchable text fields
 */
export const getSearchableText = (wordDoc) => {
  const texts = [];

  // Category info
  if (wordDoc.category) {
    texts.push(wordDoc.category.word);
    if (wordDoc.category.translation) {
      texts.push(wordDoc.category.translation.english);
      texts.push(wordDoc.category.translation.urdu);
      texts.push(wordDoc.category.translation.roman);
    }
  }

  // Word info
  if (wordDoc.words && Array.isArray(wordDoc.words)) {
    wordDoc.words.forEach((dialectWord) => {
      texts.push(dialectWord.word);
      texts.push(dialectWord.dialect);
      texts.push(dialectWord.description);

      if (dialectWord.meanings && Array.isArray(dialectWord.meanings)) {
        dialectWord.meanings.forEach((meaning) => {
          texts.push(meaning.value);
        });
      }
    });
  }

  return texts.filter(Boolean);
};

/**
 * Highlight search term in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search term
 * @returns {string} HTML with highlighted term
 */
export const highlightSearchTerm = (text, query) => {
  if (!text || !query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};
