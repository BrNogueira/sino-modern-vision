import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { properties, type Property } from "@/data/properties";
import { useFavorites } from "@/contexts/FavoritesContext";

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ─── Lightbox (fullscreen gallery like reference) ─── */
const LightboxOverlay = ({ images, index, onClose, onPrev, onNext, onGoTo }: { images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void; onGoTo: (i: number) => void }) => {
  const thumbContainerRef = useState<HTMLDivElement | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(0,0%,8%)] flex flex-col" onClick={(e) => e.stopPropagation()}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-[hsl(0,0%,70%)] text-sm font-medium">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="w-10 h-10 rounded-lg flex items-center justify-center text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)] hover:bg-[hsl(0,0%,20%)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 px-16">
        {/* Left arrow */}
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,100%)] transition-colors z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Image */}
        <img
          src={images[index]}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {/* Right arrow */}
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,100%)] transition-colors z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Thumbnails strip */}
      <div className="flex-shrink-0 bg-[hsl(0,0%,12%)] border-t border-[hsl(0,0%,20%)]">
        <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`flex-shrink-0 w-[90px] h-[60px] rounded overflow-hidden border-2 transition-all ${
                i === index
                  ? "border-[hsl(0,0%,100%)] opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const PropertyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const property = properties.find((p) => generateSlug(p.title) === slug) || properties[0];

  const gallery = property.gallery?.length ? property.gallery : [property.image];
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
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
            <h1 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide">{property.title}</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-bold">CÓD: {property.code}</span>
            <button onClick={() => toggleFavorite(property.code)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Heart className={`w-4 h-4 ${isFavorite(property.code) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
            <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
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

            {/* Main image with Venda/Aluguel badge */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/10] border border-border">
              <img src={gallery[currentImage]} alt={property.title} className="w-full h-full object-cover cursor-pointer" onClick={() => openLightbox(currentImage)} />
              {/* Transaction badge */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${property.transactionType === "venda" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {property.transactionType === "venda" ? "Venda" : "Aluguel"}
                </span>
              </div>
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
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => { setCurrentImage(i); }} className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Fotos de Área de Uso Comum — green header bar */}
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
                <h3 className="text-base font-bold text-foreground mb-2">Descrição do Imóvel</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Metragem */}
            {(property.areaTerreno || property.areaConstruida) && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Metragem</h3>
                <div className="space-y-2">
                  {property.areaTerreno && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">terreno:</span>
                      <span className="font-semibold text-foreground">{property.areaTerreno} m²</span>
                    </div>
                  )}
                  {property.areaConstruida && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">casa:</span>
                      <span className="font-semibold text-foreground">{property.areaConstruida} m²</span>
                    </div>
                  )}
                  {property.area && !property.areaConstruida && !property.areaTerreno && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">área:</span>
                      <span className="font-semibold text-foreground">{property.area} m²</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Características — two columns with bullet icons */}
            {characteristics.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Características</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {characteristics.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-0.5">
                      <c.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{c.value} {c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acabamentos */}
            {hasAcabamentos && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Acabamentos</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {property.acabamentos!.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground mt-0.5">~</span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Áreas de Uso Comum */}
            {hasAmenidades && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">Áreas de Uso Comum</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {property.amenidades!.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AmenidadeIcon name={item} />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
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
              <p className="text-2xl md:text-3xl font-bold text-foreground">{property.priceFormatted}</p>
            </div>

            {/* Condições de pagamento */}
            <div className="px-1">
              <p className="text-xs text-muted-foreground italic">condições de pagamento:</p>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-sm font-bold uppercase">
                <a href={property.linkWhatsapp || "https://wa.me/555198765432"} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Conversar no WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full gap-2 text-sm font-bold uppercase border-foreground text-foreground hover:bg-muted">
                <a href={`mailto:${property.emailContato || "contato@sinosimoveis.com.br"}`}>
                  <Mail className="w-5 h-5" />
                  Receber Informações por E-mail
                </a>
              </Button>
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