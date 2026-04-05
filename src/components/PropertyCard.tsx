import { Bed, Bath, Car, Waves, GroupIcon, MapPin, Star } from "lucide-react";
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

  const slug = property.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const hasFeatureIcons = property.suites || property.bedrooms || property.bathrooms || property.parking || property.hasPool;

  return (
    <div className="relative pt-4">
      {/* Code Badge - 50% outside card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg shadow-sm">
          CÓD: {property.code}
        </div>
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow flex flex-col group relative" style={{ height: "375px" }}>

      {/* Hover description overlay */}
      <div className="absolute inset-0 z-30 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 pointer-events-none rounded-2xl">
        <p className="text-primary-foreground text-center text-sm leading-relaxed font-medium">
          {property.title}
        </p>
      </div>

      {/* Image + Price wrapper */}
      <div className="relative">
        <Link to={`/imovel/${slug}`} className="block h-52 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

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

        {/* Feature Icons (always show row for consistent height) */}
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center justify-center gap-3 mb-3 min-h-[24px]">
            {property.suites !== undefined && property.suites > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-sm text-foreground cursor-default">
                    {property.suites}<Bed className="w-4 h-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{property.suites} suítes</TooltipContent>
              </Tooltip>
            )}
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-sm text-foreground cursor-default">
                    {property.bedrooms}<Bed className="w-4 h-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{property.bedrooms} quartos</TooltipContent>
              </Tooltip>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-sm text-foreground cursor-default">
                    {property.bathrooms}<Bath className="w-4 h-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{property.bathrooms} banheiros</TooltipContent>
              </Tooltip>
            )}
            {property.parking !== undefined && property.parking > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-sm text-foreground cursor-default">
                    {property.parking}<Car className="w-4 h-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{property.parking} vagas</TooltipContent>
              </Tooltip>
            )}
            {property.hasPool && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-sm text-foreground cursor-default">
                    <Waves className="w-4 h-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Piscina</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        {/* Area (for terrenos) */}
        {property.area && !hasFeatureIcons && (
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="flex items-center gap-1 text-sm bg-muted px-3 py-1.5 rounded-md">
              <GroupIcon className="w-4 h-4 text-primary" />
              {property.area}m² {property.areaDimensions && `(${property.areaDimensions})`}
            </span>
          </div>
        )}

        {/* Favorite Button - icon only, right aligned */}
        <div className="flex justify-end mt-auto">
          <button
            onClick={() => toggleFavorite(property.code)}
            className="hover:opacity-80 transition-opacity"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                favorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PropertyCard;
