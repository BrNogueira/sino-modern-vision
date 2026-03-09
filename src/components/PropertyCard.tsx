import { Bed, Bath, Square, MapPin } from "lucide-react";
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
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Info overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-primary-foreground px-3 py-1.5 text-[11px] leading-tight">
          {title} · {type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <div className="text-xl font-normal text-primary mb-1">{price}</div>
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-3 text-muted-foreground text-xs mb-3">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              <span>{bedrooms}</span>
            </div>
          )}
          {bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              <span>{bathrooms}</span>
            </div>
          )}
          {area !== undefined && (
            <div className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5" />
              <span>{area}</span>
            </div>
          )}
        </div>

        <Link
          to={`/imovel/${slug}`}
          className="inline-block border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm px-6 py-1.5 rounded transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
