import { Bed, Bath, Car, Waves, Square, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(property.code);

  const slug = property.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const hasFeatureIcons = property.suites || property.bedrooms || property.bathrooms || property.parking || property.hasPool;

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow relative">
      {/* Code Badge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-b-lg">
          CÓD: {property.code}
        </div>
      </div>

      {/* Image */}
      <Link to={`/imovel/${slug}`} className="block relative h-52 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-md">
            {property.priceFormatted}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 text-center">
        {/* Type */}
        <h3 className="text-xl font-bold text-foreground uppercase tracking-wide mb-1">
          {property.type}
        </h3>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="uppercase text-xs font-medium">{property.location}</span>
        </div>

        {/* Feature Icons (if available) */}
        {hasFeatureIcons && (
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            {property.suites !== undefined && property.suites > 0 && (
              <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                <Bed className="w-3.5 h-3.5 text-primary" />
                {property.suites} suítes
              </span>
            )}
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                <Bed className="w-3.5 h-3.5 text-primary" />
                {property.bedrooms} quartos
              </span>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                <Bath className="w-3.5 h-3.5 text-primary" />
                {property.bathrooms} banh
              </span>
            )}
            {property.parking !== undefined && property.parking > 0 && (
              <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                <Car className="w-3.5 h-3.5 text-primary" />
                {property.parking} vagas
              </span>
            )}
            {property.hasPool && (
              <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                <Waves className="w-3.5 h-3.5 text-primary" />
                piscina
              </span>
            )}
          </div>
        )}

        {/* Area (for terrenos) */}
        {property.area && !hasFeatureIcons && (
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-md">
              <Square className="w-4 h-4 text-primary" />
              {property.area}m² {property.areaDimensions && `(${property.areaDimensions})`}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(property.code)}
          className="flex items-center justify-center gap-2 mx-auto text-sm hover:opacity-80 transition-opacity"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              favorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
          <span className={favorited ? "text-yellow-600 font-medium" : "text-muted-foreground"}>
            Favoritar
          </span>
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
