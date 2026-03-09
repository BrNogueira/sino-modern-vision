import { Search, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-house.jpg";

const HeroSection = () => {
  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[55vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
        </div>
      </div>

      {/* Search Section - overlapping */}
      <div className="relative -mt-16 z-10 container mx-auto px-4">
        <div className="flex items-start gap-4">
          {/* Search Box */}
          <div className="flex-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center border-b border-border">
              <div className="flex items-center flex-1 px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  placeholder="Clique para iniciar sua busca"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="px-6 py-3 bg-[#e6a817] hover:bg-[#d49b15] text-white font-semibold transition-colors">
                Buscar
              </button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-border">
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Código"
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select className="px-3 py-2 bg-transparent outline-none text-sm text-foreground border-none">
                <option>Tipo de Imóvel</option>
                <option>Casa</option>
                <option>Apartamento</option>
                <option>Terreno</option>
                <option>Sítio</option>
                <option>Comercial</option>
              </select>
              <select className="px-3 py-2 bg-transparent outline-none text-sm text-foreground border-none">
                <option>Estado</option>
                <option>RS</option>
              </select>
              <select className="px-3 py-2 bg-transparent outline-none text-sm text-foreground border-none">
                <option>Cidade</option>
                <option>Novo Hamburgo</option>
                <option>São Leopoldo</option>
                <option>Campo Bom</option>
                <option>Estância Velha</option>
              </select>
              <select className="px-3 py-2 bg-transparent outline-none text-sm text-foreground border-none">
                <option>Bairro</option>
              </select>
              <select className="px-3 py-2 bg-transparent outline-none text-sm text-foreground border-none">
                <option>Valor</option>
                <option>Até R$ 200.000</option>
                <option>R$ 200.000 - R$ 500.000</option>
                <option>R$ 500.000 - R$ 1.000.000</option>
                <option>Acima de R$ 1.000.000</option>
              </select>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/5551999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-4 shadow-lg transition-colors min-w-[80px]"
          >
            <MessageCircle className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-semibold text-center leading-tight uppercase">
              Fale com<br />Vendedor
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
