import { useState } from "react";
import { Search, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import heroImage from "@/assets/hero-house.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { count } = useFavorites();
  const [transactionType, setTransactionType] = useState<"venda" | "aluguel">("venda");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    code: "",
    state: "RS",
    city: "",
    neighborhood: "",
    type: "",
    priceRange: "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("transacao", transactionType);
    if (searchText) params.set("q", searchText);
    if (filters.code) params.set("codigo", filters.code);
    if (filters.state) params.set("estado", filters.state);
    if (filters.city) params.set("cidade", filters.city);
    if (filters.neighborhood) params.set("bairro", filters.neighborhood);
    if (filters.type) params.set("tipo", filters.type);
    if (filters.priceRange) params.set("valor", filters.priceRange);
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-[45vh] md:h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
        </div>
      </div>

      {/* Search Section */}
      <div className="relative -mt-14 z-10 container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Main Search Row */}
          <div className="flex items-center border-b border-border">
            <div className="flex items-center flex-1 px-4 py-3">
              <Search className="w-5 h-5 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Clique para iniciar sua busca"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Venda / Aluguel Toggle */}
            <div className="flex border-l border-border">
              <button
                onClick={() => setTransactionType("venda")}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  transactionType === "venda"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                Venda
              </button>
              <button
                onClick={() => setTransactionType("aluguel")}
                className={`px-4 py-3 text-sm font-semibold transition-colors border-l border-border ${
                  transactionType === "aluguel"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                Aluguel
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex items-center divide-x divide-border">
            <input
              type="text"
              placeholder="Código"
              value={filters.code}
              onChange={(e) => setFilters({ ...filters, code: e.target.value })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-24"
            />
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value, city: "", neighborhood: "" })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground"
            >
              <option value="">Estado</option>
              <option value="RS">RS</option>
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value, neighborhood: "" })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground flex-1"
            >
              <option value="">Cidade</option>
              <option value="Novo Hamburgo">Novo Hamburgo</option>
              <option value="São Leopoldo">São Leopoldo</option>
              <option value="Campo Bom">Campo Bom</option>
              <option value="Estância Velha">Estância Velha</option>
            </select>
            <select
              value={filters.neighborhood}
              onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground flex-1"
            >
              <option value="">Bairro</option>
              <option value="Centro">Centro</option>
              <option value="Lomba Grande">Lomba Grande</option>
              <option value="Colina do Sol">Colina do Sol</option>
              <option value="Rondônia">Rondônia</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground flex-1"
            >
              <option value="">Tipo de Imóvel</option>
              <option value="Casa">Casa</option>
              <option value="Terreno">Terreno</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Sítio">Sítio</option>
              <option value="Comercial">Comercial</option>
              <option value="Condomínio">Condomínio</option>
              <option value="Lançamento">Lançamento</option>
              <option value="Pavilhão">Pavilhão</option>
              <option value="Permuta">Permuta</option>
            </select>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-3 py-2.5 bg-transparent outline-none text-sm text-foreground flex-1"
            >
              <option value="">Valor</option>
              <option value="0-200000">Até R$ 200.000</option>
              <option value="200000-500000">R$ 200.000 - R$ 500.000</option>
              <option value="500000-1000000">R$ 500.000 - R$ 1.000.000</option>
              <option value="1000000+">Acima de R$ 1.000.000</option>
            </select>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FFC000] hover:bg-[#e6a817] text-foreground font-bold text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              BUSCAR
            </button>
          </div>
        </div>

        {/* Favorites Link */}
        <div className="flex justify-center mt-3">
          <Link
            to="/favoritos"
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">Imóveis Favoritos</span>
            {count > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
