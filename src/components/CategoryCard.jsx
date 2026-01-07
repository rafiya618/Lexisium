import { useState } from "react";
import { ArrowRight, Image as ImageIcon, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CategoryCard({ category }) {
  const [showImage, setShowImage] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-full border border-[var(--color-coral)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-[var(--color-background)] text-left relative group overflow-hidden flex flex-col">
      {/* Content with text on the left and image thumbnail on the right */}
      <div className="p-3.5 sm:p-4 flex-grow flex gap-3">
        {/* Text column */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-bold font-fenix text-[var(--color-gunmetal)] mb-1 line-clamp-1">
            {category.word}
          </h3>

          {category.translation && (
            <div className="mb-2 text-sm text-[var(--color-gunmetal)] flex flex-wrap gap-x-3 gap-y-1">
              {category.translation.english && (
                <span>
                  <span className="font-semibold text-[var(--color-paynesgray)] mr-1">EN:</span>
                  <span>{category.translation.english}</span>
                </span>
              )}
              {category.translation.urdu && (
                <span>
                  <span className="font-semibold text-[var(--color-paynesgray)] mr-1">UR:</span>
                  <span>{category.translation.urdu}</span>
                </span>
              )}
              {category.translation.roman && (
                <span>
                  <span className="font-semibold text-[var(--color-paynesgray)] mr-1">RO:</span>
                  <span>{category.translation.roman}</span>
                </span>
              )}
            </div>
          )}

          {category.description && (
            <p className="text-base text-[var(--color-gunmetal)] mb-2 font-lato line-clamp-2 flex-grow">
              {category.description}
            </p>
          )}

          {category.audio && (
            <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
              <Volume2 size={16} className="text-[var(--color-coral)]" />
              <span>Audio available</span>
            </div>
          )}
        </div>

        {/* Image thumbnail column */}
        <button
          type="button"
          onClick={() => category.image && setShowImage(true)}
          className="hidden sm:block w-24 md:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[var(--color-coral)]/10 to-[var(--color-paynesgray)]/10 flex-shrink-0 relative group/img"
          title={category.image ? "View full image" : "No image available"}
        >
          {category.image ? (
            <>
              <img
                src={category.image}
                alt={category.word}
                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                <ImageIcon size={20} className="text-white opacity-90" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-300" />
            </div>
          )}
        </button>
      </div>

      {/* Action Button */}
      <div className="px-4 sm:px-5 pb-3">
        <button
          onClick={() => navigate(`/add-word/${category._id}`)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[var(--color-coral)] text-[var(--color-coral)] bg-[var(--color-background)] hover:bg-[var(--color-coral)]/5 transition-all duration-200 font-semibold text-xs sm:text-sm"
          title="View Words"
        >
          View Words
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>


      {/* Popup Modal for Image & Details */}
      {showImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          onClick={() => setShowImage(false)}
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
                  {category.word}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowImage(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-coral)] text-[var(--color-coral)] hover:bg-[var(--color-coral)]/5 transition"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:gap-5">
                {/* Image block */}
                <div className="md:w-5/12 mb-3 md:mb-0">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.word}
                      className="w-full rounded-xl object-cover max-h-64"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                </div>

                {/* Text details */}
                <div className="md:flex-1 space-y-4 text-sm md:text-base text-[var(--color-gunmetal)]">
                  {category.translation && (
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1">Translations</p>
                      {category.translation.english && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">English:</span>
                          <span>{category.translation.english}</span>
                        </div>
                      )}
                      {category.translation.urdu && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">Urdu:</span>
                          <span>{category.translation.urdu}</span>
                        </div>
                      )}
                      {category.translation.roman && (
                        <div>
                          <span className="text-xs md:text-sm font-medium text-[var(--color-paynesgray)] mr-1">Roman:</span>
                          <span>{category.translation.roman}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {category.description && (
                    <div className="space-y-1 pt-3 border-t border-gray-200">
                      <p className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1">Description</p>
                      <p className="text-gray-700 font-lato text-sm md:text-base leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  )}

                  {category.audio && (
                    <div className="space-y-1 pt-3 border-t border-gray-200">
                      <label className="text-sm md:text-base font-semibold text-[var(--color-paynesgray)] mb-1 block">Audio</label>
                      <audio
                        controls
                        src={category.audio}
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
    </div>
  );
}
