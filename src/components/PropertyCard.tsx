import { useState } from "react";
import { MapPin, Star, ChevronLeft, ChevronRight, Bed, Bath, Car, Waves, Droplets } from "lucide-react";
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

  const metragens = [
    property.areaTerreno ? { label: "Terreno", value: property.areaTerreno } : null,
    (property as any).areaTotal ? { label: "Terreno", value: (property as any).areaTotal } : null,
    property.areaConstruida ? { label: "Casa", value: property.areaConstruida } : null,
    (property as any).areaUtil ? { label: "Útil", value: (property as any).areaUtil } : null,
  ].filter(Boolean) as { label: string; value: number }[];
  // Dedup por label (evita "Terreno" duas vezes quando areaTerreno e areaTotal coexistem).
  const metragensUnicas = metragens.filter(
    (m, i, arr) => arr.findIndex((x) => x.label === m.label) === i,
  );
  if (metragensUnicas.length === 0 && displayArea) {
    metragensUnicas.push({ label: "Área", value: Number(displayArea) });
  }

  const pills = [
    property.bedrooms ? { icon: Bed, label: `${property.bedrooms} quartos` } : null,
    property.suites ? { icon: Star, label: `${property.suites} suíte${property.suites > 1 ? "s" : ""}` } : null,
    property.bathrooms ? { icon: Bath, label: `${property.bathrooms} banheiros` } : null,
    property.lavabos ? { icon: Droplets, label: `${property.lavabos} lavabo${property.lavabos > 1 ? "s" : ""}` } : null,
    property.parking ? { icon: Car, label: `${property.parking} vagas` } : null,
    property.hasPool ? { icon: Waves, label: "piscina" } : null,
  ].filter(Boolean) as { icon: typeof Bed; label: string }[];

  // Pílulas verdes de características (ícone + texto). Reutilizado nos dois layouts.
  const pillsRow = (justify = "") =>
    pills.length > 0 && (
      <div className={`flex flex-wrap gap-2 ${justify}`}>
        {pills.map((p, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-0.5 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 min-w-[62px]">
            <p.icon className="w-4 h-4" strokeWidth={2} />
            <span className="text-[10px] font-semibold leading-none whitespace-nowrap">{p.label}</span>
          </div>
        ))}
      </div>
    );

  // Metragens (Terreno/Casa/Útil com caixinha m²). Reutilizado nos dois layouts.
  const metragensRow = (justify = "") =>
    metragensUnicas.length > 0 && (
      <div className={`flex items-start gap-5 md:gap-8 ${justify}`}>
        {metragensUnicas.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs md:text-sm font-bold text-foreground">{m.label}</span>
            <span className="w-7 h-6 border border-foreground/30 rounded flex items-center justify-center text-[9px] text-muted-foreground">m²</span>
            <span className="text-sm md:text-base font-bold text-foreground whitespace-nowrap">{m.value}m²</span>
          </div>
        ))}
      </div>
    );

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

  // ── Layout LISTA: seguindo as proporções/posições da referência ─────────
  if (layout === "list") {
    return (
      <div className="group/card bg-card rounded-2xl shadow-md border border-border hover:shadow-xl transition-shadow flex flex-col md:flex-row overflow-hidden">
        {/* Imagem à esquerda (~40%) */}
        <div className="relative w-full md:w-[40%] lg:w-[42%] h-[240px] md:h-auto md:min-h-[300px] shrink-0">
          {imageSlider("")}
          {/* Código sobre a foto (canto superior esquerdo) */}
          <span className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground text-xs font-bold uppercase px-2.5 py-1 rounded-md shadow-sm">
            Cód: {property.code}
          </span>
        </div>

        {/* Painel à direita */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header verde com o título */}
          <Link to={`/imovel/${slug}`} className="bg-primary text-primary-foreground px-4 py-2.5 hover:brightness-95 transition">
            <h3 className="font-bold uppercase text-sm md:text-lg leading-tight line-clamp-2">{property.title}</h3>
          </Link>

          <div className="flex-1 flex flex-col gap-3 p-4">
            {/* Localização */}
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm md:text-base font-semibold truncate">{property.location}</span>
            </div>

            {/* Pílulas de características (verde) */}
            {pillsRow()}

            {/* Metragens */}
            {metragensRow()}

            {/* Preço + botão */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <div className="rounded-md border border-border bg-background px-4 py-2">
                <span className="text-lg md:text-xl font-bold text-foreground whitespace-nowrap">{priceLabel}</span>
              </div>
              <Link
                to={`/imovel/${slug}`}
                className="font-bold uppercase text-sm px-4 py-2.5 rounded-md whitespace-nowrap hover:brightness-95 active:scale-[0.97] transition"
                style={{ background: "#F2C21A", color: "#2F2F2F" }}
              >
                Saiba mais
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout GRID (padrão): imagem em cima, conteúdo embaixo ───────────────
  return (
    <div className="group/card relative h-full min-h-[560px]">
      <div className="bg-card rounded-2xl shadow-md border border-border hover:shadow-xl transition-shadow flex flex-col h-[620px] mt-[25px]">
        {/* Image area - flush with card edges */}
        <div className="relative h-[260px] md:h-[300px] shrink-0">
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

          {/* Pílulas de características (verde) + metragens */}
          <div className="flex flex-col items-center gap-2 my-2">
            {pillsRow("justify-center")}
            {metragensRow("justify-center")}
          </div>

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
