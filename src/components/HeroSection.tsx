import { Search, MapPin, Home, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-house.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-16 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            <span className="text-primary-foreground text-sm font-medium">
              +500 imóveis disponíveis
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Encontre o imóvel dos{" "}
            <span className="text-accent">seus sonhos</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Casas, apartamentos, terrenos e muito mais na região do Vale dos Sinos. 
            Sua nova história começa aqui.
          </p>

          {/* Search Box */}
          <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-elegant animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Localização
                </label>
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <select className="bg-transparent flex-1 text-foreground focus:outline-none cursor-pointer">
                    <option>Todas as cidades</option>
                    <option>Novo Hamburgo</option>
                    <option>São Leopoldo</option>
                    <option>Campo Bom</option>
                    <option>Estância Velha</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Tipo de Imóvel
                </label>
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <Home className="w-5 h-5 text-primary" />
                  <select className="bg-transparent flex-1 text-foreground focus:outline-none cursor-pointer">
                    <option>Todos os tipos</option>
                    <option>Casas</option>
                    <option>Apartamentos</option>
                    <option>Terrenos</option>
                    <option>Comerciais</option>
                    <option>Sítios</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Faixa de Preço
                </label>
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <select className="bg-transparent flex-1 text-foreground focus:outline-none cursor-pointer">
                    <option>Qualquer valor</option>
                    <option>Até R$ 200.000</option>
                    <option>R$ 200.000 - R$ 500.000</option>
                    <option>R$ 500.000 - R$ 1.000.000</option>
                    <option>Acima de R$ 1.000.000</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button variant="hero" size="xl" className="w-full">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-primary-foreground/70">Imóveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">15+</div>
              <div className="text-sm text-primary-foreground/70">Anos de experiência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">1000+</div>
              <div className="text-sm text-primary-foreground/70">Clientes satisfeitos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
