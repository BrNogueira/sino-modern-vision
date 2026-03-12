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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { properties, type Property } from "@/data/properties";
import { useFavorites } from "@/contexts/FavoritesContext";

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ─── Reusable sub-components ─── */

const PropertyCharacteristicItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-sm font-semibold text-foreground leading-tight">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
    <span className="w-1 h-5 bg-primary rounded-full inline-block" />
    {children}
  </h3>
);

const LightboxOverlay = ({ images, index, onClose, onPrev, onNext }: { images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) => (
  <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/20 text-background flex items-center justify-center hover:bg-background/40 transition-colors"><X className="w-6 h-6" /></button>
    <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 text-background flex items-center justify-center hover:bg-background/40"><ChevronLeft className="w-7 h-7" /></button>
    <img src={images[index]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 text-background flex items-center justify-center hover:bg-background/40"><ChevronRight className="w-7 h-7" /></button>
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-background/20 text-background text-sm">{index + 1} / {images.length}</div>
  </div>
);

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
  const showAreaComum = hasFotosAreaComum && ["Condomínio", "Apartamento"].includes(property.type) || hasFotosAreaComum;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Lightbox */}
      {lightbox.open && <LightboxOverlay images={gallery} index={lightbox.index} onClose={closeLightbox} onPrev={lightboxPrev} onNext={lightboxNext} />}

      {/* Title bar */}
      <div className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-1">
              <Link to="/" className="hover:text-primary-foreground transition-colors">Início</Link>
              <span>/</span>
              <Link to="/imoveis" className="hover:text-primary-foreground transition-colors">Imóveis</Link>
              <span>/</span>
              <span className="text-primary-foreground">{property.title}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded bg-background text-primary text-sm font-bold">COD: {property.code}</span>
            <button onClick={() => toggleFavorite(property.code)} className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite(property.code) ? "fill-current text-red-400" : "text-primary-foreground"}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition-colors">
              <Share2 className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT — Image + gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/10]">
              <img src={gallery[currentImage]} alt={property.title} className="w-full h-full object-cover cursor-pointer" onClick={() => openLightbox(currentImage)} />
              {gallery.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">{currentImage + 1} / {gallery.length}</div>
                </>
              )}
            </div>

            {/* Thumbnail gallery */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description (mobile: after gallery, desktop: here) */}
            {property.description && (
              <div className="block lg:hidden">
                <SectionTitle>Descrição</SectionTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Fotos de Área de Uso Comum */}
            {showAreaComum && (
              <div>
                <SectionTitle>Fotos de Área de Uso Comum</SectionTitle>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {property.fotosAreaComum!.map((img, i) => (
                    <button key={i} onClick={() => openLightbox(gallery.indexOf(img) >= 0 ? gallery.indexOf(img) : 0)} className="aspect-[4/3] rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                      <img src={img} alt={`Área comum ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description — desktop */}
            {property.description && (
              <div className="hidden lg:block">
                <SectionTitle>Descrição</SectionTitle>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Price card */}
            <div className="rounded-xl bg-primary p-5 text-primary-foreground">
              <p className="text-sm opacity-80 mb-1">Valor</p>
              <p className="text-3xl font-bold">{property.priceFormatted}</p>
              {property.aceitaFinanciamento && (
                <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
                  <Banknote className="w-4 h-4" />
                  <span>Aceita financiamento bancário</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full bg-[hsl(142,72%,42%)] hover:bg-[hsl(142,72%,36%)] text-primary-foreground gap-2">
                <a href={property.linkWhatsapp || "https://wa.me/555198765432"} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Conversar no WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full gap-2">
                <a href={`mailto:${property.emailContato || "contato@sinosimoveis.com.br"}`}>
                  <Mail className="w-5 h-5" />
                  Receber informações por e-mail
                </a>
              </Button>
            </div>

            {/* Características */}
            {characteristics.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionTitle>Características</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {characteristics.map((c, i) => (
                    <PropertyCharacteristicItem key={i} icon={c.icon} label={c.label} value={c.value} />
                  ))}
                </div>
              </div>
            )}

            {/* Acabamentos */}
            {hasAcabamentos && (
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionTitle>Acabamentos</SectionTitle>
                <ul className="space-y-2">
                  {property.acabamentos!.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenidades */}
            {hasAmenidades && (
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionTitle>Áreas de Uso Comum</SectionTitle>
                <ul className="space-y-2">
                  {property.amenidades!.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Corretor */}
            {property.corretor && (
              <div className="rounded-xl border border-border bg-card p-5">
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

/* Build dynamic characteristics list */
function buildCharacteristics(p: Property) {
  const items: { icon: React.ElementType; label: string; value: string | number }[] = [];
  if (p.areaTerreno) items.push({ icon: LandPlot, label: "Terreno", value: `${p.areaTerreno} m²` });
  if (p.areaConstruida) items.push({ icon: Home, label: "Área construída", value: `${p.areaConstruida} m²` });
  if (p.bedrooms) items.push({ icon: Bed, label: "Quartos", value: p.bedrooms });
  if (p.suites) items.push({ icon: Bed, label: "Suítes", value: p.suites });
  if (p.salas) items.push({ icon: Sofa, label: "Salas", value: p.salas });
  if (p.lavabos) items.push({ icon: Droplets, label: "Lavabos", value: p.lavabos });
  if (p.bathrooms) items.push({ icon: Bath, label: "Banheiros", value: p.bathrooms });
  if (p.parking) items.push({ icon: Car, label: "Vagas", value: p.parking });
  if (p.hasPool) items.push({ icon: Waves, label: "Piscina", value: "Sim" });
  if (p.area && !p.areaConstruida) items.push({ icon: Square, label: "Área", value: `${p.area} m²` });
  return items;
}

export default PropertyDetail;
