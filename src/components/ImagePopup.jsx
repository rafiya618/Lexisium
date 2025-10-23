export default function ImagePopup({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
        <img
          src={imageUrl}
          alt="Category"
          className="rounded-lg w-full h-auto object-cover"
        />
        <button
          onClick={onClose}
          className="mt-4 w-full bg-coral text-white py-2 rounded hover:bg-coral-dark transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
