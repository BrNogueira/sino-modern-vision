import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import heroImage from "@/assets/hero-banner.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const { count } = useFavorites();
  const [searchText, setSearchText] = useState("");
  const [modalidade, setModalidade] = useState<string[]>([]);
  const [modalidadeOpen, setModalidadeOpen] = useState(false);
  const modalidadeRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    code: "",
    state: "",
    city: "",
    neighborhood: "",
    type: "",
    priceRange: "",
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalidadeRef.current && !modalidadeRef.current.contains(e.target as Node)) {
        setModalidadeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleModalidade = (val: string) => {
    setModalidade((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    if (modalidade.length) params.set("modalidade", modalidade.join(","));
    if (filters.code) params.set("codigo", filters.code);
    if (filters.state) params.set("estado", filters.state);
    if (filters.city) params.set("cidade", filters.city);
    if (filters.neighborhood) params.set("bairro", filters.neighborhood);
    if (filters.type) params.set("tipo", filters.type);
    if (filters.priceRange) params.set("valor", filters.priceRange);
    navigate(`/imoveis?${params.toString()}`);
  };

  const selectClass =
    "appearance-none bg-white text-[#6b6b6b] text-xs md:text-sm rounded-full px-3 md:px-4 py-2 h-9 outline-none cursor-pointer flex-1 min-w-0 pr-7 w-full";

  return (
    <section className="relative">
      {/* Hero banner */}
      <div className="relative h-[300px] md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Bottom fade into water color */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[200px]"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, #89A0B7 100%)",
          }}
        />
      </div>

      {/* Water-color continuation with search bar overlapping */}
      <div style={{ backgroundColor: "#89A0B7" }}>
        <div className="relative -mt-14 pb-6 flex items-start justify-center px-4">
          {/* Single search container */}
          <div
            className="w-full max-w-[1300px] rounded-2xl shadow-lg px-4 md:px-6 py-4 flex flex-col gap-3"
            style={{ backgroundColor: "#8B8B8B" }}
          >
            {/* Row 1: Aluguel/Venda + Search input with embedded Buscar */}
            <div className="flex items-center gap-2">
              {/* Aluguel / Venda select */}
              <div className="relative shrink-0" ref={modalidadeRef}>
                <button
                  type="button"
                  onClick={() => setModalidadeOpen(!modalidadeOpen)}
                  className="appearance-none bg-white text-[#6b6b6b] text-xs md:text-sm rounded-full px-3 md:px-4 py-2 h-11 outline-none cursor-pointer text-left pr-7 truncate min-w-[130px]"
                >
                  {modalidade.length === 0
                    ? "Aluguel / Venda"
                    : modalidade.join(", ")}
                </button>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
                {modalidadeOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-1 z-50 min-w-[160px]">
                    {["Venda", "Aluguel"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleModalidade(opt)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs md:text-sm text-[#2F2F2F] hover:bg-[#f5f5f5] transition-colors"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            modalidade.includes(opt)
                              ? "bg-[#F2C21A] border-[#F2C21A]"
                              : "border-[#ccc]"
                          }`}
                        >
                          {modalidade.includes(opt) && (
                            <Check className="w-3 h-3 text-[#2F2F2F]" />
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search input + Buscar */}
              <div className="flex items-center flex-1 bg-white rounded-full h-11 pl-4 pr-1">
                <Search className="w-4 h-4 text-[#2F2F2F] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Clique para iniciar sua busca"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent outline-none text-sm text-[#2F2F2F] placeholder:text-[#999] min-w-0"
                />
                <button
                  onClick={handleSearch}
                  className="shrink-0 rounded-full px-5 py-1.5 h-9 text-sm font-bold transition-colors hover:brightness-95 active:scale-[0.97]"
                  style={{ backgroundColor: "#F2C21A", color: "#2F2F2F" }}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Row 2: Filters + WhatsApp */}
            <div className="flex items-center gap-2 md:gap-2 flex-wrap md:flex-nowrap">
              {/* 1. Código */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
                <input
                  type="text"
                  placeholder="Código"
                  value={filters.code}
                  onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                  className="bg-white text-[#6b6b6b] text-xs md:text-sm rounded-full px-3 md:px-4 py-2 h-9 outline-none w-full"
                />
              </div>

              {/* 2. Estado */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
              </div>

              {/* 3. Cidade */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Cidade</option>
                  <option value="Novo Hamburgo">Novo Hamburgo</option>
                  <option value="São Leopoldo">São Leopoldo</option>
                  <option value="Campo Bom">Campo Bom</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
              </div>

              {/* 4. Bairro */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
              </div>

              {/* 5. Tipo de Imóvel */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
              </div>

              {/* 6. Valor */}
              <div className="relative flex-1 min-w-[calc(50%-4px)] md:min-w-0">
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
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999] pointer-events-none" />
              </div>



              {/* WhatsApp button inside container */}
              <a
                href="https://web.whatsapp.com/send?phone=555195951446"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1FA855" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Favoritos link below search bar */}
      <div
        className="z-10 flex justify-center mt-3 w-full"
        style={{ position: "absolute", justifySelf: "center", background: "transparent", left: "50%", transform: "translateX(-50%)", bottom: "4.5rem" }}
      >
        <Link
          to="/favoritos"
          className="flex items-center gap-1.5 text-foreground hover:opacity-70 transition-colors"
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{count} Meus Favoritos</span>
        </Link>
      </div>

      {/* Gradient transition from water color to page background */}
      <div
        className="h-24 md:h-32"
        style={{
          background: "linear-gradient(to bottom, #89A0B7 0%, hsl(0 0% 96%) 100%)",
        }}
      />
    </section>
  );
};

export default HeroSection;
