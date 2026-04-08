import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { count } = useFavorites();
  const [searchText, setSearchText] = useState("");
  const [modalidade, setModalidade] = useState<string[]>([]);
  const [modalidadeOpen, setModalidadeOpen] = useState(false);
  const modalidadeRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    code: "",
    state: [] as string[],
    city: [] as string[],
    neighborhood: [] as string[],
    type: "",
    priceRange: "",
  });
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalidadeRef.current && !modalidadeRef.current.contains(e.target as Node)) {
        setModalidadeOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) {
        setNeighborhoodOpen(false);
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

  const toggleMulti = (key: "state" | "city" | "neighborhood", val: string) => {
    setFilters((prev) => {
      const list = prev[key];
      const next = list.includes(val)
        ? list.filter((item) => item !== val)
        : [...list, val];
      return { ...prev, [key]: next };
    });
  };

  const formatSelection = (label: string, values: string[]) => {
    if (values.length === 0) return label;
    if (values.length === 1) return values[0];
    return `${values.length} selecionados`;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    if (modalidade.length) params.set("modalidade", modalidade.join(","));
    if (filters.code) params.set("codigo", filters.code);
    if (filters.state.length) params.set("estado", filters.state.join(","));
    if (filters.city.length) params.set("cidade", filters.city.join(","));
    if (filters.neighborhood.length) params.set("bairro", filters.neighborhood.join(","));
    if (filters.type) params.set("tipo", filters.type);
    if (filters.priceRange) params.set("valor", filters.priceRange);
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <section className="relative">
      {/* Hero banner */}
      <div className="relative h-[300px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 hero-banner" style={{}} />
        {/* Bottom fade into water color */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] hero-banner__fade" />
      </div>

      {/* Water-color continuation with search bar overlapping */}
      <div className="hero-section__water">
        <div className="relative -mt-14 pb-6 flex items-start justify-center px-4">
          {/* Single search container */}
            <div className="search-bar">
            {/* Row 1: Search input + Aluguel/Venda on the right */}
            <div className="search-bar__row search-bar__row--top">
              {/* Search input + Buscar */}
              <div className="search-bar__input-group">
                <Search className="search-bar__icon" />
                <input
                  type="text"
                  placeholder="Clique para iniciar sua busca"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="search-bar__input text-m text-xl"
                />
                <button
                  onClick={handleSearch}
                  className="search-bar__submit text-m"
                >
                  Buscar
                </button>
              </div>

              {/* Aluguel / Venda select - right side */}
              <div className="relative search-bar__select-container" ref={modalidadeRef}>
                <button
                  type="button"
                  onClick={() => setModalidadeOpen(!modalidadeOpen)}
                  className="search-bar__button text-m text-xl"
                >
                  {modalidade.length === 0
                    ? "Aluguel / Venda"
                    : modalidade.join(", ")}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {modalidadeOpen && (
                  <div className="search-bar__dropdown">
                    {["Venda", "Aluguel"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleModalidade(opt)}
                        className="search-bar__dropdown-item text-m"
                      >
                        <span
                          className={`search-bar__check ${
                            modalidade.includes(opt)
                              ? "search-bar__check--active"
                              : ""
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
            </div>

            {/* Row 2: Filters + WhatsApp */}
            <div className="search-bar__row search-bar__row--filters">
              {/* 1. Código */}
              <div className="relative search-bar__field">
                <input
                  type="text"
                  placeholder="Código"
                  value={filters.code}
                  onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                  className="search-bar__field-input text-m text-xl"
                />
              </div>

              {/* 2. Estado */}
              <div className="relative search-bar__field" ref={stateRef}>
                <button
                  type="button"
                  onClick={() => setStateOpen(!stateOpen)}
                  className="search-bar__select-button text-m text-xl"
                >
                  {formatSelection("Estado", filters.state)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {stateOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    {["RS", "SC", "PR"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMulti("state", opt)}
                        className="search-bar__dropdown-item text-m"
                      >
                        <span
                          className={`search-bar__check ${
                            filters.state.includes(opt)
                              ? "search-bar__check--active"
                              : ""
                          }`}
                        >
                          {filters.state.includes(opt) && (
                            <Check className="w-3 h-3 text-[#2F2F2F]" />
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Cidade */}
              <div className="relative search-bar__field" ref={cityRef}>
                <button
                  type="button"
                  onClick={() => setCityOpen(!cityOpen)}
                  className="search-bar__select-button text-m text-xl"
                >
                  {formatSelection("Cidade", filters.city)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {cityOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    {["Novo Hamburgo", "São Leopoldo", "Campo Bom"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMulti("city", opt)}
                        className="search-bar__dropdown-item text-m"
                      >
                        <span
                          className={`search-bar__check ${
                            filters.city.includes(opt)
                              ? "search-bar__check--active"
                              : ""
                          }`}
                        >
                          {filters.city.includes(opt) && (
                            <Check className="w-3 h-3 text-[#2F2F2F]" />
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Bairro */}
              <div className="relative search-bar__field" ref={neighborhoodRef}>
                <button
                  type="button"
                  onClick={() => setNeighborhoodOpen(!neighborhoodOpen)}
                  className="search-bar__select-button text-m text-xl"
                >
                  {formatSelection("Bairro", filters.neighborhood)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {neighborhoodOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    {[
                      "Centro",
                      "Lomba Grande",
                      "Colina do Sol",
                      "Rondônia",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMulti("neighborhood", opt)}
                        className="search-bar__dropdown-item text-m"
                      >
                        <span
                          className={`search-bar__check ${
                            filters.neighborhood.includes(opt)
                              ? "search-bar__check--active"
                              : ""
                          }`}
                        >
                          {filters.neighborhood.includes(opt) && (
                            <Check className="w-3 h-3 text-[#2F2F2F]" />
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Tipo de Imóvel */}
              <div className="relative search-bar__field">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="search-bar__select text-m text-xl"
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
                <ChevronDown className="search-bar__chevron" />
              </div>

              {/* 6. Valor */}
              <div className="relative search-bar__field">
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="search-bar__select text-m"
                >
                  <option value="">Valor</option>
                  <option value="0-200000">Até R$ 200mil</option>
                  <option value="200000-500000">R$ 200mil - 500mil</option>
                  <option value="500000-1000000">R$ 500mil - 1M</option>
                  <option value="1000000+">Acima de R$ 1M</option>
                </select>
                <ChevronDown className="search-bar__chevron" />
              </div>



              {/* WhatsApp button inside container */}
              <a
                href="https://web.whatsapp.com/send?phone=555195951446"
                target="_blank"
                rel="noopener noreferrer"
                className="search-bar__whatsapp"
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
      <div className="hero-favorites z-10 flex justify-center mt-3 w-full">
        <Link
          to="/favoritos"
          className="flex items-center gap-1.5 text-foreground hover:opacity-70 transition-colors"
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{count} Meus Favoritos</span>
        </Link>
      </div>

      {/* Gradient transition from water color to page background */}
      <div className="hero-section__transition h-24 md:h-32" />
    </section>
  );
};

export default HeroSection;
