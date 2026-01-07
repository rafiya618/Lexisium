import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {categories.map((cat) => (
        <CategoryCard key={cat._id} category={cat} onSelect={onSelect} />
      ))}
    </div>
  );
}
