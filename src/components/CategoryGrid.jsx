import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-6">
      {categories.map((cat) => (
        <CategoryCard key={cat._id} category={cat} onSelect={onSelect} />
      ))}
    </div>
  );
}
