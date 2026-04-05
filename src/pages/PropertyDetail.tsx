import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { properties, type Property } from "@/data/properties";
import { useFavorites } from "@/contexts/FavoritesContext";

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

/* ─── Main Page ─── */
const PropertyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
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
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [showTaxas, setShowTaxas] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const nextImage = useCallback(() => setCurrentImage((i) => (i + 1) % gallery.length), [gallery.length]);
  const prevImage = useCallback(() => setCurrentImage((i) => (i - 1 + gallery.length) % gallery.length), [gallery.length]);

  const openLightbox = (i: number) => setLightbox({ open: true, index: i });
  const closeLightbox = () => setLightbox({ ...lightbox, open: false });
  const lightboxPrev = () => setLightbox((s) => ({ ...s, index: (s.index - 1 + gallery.length) % gallery.length }));
  const lightboxNext = () => setLightbox((s) => ({ ...s, index: (s.index + 1) % gallery.length }));

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

      {lightbox.open && <LightboxOverlay images={gallery} index={lightbox.index} onClose={closeLightbox} onPrev={lightboxPrev} onNext={lightboxNext} onGoTo={(i) => setLightbox({ open: true, index: i })} />}

      {/* ── Title Bar ── */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>/</span>
              <Link to="/imoveis" className="hover:text-primary transition-colors">Imóveis</Link>
              <span>/</span>
              <span className="text-foreground">{property.title}</span>
            </nav>
            <InlineEditField value={property.title} field="Título" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("title", v)}>
              <h1 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide">
                <span className="text-primary">{property.type}</span> — {property.title}
              </h1>
            </InlineEditField>
            {property.city && property.neighborhood && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.neighborhood}, ${property.city} - ${property.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-1"
              >
                <MapPin className="w-4 h-4 text-primary" />
                {property.city} - {property.neighborhood}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
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

              {/* Thumbnail gallery grid */}
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-4">
                  {gallery.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </InlinePhotoEditor>

            {/* Fotos de Área de Uso Comum — only for condos */}
            {hasFotosAreaComum && (
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Fotos de Área de Uso Comum</h3>
                </div>
                <div className="border border-t-0 border-border rounded-b-lg p-3 bg-card">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {property.fotosAreaComum!.map((img, i) => (
                      <button key={i} onClick={() => openLightbox(gallery.indexOf(img) >= 0 ? gallery.indexOf(img) : 0)} className="aspect-[4/3] rounded-lg overflow-hidden hover:opacity-80 transition-opacity border border-border">
                        <img src={img} alt={`Área comum ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-bold text-foreground mb-2">
                  Descrição do Imóvel
                  {property.transactionType && (
                    <span className="ml-2 text-primary font-bold">
                      — {property.transactionType === "venda" ? "Venda" : property.transactionType === "aluguel" ? "Aluguel" : "Venda/Aluguel"}
                    </span>
                  )}
                </h3>
                <InlineEditField value={property.description || ""} field="Descrição" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("description", v)} type="textarea">
                  <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
                </InlineEditField>
              </div>
            )}

            {/* Map - only for admin/corretor */}
            {property.latitude && property.longitude && (hasRole("admin") || hasRole("corretor")) && (
              <div>
                <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-t-lg">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Localização no Mapa</h3>
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
              <div className="rounded-2xl bg-primary p-6">
                <h3 className="text-xl font-bold text-primary-foreground uppercase tracking-wide mb-4 pb-3 border-b border-primary-foreground/30">Metragem</h3>
                <div className="space-y-4">
                  {property.areaTerreno && (
                    <InlineEditField value={String(property.areaTerreno)} field="Área Terreno" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("areaTerreno", v)} type="number">
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2.5 text-primary-foreground/90 text-base"><LandPlot className="w-5 h-5 text-primary-foreground" /> terreno:</span>
                        <span className="font-bold text-primary-foreground text-xl">{property.areaTerreno} m<sup>2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.areaConstruida && (
                    <InlineEditField value={String(property.areaConstruida)} field="Área Construída" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("areaConstruida", v)} type="number">
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2.5 text-primary-foreground/90 text-base"><Home className="w-5 h-5 text-primary-foreground" /> casa:</span>
                        <span className="font-bold text-primary-foreground text-xl">{property.areaConstruida} m<sup>2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.area && !property.areaConstruida && !property.areaTerreno && (
                    <InlineEditField value={String(property.area)} field="Área" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("area", v)} type="number">
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2.5 text-primary-foreground/90 text-base"><Square className="w-5 h-5 text-primary-foreground" /> área:</span>
                        <span className="font-bold text-primary-foreground text-xl">{property.area} m<sup>2</sup></span>
                      </div>
                    </InlineEditField>
                  )}
                </div>
              </div>
            )}

            {/* Características — with bullet circle before icon */}
            {characteristics.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Características</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {property.bedrooms != null && (
                    <InlineEditField value={String(property.bedrooms)} field="Quartos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("bedrooms", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bed className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.bedrooms} {property.suites ? `quartos (${property.suites} suíte${(property.suites ?? 0) > 1 ? "s" : ""})` : "quartos"}</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.suites != null && (
                    <InlineEditField value={String(property.suites)} field="Suítes" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("suites", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bed className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.suites} suítes</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.salas != null && (
                    <InlineEditField value={String(property.salas)} field="Salas" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("salas", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Sofa className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.salas} {(property.salas ?? 0) > 1 ? "salas" : "sala"}</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.bathrooms != null && (
                    <InlineEditField value={String(property.bathrooms)} field="Banheiros" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("bathrooms", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Bath className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.bathrooms} banheiros</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.parking != null && (
                    <InlineEditField value={String(property.parking)} field="Garagem" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("parking", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Car className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.parking} garagem</span>
                      </div>
                    </InlineEditField>
                  )}
                  {property.lavabos != null && (
                    <InlineEditField value={String(property.lavabos)} field="Lavabos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("lavabos", v)} type="number">
                      <div className="flex items-center gap-2 text-sm py-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <Droplets className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{property.lavabos} {(property.lavabos ?? 0) > 1 ? "lavabos" : "lavabo"}</span>
                      </div>
                    </InlineEditField>
                  )}
                </div>
              </div>
            )}

            {/* Acabamentos — with dashes */}
            {hasAcabamentos && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Acabamentos</h3>
                <InlineEditField value={(property.acabamentos || []).join(", ")} field="Acabamentos" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("acabamentos", v)} type="textarea">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {property.acabamentos!.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5 font-bold">—</span>
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </InlineEditField>
              </div>
            )}

            {/* Áreas de Uso Comum — only for condos */}
            {hasAmenidades && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Áreas de Uso Comum</h3>
                <InlineEditField value={(property.amenidades || []).join(", ")} field="Amenidades" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("amenidades", v)} type="textarea">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {property.amenidades!.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AmenidadeIcon name={item} />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </InlineEditField>
              </div>
            )}

            {/* Financiamento */}
            {property.aceitaFinanciamento && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">Apta a financiamento bancário</span>
              </div>
            )}

            {/* Price */}
            <div className="rounded-xl border-2 border-foreground bg-card p-4 text-center">
              <InlineEditField value={property.priceFormatted} field="Preço" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("priceFormatted", v)}>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{property.priceFormatted}</p>
              </InlineEditField>
            </div>

            {/* Condições de pagamento / Taxas adicionais for aluguel */}
            {isAluguel ? (
              <div className="space-y-2">
                {hasTaxas && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTaxas(!showTaxas)}
                      onMouseEnter={() => setShowTaxas(true)}
                      onMouseLeave={() => setShowTaxas(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm uppercase hover:bg-accent/80 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      Taxas Adicionais
                    </button>
                    {showTaxas && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-3 z-20">
                        {property.taxasAdicionais!.map((taxa, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="text-muted-foreground">{taxa.nome}:</span>
                            <span className="font-semibold text-foreground">{taxa.valor}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {property.condicoesPagamento && (
                  <InlineEditField value={property.condicoesPagamento} field="Documentação Locação" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("condicoesPagamento", v)}>
                    <p className="text-xs text-muted-foreground italic px-1">Documentação para locação: {property.condicoesPagamento}</p>
                  </InlineEditField>
                )}
              </div>
            ) : (
              <div className="px-1">
                <InlineEditField value={property.condicoesPagamento || "consulte"} field="Condições Pagamento" propertyCode={property.code} propertyTitle={property.title} onSave={(v) => updateField("condicoesPagamento", v)}>
                  <p className="text-xs text-muted-foreground italic">condições de pagamento: {property.condicoesPagamento || "consulte"}</p>
                </InlineEditField>
              </div>
            )}

            {/* CTAs — side by side */}
            <div className="grid grid-cols-2 gap-2">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs font-bold uppercase">
                <a href={property.linkWhatsapp || "https://wa.me/555198765432"} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-xs font-bold uppercase border-foreground text-foreground hover:bg-muted">
                <a href={`mailto:${property.emailContato || "contato@sinosimoveis.com.br"}`}>
                  <Mail className="w-4 h-4" />
                  E-mail
                </a>
              </Button>
            </div>

            {/* Action buttons: share, favorite, print, financing */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <a
                href={property.linkWhatsapp || "https://wa.me/555198765432"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-primary font-bold text-sm hover:underline"
              >
                <MessageCircle className="w-5 h-5" />
                Mais Informações via WhatsApp
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
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
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground">
                  <TikTokIcon className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Corretor */}
            {property.corretor && (
              <div className="rounded-xl border border-border bg-card p-4 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Corretor responsável</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-base font-bold text-primary">{property.corretor.nome.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{property.corretor.nome}</p>
                    <p className="text-xs text-muted-foreground">{property.corretor.creci}</p>
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
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8 uppercase tracking-wide">
              Imóveis Semelhantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
