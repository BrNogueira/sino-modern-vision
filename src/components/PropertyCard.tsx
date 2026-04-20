import { useState } from "react";
import { MapPin, Star, ChevronLeft, ChevronRight, Bed, Bath, Car, Waves, GroupIcon } from "lucide-react";
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

  const priceLabel =
    property.transactionType === "aluguel"
      ? property.valorAluguelFormatted || property.priceFormatted
      : property.priceFormatted;

  const displayArea = property.area || (property as any).areaTotal || (property as any).areaUtil || property.areaTerreno || property.areaConstruida;
  const displayDimensions = property.areaDimensions || (property as any).area_dimensions;

  return (
    <div className="group/card relative">
      <div className="bg-card rounded-2xl shadow-md border border-border hover:shadow-xl transition-shadow flex flex-col">
        {/* Image area - flush with card edges */}
        <div className="relative">
          {/* Property Code Badge - Green pill overlapping the top of the photo */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-30">
            <span className="bg-emerald-600 text-white font-bold text-2xl px-8 py-3 rounded-full shadow-md whitespace-nowrap">
              Cód: {property.code}
            </span>
          </div>

          <Link to={`/imovel/${slug}`} className="block relative overflow-hidden h-64 rounded-t-2xl">
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
              </>
            )}

            {/* Transaction type badges - top left */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              {(property.transactionType === "venda" || property.transactionType === "venda/aluguel") && (
                <span className="bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm text-center">
                  Venda
                </span>
              )}
              {(property.transactionType === "aluguel" || property.transactionType === "venda/aluguel") && (
                <span className="bg-background text-primary text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm text-center">
                  Aluguel
                </span>
              )}
              {property.exclusive && (
                <span className="bg-emerald-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm text-center">
                  Exclusivo
                </span>
              )}
            </div>

            {/* Favorite - top right */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(property.code);
              }}
              className="absolute top-3 right-3 z-10 bg-background/90 hover:bg-background rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-colors"
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  favorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                }`}
              />
            </button>
          </Link>
        </div>

        {/* Content */}
        <div className="px-6 pt-8 pb-5 flex flex-col flex-1">
          {/* Category and Location */}
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="text-lg font-bold text-foreground uppercase tracking-wider">
              {property.type}
            </span>
            <div className="flex items-center justify-center gap-2 text-foreground">
              <span className="bg-primary/10 rounded-full p-2 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </span>
              <span className="text-lg font-bold">{property.location}</span>
            </div>
          </div>

          {/* Feature Icons */}
          {(property.bedrooms || property.bathrooms || property.suites || property.parking || property.hasPool || displayArea) && (
            <div className="flex items-start justify-center gap-3 mb-4 flex-wrap">
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <Bed className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-bold text-foreground">{property.bedrooms}</span>
                  <span className="text-sm text-muted-foreground">Quartos</span>
                </div>
              )}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <Bath className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-bold text-foreground">{property.bathrooms}</span>
                  <span className="text-sm text-muted-foreground">Banheiros</span>
                </div>
              )}
              {property.suites !== undefined && property.suites > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <Star className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-bold text-foreground">{property.suites}</span>
                  <span className="text-sm text-muted-foreground">Suítes</span>
                </div>
              )}
              {property.parking !== undefined && property.parking > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <Car className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-bold text-foreground">{property.parking}</span>
                  <span className="text-sm text-muted-foreground">Vagas</span>
                </div>
              )}
              {property.hasPool && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <Waves className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-base font-bold text-foreground">✓</span>
                  <span className="text-sm text-muted-foreground">Piscina</span>
                </div>
              )}
              {displayArea && (
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted rounded-full px-5 py-2.5 flex items-center justify-center">
                    <GroupIcon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {displayArea}m² {displayDimensions && `(${displayDimensions})`}
                  </span>
                  <span className="text-base text-muted-foreground font-medium">Área</span>
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Divider */}
          <div className="border-t border-border mb-4" />

          {/* Price + CTA */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Valor do imóvel</span>
              <span className="text-2xl font-bold text-foreground whitespace-nowrap">
                {priceLabel}
              </span>
            </div>
            <Link
              to={`/imovel/${slug}`}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-md transition-colors whitespace-nowrap"
            >
              Ver Detalhes
            </Link>
          </div>
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
