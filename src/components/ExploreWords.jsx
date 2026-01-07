import { useEffect, useState } from "react";
import { getApprovedWords } from "../api/api";
import { Search, BookText, Languages, Tag, Volume2 } from "lucide-react";
import { searchWords } from "../lib/searchUtils";

export default function ExploreWords() {
  const [words, setWords] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const approved = await getApprovedWords();
    setAllWords(approved);
    setWords(approved);
  };

  const handleSearch = (query) => {
    setSearch(query);
    const filtered = searchWords(allWords, query);
    setWords(filtered);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-lato">
      {/* Heading */}
      <section className="px-4 sm:px-6 md:px-8 pt-10 pb-0">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-fenix font-bold text-center text-[var(--color-gunmetal-darker)] mb-4">
          Explore Words
        </h2>
      </section>

      {/* Search Bar */}
      <section className="px-4 sm:px-6 md:px-8 pb-0">
        <div className="w-full max-w-6xl lg:max-w-7xl mx-auto">
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search words, meanings, dialect..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[var(--color-coral)] hover:border-[var(--color-coral-dark)] focus:ring-1 focus:ring-[var(--color-coral)] focus:border-[var(--color-coral)] focus:outline-none text-[var(--color-gunmetal-darker)] font-lato shadow-sm bg-[var(--color-background)] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Words Grid */}
      <section className="px-4 sm:px-6 md:px-8 pb-10">
        <div className="w-full max-w-6xl lg:max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {words.length > 0 ? (
              words.map((wordDoc) => (
                <div
                  key={wordDoc._id}
                  className="h-full border border-[var(--color-coral)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-[var(--color-background)] text-left overflow-hidden flex flex-col"
                >
                  {/* Card Content */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-3">
                    {/* Category Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {wordDoc.category && (
                          <div className="flex items-center gap-2 mb-1">
                            <Tag size={14} className="text-[var(--color-coral)]" />
                            <span className="text-xs sm:text-sm font-semibold text-[var(--color-gunmetal-darker)] truncate">
                              {wordDoc.category.word}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dialects */}
                    {wordDoc.words && wordDoc.words.length > 0 ? (
                      <div className="mt-1 space-y-3">
                        {wordDoc.words.map((dialectWord, idx) => (
                          <div
                            key={idx}
                            className="pt-2 border-t border-gray-200 first:border-t-0 first:pt-0 space-y-2"
                          >
                            {/* Word + Dialect row */}
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm sm:text-base">
                              <span className="font-semibold text-[var(--color-paynesgray)]">Word:</span>
                              <span className="font-semibold text-[var(--color-gunmetal-darker)] mr-3">
                                {dialectWord.word}
                              </span>
                              <span className="font-semibold text-[var(--color-paynesgray)]">Dialect:</span>
                              <span className="uppercase tracking-wide text-[var(--color-paynesgray-dark)] text-xs sm:text-sm">
                                {dialectWord.dialect}
                              </span>
                            </div>

                            {/* Meanings section */}
                            {dialectWord.meanings && dialectWord.meanings.length > 0 && (
                              <div className="space-y-1 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 text-[var(--color-paynesgray)] font-semibold">
                                  <Languages size={14} />
                                  <span>Meanings</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 pl-6">
                                  {dialectWord.meanings.map((meaning, midx) => (
                                    <span
                                      key={midx}
                                      className="text-[var(--color-gunmetal-darker)] font-lato"
                                    >
                                      <span className="font-semibold text-[var(--color-paynesgray)] mr-1">
                                        {`${meaning.language?.charAt(0).toUpperCase()}${meaning.language?.slice(1).toLowerCase()}`}:
                                      </span>
                                      {meaning.value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Description section */}
                            {dialectWord.description && (
                              <div className="space-y-1 text-xs sm:text-sm text-gray-700 font-lato leading-snug">
                                <div className="flex items-center gap-2 text-[var(--color-paynesgray)] font-semibold">
                                  <BookText size={14} />
                                  <span>Description</span>
                                </div>
                                <p className="pl-6">{dialectWord.description}</p>
                              </div>
                            )}

                            {/* Audio section */}
                            {dialectWord.audio && (
                              <div className="space-y-1 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 text-[var(--color-paynesgray)] font-semibold">
                                  <Volume2 size={14} className="text-[var(--color-paynesgray)]" />
                                  <span>Audio</span>
                                </div>
                                <div className="pl-6">
                                  <audio
                                    controls
                                    src={dialectWord.audio}
                                    className="w-full h-8 rounded-lg"
                                    controlsList="nodownload"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 italic py-1">No dialect variants found.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-[var(--color-silver-dark)] text-lg mt-12">
                No approved words found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Popup Modal (kept for future image support) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-[90%] max-h-[80vh] rounded-xl shadow-2xl border-4 border-white object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-6 bg-white/90 text-black rounded-full px-3 py-1 font-semibold hover:bg-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
