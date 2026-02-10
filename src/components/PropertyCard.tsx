import { Bed, Bath, Square, MapPin, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

const PropertyCard = ({
  image,
  title,
  location,
  price,
  type,
  bedrooms,
  bathrooms,
  area,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

  return (
    <Link to={`/imovel/${slug}`} className="block group bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:border-accent/40 hover:shadow-lg transition-all">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
          {type}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-accent hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-accent text-accent" : "text-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <div className="text-2xl font-bold text-accent mb-2">{price}</div>
        
        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <MapPin className="w-4 h-4 text-accent/70" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 pt-4 border-t border-border text-muted-foreground text-sm">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{bedrooms} Quartos</span>
            </div>
          )}
          {bathrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{bathrooms} Banheiros</span>
            </div>
          )}
          {area !== undefined && (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4" />
              <span>{area}m²</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
