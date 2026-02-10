interface CategoryCardProps {
  image: string;
  title: string;
  count: number;
}

const CategoryCard = ({ image, title, count }: CategoryCardProps) => {
  return (
    <a
      href="#"
      className="group relative h-72 rounded-2xl overflow-hidden block shadow-card"
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-card-overlay" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
        <h3 className="text-2xl font-bold mb-1 transform transition-transform duration-300 group-hover:translate-x-2">
          {title}
        </h3>
        <p className="text-primary-foreground/80 text-sm transform transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          {count} imóveis disponíveis →
        </p>
      </div>
      
      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-accent/60 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </a>
  );
};

export default CategoryCard;
