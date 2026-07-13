import { useState } from "react";
import { MapPin, Star, ChevronLeft, ChevronRight, Bed, Bath, Car, Waves, GroupIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Property } from "@/data/properties";
import { propertyPlaceholder } from "@/lib/resolvePhotoUrl";

interface PropertyCardProps {
  property: Property;
  layout?: "grid" | "list";
}

const PropertyCard = ({ property, layout = "grid" }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(property.code);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slug =
    property.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${property.code}`;

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
  // Dimensão real é curta e sem HTML (ex.: "15x35"). Registros legados às vezes
  // trazem uma descrição em HTML nesse campo — nesse caso, ignora para não quebrar o card.
  const rawDimensions = property.areaDimensions || (property as any).area_dimensions;
  const displayDimensions =
    typeof rawDimensions === "string" && !/<[^>]+>/.test(rawDimensions) && rawDimensions.trim().length <= 30
      ? rawDimensions.trim() || undefined
      : undefined;

  const hasFeatures =
    !!(property.bedrooms || property.bathrooms || property.suites || property.parking || property.hasPool || displayArea);

  // Slider de imagens + badges (venda/aluguel) + favorito. Reutilizado nos dois layouts.
  const imageSlider = (roundedClass: string) => (
    <Link to={`/imovel/${slug}`} className={`block relative overflow-hidden h-full ${roundedClass}`}>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${property.title} - ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            idx === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = propertyPlaceholder; }}
        />
      ))}

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
  );

  // Ícones de características (quartos/banheiros/suítes/vagas/piscina/área). Reutilizado.
  const featureItems = (
    <>
      {property.bedrooms !== undefined && property.bedrooms > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <Bed className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground">{property.bedrooms}</span>
          <span className="text-xs font-bold text-muted-foreground">Quartos</span>
        </div>
      )}
      {property.bathrooms !== undefined && property.bathrooms > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <Bath className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground">{property.bathrooms}</span>
          <span className="text-xs font-bold text-muted-foreground">Banheiros</span>
        </div>
      )}
      {property.suites !== undefined && property.suites > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground">{property.suites}</span>
          <span className="text-xs font-bold text-muted-foreground">Suítes</span>
        </div>
      )}
      {property.parking !== undefined && property.parking > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground">{property.parking}</span>
          <span className="text-xs font-bold text-muted-foreground">Vagas</span>
        </div>
      )}
      {property.hasPool && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <Waves className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-bold text-foreground">✓</span>
          <span className="text-xs font-bold text-muted-foreground">Piscina</span>
        </div>
      )}
      {displayArea && (
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted rounded-full px-3.5 py-2 flex items-center justify-center">
            <GroupIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-bold text-foreground">
            {displayArea}m² {displayDimensions && `(${displayDimensions})`}
          </span>
          <span className="text-xs font-bold text-muted-foreground">Área</span>
        </div>
      )}
    </>
  );

  // ── Layout LISTA: imagem à esquerda, informações à direita ──────────────
  if (layout === "list") {
    return (
      <div className="group/card bg-card rounded-2xl shadow-md border border-border hover:shadow-xl transition-shadow flex flex-col md:flex-row overflow-hidden">
        {/* Imagem à esquerda */}
        <div className="relative w-full md:w-[340px] lg:w-[380px] h-[220px] md:h-auto md:min-h-[260px] shrink-0">
          {imageSlider("")}
        </div>

        {/* Conteúdo à direita */}
        <div className="flex-1 min-w-0 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {property.type && (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{property.type}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-lg font-bold truncate">{property.location}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap shrink-0">
              Cód: {property.code}
            </span>
          </div>

          {hasFeatures && (
            <div className="flex items-start justify-start gap-5 flex-wrap my-4">
              {featureItems}
            </div>
          )}

          <div className="flex-1" />
          <div className="border-t border-border mb-3" />

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Valor do imóvel</span>
              <span className="text-xl font-bold text-foreground whitespace-nowrap">{priceLabel}</span>
            </div>
            <Link
              to={`/imovel/${slug}`}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout GRID (padrão): imagem em cima, conteúdo embaixo ───────────────
  return (
    <div className="group/card relative h-full min-h-[560px]">
      <div className="bg-card rounded-2xl shadow-md border border-border hover:shadow-xl transition-shadow flex flex-col h-[710px] mt-[25px]">
        {/* Image area - flush with card edges */}
        <div className="relative h-[300px] md:h-[360px] shrink-0">
          {/* Property Code Badge - Green pill overlapping the top of the photo */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[20px] z-30">
            <span className="bg-emerald-600 text-white font-bold text-base px-2 py-1 rounded-md shadow-md whitespace-nowrap">
              Cód: {property.code}
            </span>
          </div>

          {imageSlider("rounded-t-2xl")}
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-3 flex flex-col flex-1 min-h-0">
          {/* Categoria / tipo do imóvel */}
          {property.type && (
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary mb-1">
              {property.type}
            </p>
          )}

          {/* Location */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <span className="bg-primary/10 rounded-full p-1.5 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </span>
              <span className="text-base font-bold">{property.location}</span>
            </div>
          </div>

          {/* Feature Icons */}
          {hasFeatures && (
            <div className="flex items-start justify-center gap-2 my-2 flex-wrap">
              {featureItems}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Divider */}
          <div className="border-t border-border mb-3" />

          {/* Price + CTA */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Valor do imóvel</span>
              <span className="text-xl font-bold text-foreground whitespace-nowrap">
                {priceLabel}
              </span>
            </div>
            <Link
              to={`/imovel/${slug}`}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      </div>

      {/* Hover popup below card - desktop only */}
      {property.description && (
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-1 z-40 w-[92%] bg-black rounded-lg shadow-lg p-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
          <p className="text-white text-center text-base leading-relaxed">
            {property.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
