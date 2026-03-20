import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-house.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    code: "",
    state: "",
    city: "",
    neighborhood: "",
    type: "",
    priceRange: "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    if (filters.code) params.set("codigo", filters.code);
    if (filters.state) params.set("estado", filters.state);
    if (filters.city) params.set("cidade", filters.city);
    if (filters.neighborhood) params.set("bairro", filters.neighborhood);
    if (filters.type) params.set("tipo", filters.type);
    if (filters.priceRange) params.set("valor", filters.priceRange);
    navigate(`/imoveis?${params.toString()}`);
  };

  const selectClass =
    "appearance-none bg-white text-[#6b6b6b] text-xs md:text-sm rounded-full px-3 md:px-4 py-2 h-9 outline-none cursor-pointer flex-1 min-w-0 pr-7";

  return (
    <section className="relative">
      {/* Hero background */}
      <div className="relative h-[230px] md:h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Bottom fade to light */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[100px]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, hsl(210 15% 94% / 0.5) 50%, hsl(210 15% 94%) 100%)",
          }}
        />
      </div>

      {/* Search block + WhatsApp row */}
      <div className="relative -mt-12 z-10 flex items-start justify-center gap-3 px-4">
        {/* Search block */}
        <div
          className="w-full max-w-[700px] rounded-2xl shadow-md p-3 md:p-4 flex flex-col gap-2.5"
          style={{ backgroundColor: "#8B8B8B" }}
        >
          {/* Row 1: search input + buscar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 bg-white rounded-full px-3 py-2 h-10">
              <Search className="w-4 h-4 text-[#2F2F2F] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Clique para iniciar sua busca"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent outline-none text-sm text-[#2F2F2F] placeholder:text-[#999]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="shrink-0 rounded-full px-5 py-2 h-10 text-sm font-bold transition-colors"
              style={{ backgroundColor: "#F2C21A", color: "#2F2F2F" }}
            >
              Buscar
            </button>
          </div>

          {/* Row 2: filters */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap md:flex-nowrap">
            <div className="relative flex-1 min-w-[70px]">
              <input
                type="text"
                placeholder="Código"
                value={filters.code}
                onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                className="bg-white text-[#6b6b6b] text-xs md:text-sm rounded-full px-3 md:px-4 py-2 h-9 outline-none w-full"
              />
            </div>

            <div className="relative flex-1 min-w-[90px]">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className={selectClass}
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
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[70px]">
              <select
                value={filters.state}
                onChange={(e) =>
                  setFilters({ ...filters, state: e.target.value, city: "", neighborhood: "" })
                }
                className={selectClass}
              >
                <option value="">Estado</option>
                <option value="RS">RS</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[70px]">
              <select
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value, neighborhood: "" })
                }
                className={selectClass}
              >
                <option value="">Cidade</option>
                <option value="Novo Hamburgo">Novo Hamburgo</option>
                <option value="São Leopoldo">São Leopoldo</option>
                <option value="Campo Bom">Campo Bom</option>
                <option value="Estância Velha">Estância Velha</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[70px]">
              <select
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                className={selectClass}
              >
                <option value="">Bairro</option>
                <option value="Centro">Centro</option>
                <option value="Lomba Grande">Lomba Grande</option>
                <option value="Colina do Sol">Colina do Sol</option>
                <option value="Rondônia">Rondônia</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[70px]">
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className={selectClass}
              >
                <option value="">Valor</option>
                <option value="0-200000">Até R$ 200mil</option>
                <option value="200000-500000">R$ 200mil - 500mil</option>
                <option value="500000-1000000">R$ 500mil - 1M</option>
                <option value="1000000+">Acima de R$ 1M</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* WhatsApp button */}
        <a
          href="https://web.whatsapp.com/send?phone=555195951446"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 hidden md:flex items-center justify-center w-12 h-16 rounded-xl shadow-md mt-1 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1FA855" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
