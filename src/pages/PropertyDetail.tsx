import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Car,
  Trees,
  Waves,
  Shield,
  Zap,
  Wind,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import propertyDetail1 from "@/assets/property-detail-1.jpg";
import propertyDetail2 from "@/assets/property-detail-2.jpg";
import propertyDetail3 from "@/assets/property-detail-3.jpg";
import propertyDetail4 from "@/assets/property-detail-4.jpg";
import propertyCasa from "@/assets/property-casa.jpg";

const images = [propertyCasa, propertyDetail1, propertyDetail2, propertyDetail3, propertyDetail4];

const features = [
  { icon: Bed, label: "4 Quartos", description: "Sendo 2 suítes" },
  { icon: Bath, label: "3 Banheiros", description: "Com acabamento premium" },
  { icon: Square, label: "280 m²", description: "Área construída" },
  { icon: Car, label: "3 Vagas", description: "Garagem coberta" },
  { icon: Trees, label: "450 m²", description: "Área do terreno" },
  { icon: Waves, label: "Piscina", description: "Com aquecimento" },
];

const amenities = [
  "Piscina aquecida",
  "Churrasqueira gourmet",
  "Área de lazer completa",
  "Jardim paisagístico",
  "Sistema de segurança 24h",
  "Energia solar",
  "Ar condicionado central",
  "Closet planejado",
  "Cozinha americana",
  "Home office",
  "Lavabo social",
  "Despensa",
];

const PropertyDetail = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "Olá, tenho interesse neste imóvel. Gostaria de mais informações.",
  });

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>/</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Casas</span>
          <span>/</span>
          <span className="text-foreground font-medium">Casa Moderna com Piscina</span>
        </nav>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 mb-8">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Main Image */}
          <div className="relative h-[300px] md:h-[500px] overflow-hidden">
            <img
              src={images[currentImage]}
              alt={`Imagem ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium">
              {currentImage + 1} / {images.length}
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-accent"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? "fill-accent text-accent" : "text-foreground"
                  }`}
                />
              </button>
              <button className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:text-primary-foreground">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Thumbnail Strip */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage === index
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Info */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  Casa
                </span>
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  Destaque
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Casa Moderna com Piscina
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Rua das Palmeiras, 456 - Bairro Jardins, Novo Hamburgo, RS</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-muted-foreground text-sm mb-1">Valor do imóvel</p>
              <p className="text-4xl font-bold text-primary">R$ 850.000</p>
              <p className="text-muted-foreground text-sm mt-1">
                ou parcelas a partir de R$ 4.500/mês
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <feature.icon className="w-6 h-6 text-primary mb-2" />
                    <p className="font-semibold text-foreground">{feature.label}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Descrição</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <p>
                  Esta magnífica casa moderna representa o ápice do luxo e conforto. Com arquitetura 
                  contemporânea e acabamentos de alto padrão, oferece uma experiência de moradia 
                  incomparável.
                </p>
                <p>
                  O imóvel conta com amplos espaços integrados, perfeitos para receber família e amigos. 
                  A área de lazer completa inclui piscina aquecida com cascata, churrasqueira gourmet 
                  e jardim paisagístico cuidadosamente projetado.
                </p>
                <p>
                  A cozinha americana totalmente equipada conecta-se harmoniosamente à sala de estar, 
                  criando um ambiente acolhedor e funcional. Os quartos são amplos e arejados, com 
                  closets planejados e banheiros com acabamento premium.
                </p>
                <p>
                  Localizada em um dos bairros mais nobres de Novo Hamburgo, a propriedade oferece 
                  fácil acesso a escolas, hospitais e centros comerciais, garantindo praticidade 
                  e qualidade de vida para toda a família.
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Comodidades</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Diferenciais</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
                  <Shield className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Segurança 24h</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
                  <Zap className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Energia Solar</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
                  <Wind className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Ar Central</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
                  <Waves className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Piscina Aquecida</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Entre em contato</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Preencha o formulário abaixo que entraremos em contato
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Seu telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Sua mensagem"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Enviar mensagem
                </Button>
              </form>

              {/* Contact Options */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Ou entre em contato diretamente:</p>
                <div className="space-y-3">
                  <a
                    href="tel:+555198765432"
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">(51) 9876-5432</span>
                  </a>
                  <a
                    href="mailto:contato@sinosimoveis.com.br"
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">contato@sinosimoveis.com.br</span>
                  </a>
                  <a
                    href="https://wa.me/555198765432"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Agent Info */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Corretor responsável</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">JM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">João Martins</p>
                    <p className="text-sm text-muted-foreground">CRECI 12345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PropertyDetail;
