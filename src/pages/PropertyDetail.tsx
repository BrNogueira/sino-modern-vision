import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import InlineEditField from "@/components/InlineEditField";
import InlinePhotoEditor from "@/components/InlinePhotoEditor";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useChangeLog } from "@/contexts/ChangeLogContext";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  Car,
  Waves,
  Sofa,
  Droplets,
  LandPlot,
  Home,
  CheckCircle2,
  Banknote,
  MessageCircle,
  Mail,
  X,
  Flower2,
  Dumbbell,
  PartyPopper,
  UtensilsCrossed,
  ShieldCheck,
  TreePine,
  Building,
  Store,
  ZoomIn,
  Play,
  Pause,
  Maximize,
  LayoutGrid,
  Printer,
  Star,
  DollarSign,
  Facebook,
  Youtube,
  MapPin,
  Info,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { properties as staticProperties, type Property } from "@/data/properties";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { zapToProperty } from "@/lib/zapToProperty";

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ─── Lightbox (fullscreen gallery like reference) ─── */
const LightboxOverlay = ({ images, index, onClose, onPrev, onNext, onGoTo }: { images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void; onGoTo: (i: number) => void }) => {
  const [zoomed, setZoomed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [gridView, setGridView] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => onNext(), 3000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, onNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const btnCls = "w-10 h-10 rounded-lg flex items-center justify-center text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)] hover:bg-[hsl(0,0%,20%)] transition-colors";

  if (gridView) {
    return (
      <div className="fixed inset-0 z-50 bg-[hsl(0,0%,8%)] flex flex-col overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 sticky top-0 bg-[hsl(0,0%,8%)] z-10">
          <span className="text-[hsl(0,0%,70%)] text-sm font-medium">{images.length} fotos</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setGridView(false)} className={btnCls}><LayoutGrid className="w-5 h-5" /></button>
            <button onClick={onClose} className={btnCls}><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 p-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => { onGoTo(i); setGridView(false); }} className="aspect-[4/3] overflow-hidden rounded hover:opacity-80 transition-opacity">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(0,0%,8%)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-[hsl(0,0%,70%)] text-sm font-medium">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-1 bg-[hsl(0,0%,15%)] rounded-lg px-1 py-1">
          <button onClick={() => setZoomed(!zoomed)} className={btnCls} title="Zoom"><ZoomIn className="w-5 h-5" /></button>
          <button onClick={() => setPlaying(!playing)} className={btnCls} title="Slideshow">{playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
          <button onClick={toggleFullscreen} className={btnCls} title="Tela cheia"><Maximize className="w-5 h-5" /></button>
          <button onClick={() => setGridView(true)} className={btnCls} title="Grade"><LayoutGrid className="w-5 h-5" /></button>
          <button onClick={onClose} className={btnCls} title="Fechar"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className={`flex-1 relative flex items-center justify-center min-h-0 px-16 ${zoomed ? "cursor-zoom-out overflow-auto" : ""}`} onClick={() => zoomed && setZoomed(false)}>
        <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,100%)] transition-colors z-10"><ChevronLeft className="w-8 h-8" /></button>
        <img src={images[index]} alt="" className={`select-none transition-transform duration-300 ${zoomed ? "max-w-none scale-150 cursor-zoom-out" : "max-w-full max-h-full object-contain cursor-zoom-in"}`} draggable={false} onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }} />
        <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,100%)] transition-colors z-10"><ChevronRight className="w-8 h-8" /></button>
      </div>
      <div className="flex-shrink-0 bg-[hsl(0,0%,12%)] border-t border-[hsl(0,0%,20%)]">
        <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button key={i} onClick={() => onGoTo(i)} className={`flex-shrink-0 w-[90px] h-[60px] rounded overflow-hidden border-2 transition-all ${i === index ? "border-[hsl(0,0%,100%)] opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── TikTok icon (not in lucide) ─── */
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.16z" />
  </svg>
);

/* ─── Instagram icon (not in lucide) ─── */
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

/* ─── Main Page ─── */
const PropertyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { properties: dbProperties } = useAdminProperties();
  const properties = useMemo(
    () => [...dbProperties.filter((p) => p.ativo).map(zapToProperty), ...staticProperties],
    [dbProperties],
  );
  const baseProperty = properties.find((p) => generateSlug(p.title) === slug) || properties[0];
  const { hasRole } = useAdminAuth();

  // Editable state for inline editing
  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const getField = (field: string, original: any) => editableFields[field] !== undefined ? editableFields[field] : String(original ?? "");
  const getNumField = (field: string, original: any) => editableFields[field] !== undefined ? (editableFields[field] ? Number(editableFields[field]) : undefined) : original;
  const getArrayField = (field: string, original: string[] | undefined) => {
    if (editableFields[field] !== undefined) {
      return editableFields[field] ? editableFields[field].split(",").map(s => s.trim()).filter(Boolean) : [];
    }
    return original;
  };

  const property = {
    ...baseProperty,
    title: getField("title", baseProperty.title),
    description: getField("description", baseProperty.description),
    priceFormatted: getField("priceFormatted", baseProperty.priceFormatted),
    code: getField("code", baseProperty.code),
    location: getField("location", baseProperty.location),
    city: getField("city", baseProperty.city),
    neighborhood: getField("neighborhood", baseProperty.neighborhood),
    areaTerreno: getNumField("areaTerreno", baseProperty.areaTerreno),
    areaConstruida: getNumField("areaConstruida", baseProperty.areaConstruida),
    area: getNumField("area", baseProperty.area),
    bedrooms: getNumField("bedrooms", baseProperty.bedrooms),
    suites: getNumField("suites", baseProperty.suites),
    bathrooms: getNumField("bathrooms", baseProperty.bathrooms),
    parking: getNumField("parking", baseProperty.parking),
    salas: getNumField("salas", baseProperty.salas),
    lavabos: getNumField("lavabos", baseProperty.lavabos),
    acabamentos: getArrayField("acabamentos", baseProperty.acabamentos),
    amenidades: getArrayField("amenidades", baseProperty.amenidades),
    condicoesPagamento: getField("condicoesPagamento", baseProperty.condicoesPagamento),
  };

  const updateField = (field: string, value: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: value }));
  };
  const [editableGallery, setEditableGallery] = useState<string[] | null>(null);

  const gallery = editableGallery || (property.gallery?.length ? property.gallery : [property.image]);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number; images: string[] }>({ open: false, index: 0, images: [] });
  const [showTaxas, setShowTaxas] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const nextImage = useCallback(() => setCurrentImage((i) => (i + 1) % gallery.length), [gallery.length]);
  const prevImage = useCallback(() => setCurrentImage((i) => (i - 1 + gallery.length) % gallery.length), [gallery.length]);

  const openLightbox = (i: number, imgs?: string[]) => setLightbox({ open: true, index: i, images: imgs || gallery });
  const closeLightbox = () => setLightbox((s) => ({ ...s, open: false }));
  const lightboxPrev = () => setLightbox((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
  const lightboxNext = () => setLightbox((s) => ({ ...s, index: (s.index + 1) % s.images.length }));

  const characteristics = buildCharacteristics(property);
  const hasAcabamentos = property.acabamentos && property.acabamentos.length > 0;
  const hasAmenidades = property.amenidades && property.amenidades.length > 0;
  const hasFotosAreaComum = property.fotosAreaComum && property.fotosAreaComum.length > 0;
  const hasTaxas = property.taxasAdicionais && property.taxasAdicionais.length > 0;
  const isAluguel = property.transactionType === "aluguel";

  // Similar properties (same type or city, excluding current)
  const similarProperties = properties
    .filter((p) => p.code !== property.code && (p.type === property.type || p.city === property.city))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {lightbox.open && <LightboxOverlay images={lightbox.images} index={lightbox.index} onClose={closeLightbox} onPrev={lightboxPrev} onNext={lightboxNext} onGoTo={(i) => setLightbox((s) => ({ ...s, index: i }))} />}

      {/* Navigation buttons */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 md:gap-6 py-2 md:py-3">
          <Link to="/" className="flex items-center gap-1 md:gap-2 text-primary font-bold uppercase hover:opacity-80 transition-opacity text-lg md:text-2xl">
            <Home className="w-4 h-4" />
            Início
          </Link>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 md:gap-2 text-primary font-bold uppercase hover:opacity-80 transition-opacity text-lg md:text-2xl">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* ── Title Bar ── */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <InlineEditField value={property.title} field="Título" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("title", v)}>
              <h1 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide">
                <span className={property.transactionType === "venda" ? "text-primary" : "text-orange-600"}>
                  {property.transactionType === "venda/aluguel" ? "VENDA / ALUGUEL" : property.transactionType?.toUpperCase()}
                </span> — {property.title}
              </h1>
            </InlineEditField>
            {property.city && property.neighborhood && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.neighborhood}, ${property.city} - ${property.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors mt-1 text-2xl font-medium"
              >
                <MapPin className="w-4 h-4 text-primary" />
                {property.city} - {property.neighborhood}
              </a>
            )}
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 w-full md:w-auto">
            <InlineEditField value={property.code} field="Código" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("code", v)}>
              <span className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold" style={{ fontSize: "1.4rem", lineHeight: "1.5rem" }}>CÓD: {property.code}</span>
            </InlineEditField>
            <button onClick={() => toggleFavorite(property.code)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Heart className={`w-4 h-4 ${isFavorite(property.code) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
            <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              onClick={() => navigator.share?.({ title: property.title, url: window.location.href }) || navigator.clipboard.writeText(window.location.href)}>
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ══ LEFT COLUMN ══ */}
          <div className="lg:col-span-2 space-y-6">

            <InlinePhotoEditor photos={gallery} propertyCode={property.code} propertyTitle={property.title} onSave={(newPhotos) => { setEditableGallery(newPhotos); setCurrentImage(0); }}>
              {/* Main image with Venda/Aluguel rounded badges + favorite star */}
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/10] border border-border">
                <img src={gallery[currentImage]} alt={property.title} className="w-full h-full object-cover cursor-pointer" onClick={() => openLightbox(currentImage)} />
                {/* Transaction badges — rounded "bolinhas" */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.transactionType === "venda" && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-primary text-primary-foreground shadow-md">
                      Venda
                    </span>
                  )}
                  {property.transactionType === "aluguel" && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-accent text-accent-foreground shadow-md">
                      Aluguel
                    </span>
                  )}
                </div>
                {/* Favorite star on top-right of image */}
                <button
                  onClick={() => toggleFavorite(property.code)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-all shadow-md"
                >
                  <Star className={`w-5 h-5 transition-colors ${isFavorite(property.code) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
                {gallery.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-md"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-md"><ChevronRight className="w-5 h-5" /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">{currentImage + 1} / {gallery.length}</div>
                  </>
                )}
              </div>

              {/* Thumbnail gallery — max 4 visible */}
              {gallery.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {gallery.slice(0, 4).map((img, i) => (
                    <button key={i} onClick={() => openLightbox(i, gallery)} className={`flex-1 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </InlinePhotoEditor>

            {/* Description */}
            {property.description && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-bold text-foreground mb-2 text-3xl">
                  Descrição do Imóvel
                </h3>
                <InlineEditField value={property.description || ""} field="Descrição" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("description", v)} type="textarea">
                  <p className="text-muted-foreground leading-relaxed text-3xl">{property.description}</p>
                </InlineEditField>
              </div>
            )}

            {/* Fotos de Área de Uso Comum — max 4 thumbnails, own lightbox */}
            {hasFotosAreaComum && (
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg text-3xl">
                  <h3 className="font-bold uppercase tracking-wide text-3xl">Fotos de Área de Uso Comum</h3>
                </div>
                <div className="border border-t-0 border-border rounded-b-lg p-3 bg-card">
                  <div className="flex gap-2">
                    {property.fotosAreaComum!.slice(0, 4).map((img, i) => (
                      <button key={i} onClick={() => openLightbox(i, property.fotosAreaComum!)} className="flex-1 aspect-[4/3] rounded-lg overflow-hidden hover:opacity-80 transition-opacity border border-border">
                        <img src={img} alt={`Área comum ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* Map - only for admin/corretor */}
            {property.latitude && property.longitude && (hasRole("admin") || hasRole("corretor")) && (
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg">
                  <h3 className="font-bold uppercase tracking-wide text-3xl">Localização no Mapa</h3>
                </div>
                <div className="border border-t-0 border-border rounded-b-lg overflow-hidden">
                  <PropertyMap properties={properties} highlightCode={property.code} className="h-[400px] w-full" />
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Metragem */}
            {(property.areaTerreno || property.areaConstruida || property.area) && (
              <div className="rounded-[20px] overflow-hidden bg-background border border-primary">
                <h3 className="font-extrabold uppercase tracking-wider text-2xl text-center text-primary-foreground bg-primary px-7 py-4">Metragem</h3>
                <div className="flex flex-col gap-4 bg-background p-[15px]">
                  {property.areaTerreno && (
                    <InlineEditField value={String(property.areaTerreno)} field="Área Terreno" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("areaTerreno", v)} type="number">
                      <div className="w-full flex items-center justify-start text-3xl">
                        <span className="flex items-center gap-2.5 min-w-[120px] text-3xl text-black font-normal"><LandPlot className="w-[18px] h-[18px] text-primary" /> terreno:</span>
                        <span className="font-bold text-primary ml-auto text-3xl">{property.areaTerreno} m<sup className="text-[0.7em]">2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.areaConstruida && (
                    <InlineEditField value={String(property.areaConstruida)} field="Área Construída" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("areaConstruida", v)} type="number">
                      <div className="flex items-center w-full">
                        <span className="flex items-center gap-2.5 min-w-[120px] text-3xl text-black font-normal"><Home className="w-[18px] h-[18px] text-primary" /> casa:</span>
                        <span className="font-bold text-primary ml-auto text-3xl">{property.areaConstruida} m<sup className="text-[0.7em]">2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.area && !property.areaConstruida && !property.areaTerreno && (
                    <InlineEditField value={String(property.area)} field="Área" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("area", v)} type="number">
                      <div className="flex items-center w-full">
                        <span className="flex items-center gap-2.5 text-primary-foreground/85 text-[0.95rem] min-w-[120px]"><Square className="w-[18px] h-[18px] text-primary-foreground/90" /> área:</span>
                        <span className="font-bold text-primary-foreground text-[1.15rem] ml-auto">{property.area} m<sup className="text-[0.7em]">2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                </div>
              </div>
            )}

            {/* Características — with bullet circle before icon */}
            {characteristics.length > 0 && (
              <div className="rounded-[20px] overflow-hidden bg-background border border-primary">
                <h3 className="font-extrabold uppercase tracking-wider text-2xl text-center text-primary-foreground bg-primary px-7 py-4">Características</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-background p-[15px]">
                  {property.bedrooms != null && (
                    <InlineEditField value={String(property.bedrooms)} field="Quartos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("bedrooms", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bed className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.bedrooms} {property.suites ? `quartos (${property.suites} suíte${(property.suites ?? 0) > 1 ? "s" : ""})` : "quartos"}</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.suites != null && (
                    <InlineEditField value={String(property.suites)} field="Suítes" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("suites", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bed className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.suites} suítes</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.salas != null && (
                    <InlineEditField value={String(property.salas)} field="Salas" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("salas", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Sofa className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.salas} {(property.salas ?? 0) > 1 ? "salas" : "sala"}</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.bathrooms != null && (
                    <InlineEditField value={String(property.bathrooms)} field="Banheiros" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("bathrooms", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bath className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.bathrooms} banheiros</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.parking != null && (
                    <InlineEditField value={String(property.parking)} field="Garagem" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("parking", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Car className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.parking} garagem</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.lavabos != null && (
                    <InlineEditField value={String(property.lavabos)} field="Lavabos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("lavabos", v)} type="number">
                      <div className="flex items-center gap-2 py-0.5 text-3xl">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Droplets className="text-primary flex-shrink-0 w-[18px] h-[18px] text-3xl" />
                        <span className="text-foreground text-3xl">{property.lavabos} {(property.lavabos ?? 0) > 1 ? "lavabos" : "lavabo"}</span>
                      </div>
                    </InlineEditField>
                  )}
                </div>
              </div>
            )}

            {/* Acabamentos — with dashes */}
            {hasAcabamentos && (
              <div className="rounded-[20px] overflow-hidden bg-background border border-primary">
                <h3 className="font-extrabold uppercase tracking-wider text-2xl text-center text-primary-foreground bg-primary px-7 py-4">Acabamentos</h3>
                <div className="bg-background p-[15px]">
                  <InlineEditField value={(property.acabamentos || []).join(", ")} field="Acabamentos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("acabamentos", v)} type="textarea">
                    <div className="flex flex-col gap-1.5">
                      {property.acabamentos!.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 font-bold text-3xl">—</span>
                          <span className="text-foreground text-3xl">{item}</span>
                        </div>
                      ))}
                    </div>
                  </InlineEditField>
                </div>
              </div>
            )}

            {/* Áreas de Uso Comum — only for condos */}
            {hasAmenidades && (
              <div className="rounded-[20px] overflow-hidden bg-background border border-primary">
                <h3 className="font-extrabold uppercase tracking-wider text-2xl text-center text-primary-foreground bg-primary px-7 py-4">Áreas de Uso Comum</h3>
                <div className="bg-background p-[15px]">
                  <InlineEditField value={(property.amenidades || []).join(", ")} field="Amenidades" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("amenidades", v)} type="textarea">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {property.amenidades!.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <AmenidadeIcon name={item} />
                          <span className="text-foreground text-3xl">{item}</span>
                        </div>
                      ))}
                    </div>
                  </InlineEditField>
                </div>
              </div>
            )}

            {/* Apta a financiamento bancário */}
            {property.aceitaFinanciamento && (
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground text-3xl">Apta a financiamento bancário</span>
              </div>
            )}

            {/* Valor de Venda */}
            {(property.transactionType === "venda" || property.transactionType === "venda/aluguel") && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-muted-foreground uppercase font-semibold mb-1 text-3xl">Valor de Venda</p>
                <InlineEditField value={property.priceFormatted} field="Preço Venda" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("priceFormatted", v)}>
                  <span className="font-bold text-primary text-3xl">{property.priceFormatted}</span>
                </InlineEditField>
              </div>
            )}

            {/* Bloco de Locação */}
            {(property.transactionType === "aluguel" || property.transactionType === "venda/aluguel") && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <p className="text-3xl text-muted-foreground uppercase font-semibold">Valores de Locação</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl text-muted-foreground">Aluguel:</span>
                  <span className="text-3xl font-bold text-primary">{property.valorAluguelFormatted || property.priceFormatted}</span>
                </div>
                {hasTaxas && property.taxasAdicionais!.map((taxa, i) => (
                  <div key={i} className="flex justify-between items-center border-t border-border pt-2">
                    <span className="text-3xl text-muted-foreground">{taxa.nome}:</span>
                    <span className="text-3xl font-semibold text-foreground">{taxa.valor}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Condições de Pagamento */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                {isAluguel ? (
                  <span className="text-3xl font-medium text-muted-foreground italic">Valores sujeito a alterações</span>
                ) : (
                  <InlineEditField value={property.condicoesPagamento || "consulte"} field="Condições Pagamento" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("condicoesPagamento", v)}>
                    <span className="font-medium text-foreground text-3xl">condições de pagamento: {property.condicoesPagamento || "consulte"}</span>
                  </InlineEditField>
                )}
              </div>
            </div>

            {/* Documentação para Locação — só exibir se for locação */}
            {isAluguel && (
              <a
                href="/documentos/documentacao-locacao.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm uppercase hover:bg-accent/80 transition-colors"
              >
                <Info className="w-4 h-4" />
                Documentação para Locação
              </a>
            )}

            {/* CTAs — stack on mobile, side by side on sm+ */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold uppercase w-full text-2xl">
                <a href={property.linkWhatsapp || "https://wa.me/555198765432"} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 font-bold uppercase border-foreground text-foreground hover:bg-muted w-full text-2xl">
                <a href={`mailto:${property.emailContato || "contato@sinosimoveis.com.br"}`}>
                  <Mail className="w-4 h-4" />
                  E-mail
                </a>
              </Button>
            </div>

            {/* Sugestão + Acompanhar */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold uppercase w-full text-center text-base">
                <a href={`https://wa.me/555198765432?text=${encodeURIComponent("Olá, tenho uma sugestão de melhoria para o imóvel " + property.code)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  Sugestão de Melhoria
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 font-bold uppercase border-foreground text-foreground hover:bg-muted w-full text-sm">
                <a href={`mailto:${property.emailContato || "contato@sinosimoveis.com.br"}?subject=${encodeURIComponent("Acompanhar novidades - " + property.code)}`}>
                  <Mail className="w-4 h-4" />
                  Acompanhar Novidades
                </a>
              </Button>
            </div>

            {/* Action buttons: share, favorite, print, financing */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <a
                href={property.linkWhatsapp || "https://wa.me/555198765432"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-primary font-bold hover:underline text-2xl"
              >
                <MessageCircle className="w-5 h-5" />
                Mais Informações via WhatsApp
              </a>
              <p className="text-muted-foreground leading-relaxed text-center text-2xl">
                Os preços, disponibilidades e condições de pagamento poderão ser alterados sem prévia comunicação.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => navigator.share?.({ title: property.title, url: window.location.href }) || navigator.clipboard.writeText(window.location.href)}
                  className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFavorite(property.code)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorite(property.code) ? "bg-yellow-400 text-foreground" : "bg-foreground text-background hover:bg-foreground/80"}`}
                  title="Favoritar"
                >
                  <Star className={`w-4 h-4 ${isFavorite(property.code) ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  title="Simulação Financeira"
                  onClick={() => window.open("https://www.caixa.gov.br/voce/habitacao/Paginas/default.aspx", "_blank")}
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>

              {/* Social media links */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-border">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#1877F2', color: '#fff' }}>
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}>
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#000000', color: '#fff' }}>
                  <TikTokIcon className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#FF0000', color: '#fff' }}>
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
              {/* Corretor */}
            {property.corretor && (
              <div className="rounded-xl border border-border bg-card p-4 mt-2">
                <p className="text-muted-foreground mb-2 text-2xl">Corretor responsável</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="font-bold text-primary text-2xl">{property.corretor.nome.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-3xl">{property.corretor.nome}</p>
                    <p className="text-muted-foreground text-2xl">{property.corretor.creci}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Imóveis Semelhantes ── */}
      {similarProperties.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground text-center mb-16 uppercase tracking-wide md:text-3xl">
              Imóveis Semelhantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-[70px]">
              {similarProperties.map((p) => (
                <PropertyCard key={p.code} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

/* ── Amenidade icon mapper ── */
function AmenidadeIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const cls = "w-4 h-4 text-primary flex-shrink-0";
  if (lower.includes("academia")) return <Dumbbell className={cls} />;
  if (lower.includes("piscina")) return <Waves className={cls} />;
  if (lower.includes("salão") || lower.includes("festa")) return <PartyPopper className={cls} />;
  if (lower.includes("gourmet")) return <UtensilsCrossed className={cls} />;
  if (lower.includes("segurança") || lower.includes("portaria")) return <ShieldCheck className={cls} />;
  if (lower.includes("playground") || lower.includes("jardim")) return <TreePine className={cls} />;
  if (lower.includes("quadra")) return <Square className={cls} />;
  if (lower.includes("market") || lower.includes("mercado")) return <Store className={cls} />;
  if (lower.includes("elevador") || lower.includes("condomínio")) return <Building className={cls} />;
  if (lower.includes("área verde")) return <Flower2 className={cls} />;
  return <CheckCircle2 className={cls} />;
}

/* ── Build characteristics ── */
function buildCharacteristics(p: Property) {
  const items: { icon: React.ElementType; label: string; value: string | number }[] = [];
  if (p.bedrooms) items.push({ icon: Bed, label: p.suites ? `quartos (${p.suites} suíte${p.suites > 1 ? "s" : ""})` : "quartos", value: p.bedrooms });
  if (!p.bedrooms && p.suites) items.push({ icon: Bed, label: "suítes", value: p.suites });
  if (p.salas) items.push({ icon: Sofa, label: p.salas > 1 ? "salas" : "sala", value: p.salas });
  if (p.lavabos) items.push({ icon: Droplets, label: p.lavabos > 1 ? "lavabos" : "lavabo", value: p.lavabos });
  if (p.hasPool) items.push({ icon: Waves, label: "piscina", value: 1 });
  if (p.bathrooms) items.push({ icon: Bath, label: "banheiros", value: p.bathrooms });
  if (p.parking) items.push({ icon: Car, label: "garagem", value: p.parking });
  return items;
}

export default PropertyDetail;
