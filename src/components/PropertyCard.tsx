import { useState } from "react";
import { Bed, Bath, Car, Waves, GroupIcon, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(property.code);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slug = property.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const hasFeatureIcons = property.suites || property.bedrooms || property.bathrooms || property.parking || property.hasPool;

  // Build images array: main image + gallery
  const images = [property.image, ...(property.gallery || [])];
  const totalSlides = images.length;

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative pt-4 group/card">
      {/* Code Badge - 50% outside card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg shadow-sm">
          CÓD: {property.code}
        </div>
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow flex flex-col group relative" style={{ height: "375px" }}>


      {/* Image carousel + Price wrapper */}
      <div className="relative">
        <Link to={`/imovel/${slug}`} className="block h-52 overflow-hidden relative">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${property.title} - ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          ))}
        </Link>

        {/* Carousel arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            {/* Slide counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-foreground/60 text-primary-foreground text-xs px-2.5 py-0.5 rounded-full">
              {currentSlide + 1} / {totalSlides}
            </div>
          </>
        )}

        {/* Transaction type badges - top left, stacked */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {(property.transactionType === "venda" || property.transactionType === "venda/aluguel") && (
            <span className="bg-primary text-primary-foreground text-[11px] font-bold uppercase px-3 py-1 rounded shadow-sm">
              Venda
            </span>
          )}
          {(property.transactionType === "aluguel" || property.transactionType === "venda/aluguel") && (
            <span className="bg-white text-primary text-[11px] font-bold uppercase px-3 py-1 rounded shadow-sm">
              Aluguel
            </span>
          )}
        </div>

        {/* Favorite - top right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(property.code); }}
          className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              favorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Price - centered, overlapping bottom edge */}
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary text-primary-foreground text-lg font-semibold px-4 py-1.5 rounded-md whitespace-nowrap shadow-sm">
            {property.priceFormatted}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-6 text-center flex flex-col flex-1">
        {/* Type */}
        <h3 className="text-xl font-bold text-foreground uppercase tracking-wide mb-1">
          {property.type}
        </h3>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-foreground mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="uppercase text-sm font-bold">{property.location}</span>
        </div>

        {/* Feature Icons with labels */}
        <div className="flex items-center justify-center gap-4 mb-3 min-h-[24px]">
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <Bed className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{property.bedrooms}</span>
              <span className="text-[10px] text-muted-foreground">Quartos</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <Bath className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{property.bathrooms}</span>
              <span className="text-[10px] text-muted-foreground">Banheiros</span>
            </div>
          )}
          {property.suites !== undefined && property.suites > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <Star className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{property.suites}</span>
              <span className="text-[10px] text-muted-foreground">Suítes</span>
            </div>
          )}
          {property.parking !== undefined && property.parking > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <Car className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{property.parking}</span>
              <span className="text-[10px] text-muted-foreground">Vagas</span>
            </div>
          )}
          {property.hasPool && (
            <div className="flex flex-col items-center gap-0.5">
              <Waves className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">✓</span>
              <span className="text-[10px] text-muted-foreground">Piscina</span>
            </div>
          )}
        </div>

        {/* Area (for terrenos) */}
        {property.area && !hasFeatureIcons && (
          <div className="flex items-center justify-center gap-1">
            <span className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-md">
              <GroupIcon className="w-4 h-4 text-primary" />
              {property.area}m² {property.areaDimensions && `(${property.areaDimensions})`}
            </span>
          </div>
        )}
      </div>
      </div>

      {/* Hover popup below card - desktop only */}
      {property.description && (
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-1 z-40 w-[92%] bg-card border border-border rounded-lg shadow-lg p-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-foreground text-center text-xs leading-relaxed">
            {property.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
