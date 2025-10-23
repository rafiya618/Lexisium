import { useEffect, useState } from "react";
import { getApprovedWords, searchWord } from "../api/api";
import { Search, BookText, Languages, Tag, Volume2, Image as ImageIcon, Info } from "lucide-react";
import SearchBar from "../components/SearchBar";

export default function ExploreWords() {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const approved = await getApprovedWords();
    setWords(approved);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim()) {
      try {
        const res = await searchWord(query);
        setWords(res.data.words.filter((w) => w.status === "Approved"));
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      loadWords();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 pb-10">
      {/* Header */}
      <h1 className="text-3xl font-fenix text-center mt-8 text-gradient tracking-wide">
        Explore Words
      </h1>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search words..."
        value={search}
        onChange={handleSearch}
      />

      {/* Words List */}
      <div className="mt-6 space-y-4 max-w-6xl mx-auto ">
        {words.length > 0 ? (
          words.map((w) => (
            <div
              key={w._id}
              className="flex flex-col md:flex-row md:items-center justify-between border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] shadow-sm hover:shadow-md transition-all duration-200 px-6 py-4"
            >
              {/* Left Section: Word + Info */}
              <div className="flex flex-col space-y-2 w-full">
                {/* Word */}
                <div className="flex items-center gap-2 text-[var(--color-gunmetal)]">
                  <BookText className="text-[var(--color-coral)]" size={22} />
                  <h2 className="text-2xl font-fenix">{w.word}</h2>
                </div>

                {/* Translations */}
                <div className="ml-7 text-sm space-y-1 text-[var(--color-paynesgray-dark)]">
                  {w.translation?.english && (
                    <div className="flex items-center gap-2">
                      <Languages size={16} className="text-blue-600" />
                      <span className="font-semibold">English:</span>{" "}
                      {w.translation.english}
                    </div>
                  )}
                  {w.translation?.urdu && (
                    <div className="flex items-center gap-2">
                      <Languages size={16} className="text-green-600" />
                      <span className="font-semibold">Urdu:</span>{" "}
                      {w.translation.urdu}
                    </div>
                  )}
                  {w.translation?.roman && (
                    <div className="flex items-center gap-2">
                      <Languages size={16} className="text-purple-600" />
                      <span className="font-semibold">Roman:</span>{" "}
                      {w.translation.roman}
                    </div>
                  )}
                </div>

                {/* Description */}
                {w.description && (
                  <div className="ml-7 flex items-start gap-2 text-sm text-[var(--color-paynesgray-dark)]">
                    <Info size={16} className="text-[var(--color-coral-dark)] mt-[2px]" />
                    <span>{w.description}</span>
                  </div>
                )}

                {/* Category */}
                {w.category && (
  <span className="ml-7 mt-2 inline-flex items-center gap-1 bg-[var(--color-gunmetal)] text-white px-2.5 py-[2px] text-xs font-semibold rounded-full w-fit self-start">
    <Tag size={12} /> {w.category.name}
  </span>
)}
              </div>

              {/* Right Section: Media */}
              <div className="flex flex-col md:items-end items-start gap-3 mt-4 md:mt-0">
                {/* Audio */}
                {w.audio && (
                  <div className="flex items-center gap-2">
                    <Volume2
                      size={18}
                      className="text-[var(--color-paynesgray-dark)]"
                    />
                    <audio
                      controls
                      src={w.audio}
                      className="h-8 w-44"
                    ></audio>
                  </div>
                )}

                {/* Image */}
                {w.image ? (
                  <div
                    onClick={() => setSelectedImage(w.image)}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={w.image}
                      alt={w.word}
                      className="w-24 h-20 object-cover rounded-md border border-[var(--color-border)] group-hover:scale-105 transition-transform"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-all">
                      <ImageIcon size={20} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 text-sm">
                    <ImageIcon size={16} className="mr-1" /> No image
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-[var(--color-silver-dark)] text-lg mt-20">
            No approved words found.
          </div>
        )}
      </div>

      {/* Image Popup Modal */}
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
