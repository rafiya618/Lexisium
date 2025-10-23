import { useState } from "react";
import { ArrowRight, Image as ImageIcon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CategoryCard({ category, onSelect }) {
  const [showImage, setShowImage] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all bg-[var(--color-background)] text-center relative group">
      
      {/* Category Name */}
      <h3 className="text-lg font-semibold mb-2 font-fenix">{category.name}</h3>

      {/* Description */}
      {category.description && (
        <p className="text-sm text-gray-600 mb-3 font-lato">
          {category.description.length > 60
            ? category.description.slice(0, 60) + "..."
            : category.description}
        </p>
      )}

      {/* Image Icon */}
      {category.image && (
        <button
          onClick={() => setShowImage(true)}
          className="text-[var(--color-coral)] hover:text-[var(--color-coral-dark)] mb-2"
        >
          <ImageIcon size={28} />
        </button>
      )}

    

      {/* Arrow Navigate */}
      <button
  onClick={() => navigate(`/add-word/${category._id}`)}
  className="absolute bottom-3 right-3 text-[var(--color-paynesgray)] hover:text-[var(--color-coral)] transition"
  title="View Words"
>
  <ArrowRight size={22} />
</button>


      {/* Popup Modal for Image */}
      {showImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-[var(--color-paynesgray)]/30 backdrop-blur-sm z-50"
          onClick={() => setShowImage(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl p-4 border shadow-2xl max-w-sm w-11/12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-auto rounded-lg object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowImage(false)}
                className="px-4 py-2 rounded-md bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark)] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
