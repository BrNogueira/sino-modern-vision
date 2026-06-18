import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Star, ImageIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const [searchText, setSearchText] = useState("");
  const [modalidade, setModalidade] = useState<string[]>([]);
  const [modalidadeOpen, setModalidadeOpen] = useState(false);
  const modalidadeRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    code: "",
    state: [] as string[],
    city: [] as string[],
    neighborhood: [] as string[],
    type: [] as string[],
    priceRange: [] as string[],
  });
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [heroBanner, setHeroBanner] = useState<string | null>(null);

  const STATE_OPTIONS = ["RS", "SC", "PR"];
  const CITY_OPTIONS = ["Novo Hamburgo", "São Leopoldo", "Campo Bom"];
  const NEIGHBORHOOD_OPTIONS = ["Centro", "Lomba Grande", "Colina do Sol", "Rondônia"];
  const TYPE_OPTIONS = ["Casa", "Terreno", "Apartamento", "Sítio", "Comercial", "Condomínio", "Lançamento", "Pavilhão", "Permuta"];
  const PRICE_OPTIONS = [
    { value: "0-200000", label: "Até R$ 200mil" },
    { value: "200000-500000", label: "R$ 200mil - 500mil" },
    { value: "500000-1000000", label: "R$ 500mil - 1M" },
    { value: "1000000+", label: "Acima de R$ 1M" },
  ];
  const MODALIDADE_OPTIONS = ["Venda", "Aluguel"];

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_banner")
        .single();
      if (data) setHeroBanner(data.value);
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalidadeRef.current && !modalidadeRef.current.contains(e.target as Node)) setModalidadeOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) setNeighborhoodOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) setPriceOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleModalidade = (val: string) => {
    setModalidade((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const toggleAllModalidades = () => {
    setModalidade((prev) => (prev.length === MODALIDADE_OPTIONS.length ? [] : MODALIDADE_OPTIONS));
  };

  type MultiKey = "state" | "city" | "neighborhood" | "type" | "priceRange";

  const toggleMulti = (key: MultiKey, val: string) => {
    setFilters((prev) => {
      const list = prev[key];
      const next = list.includes(val)
        ? list.filter((item) => item !== val)
        : [...list, val];
      return { ...prev, [key]: next };
    });
  };

  const toggleAllMulti = (key: MultiKey, options: string[]) => {
    setFilters((prev) => {
      const list = prev[key];
      const next = list.length === options.length ? [] : options;
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
    if (filters.type.length) params.set("tipo", filters.type.join(","));
    if (filters.priceRange.length) params.set("valor", filters.priceRange.join(","));
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <section className="relative">
      {/* Hero banner */}
      <div className="relative h-[300px] md:h-[680px] overflow-hidden">
        <div 
          className="hero-banner" 
          style={heroBanner ? { backgroundImage: `url(${heroBanner})` } : {}}
        />
        {/* Bottom fade into water color */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] hero-banner__fade" />
      </div>

      {/* Water-color continuation with search bar overlapping */}
      <div className="hero-section__water">
        <div className="relative flex items-start justify-center px-4">
          {/* Single search container */}
            <div className="search-bar px-[15px] py-[15px] relative md:top-[-120px] top-[-30px]">
            {/* Row 1: Search input with Aluguel/Venda inline before Buscar */}
            <div className="search-bar__row search-bar__row--top flex flex-col md:flex-row gap-2" style={{ marginBottom: "5px" }}>
              <div className="search-bar__input-group">
                <Search className="search-bar__icon" />
                <input
                  type="text"
                  placeholder="Clique para iniciar sua busca"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="search-bar__input text-m"
                />
              </div>

              {/* Aluguel / Venda como bloco separado */}
              <div className="relative search-bar__select-container" ref={modalidadeRef}>
                <button
                  type="button"
                  onClick={() => setModalidadeOpen(!modalidadeOpen)}
                  className="search-bar__button text-m"
                >
                  {modalidade.length === 0
                    ? "Aluguel / Venda"
                    : modalidade.join(", ")}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {modalidadeOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={toggleAllModalidades}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${modalidade.length === MODALIDADE_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {modalidade.length === MODALIDADE_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {MODALIDADE_OPTIONS.map((opt) => (
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

              <button
                onClick={handleSearch}
                className="search-bar__submit text-m"
              >
                Buscar
              </button>
            </div>

            {/* Row 2: Filters + WhatsApp */}
            <div className="search-bar__row search-bar__row--filters grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:flex-nowrap gap-2">
              {/* 1. Código */}
              <div className="relative search-bar__field">
                <input
                  type="text"
                  placeholder="Código"
                  value={filters.code}
                  onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                  className="search-bar__field-input text-m"
                />
              </div>

              {/* 2. Estado */}
              <div className="relative search-bar__field" ref={stateRef}>
                <button
                  type="button"
                  onClick={() => setStateOpen(!stateOpen)}
                  className="search-bar__select-button text-m"
                >
                  {formatSelection("Estado/RS", filters.state)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {stateOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={() => toggleAllMulti("state", STATE_OPTIONS)}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${filters.state.length === STATE_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {filters.state.length === STATE_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {STATE_OPTIONS.map((opt) => (
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
                  className="search-bar__select-button text-m"
                >
                  {formatSelection("Cidade", filters.city)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {cityOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={() => toggleAllMulti("city", CITY_OPTIONS)}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${filters.city.length === CITY_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {filters.city.length === CITY_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {CITY_OPTIONS.map((opt) => (
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
                  className="search-bar__select-button text-m"
                >
                  {formatSelection("Bairro", filters.neighborhood)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {neighborhoodOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={() => toggleAllMulti("neighborhood", NEIGHBORHOOD_OPTIONS)}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${filters.neighborhood.length === NEIGHBORHOOD_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {filters.neighborhood.length === NEIGHBORHOOD_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {NEIGHBORHOOD_OPTIONS.map((opt) => (
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
              <div className="relative search-bar__field" ref={typeRef}>
                <button
                  type="button"
                  onClick={() => setTypeOpen(!typeOpen)}
                  className="search-bar__select-button text-m"
                >
                  {formatSelection("Tipo de Imóvel", filters.type)}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {typeOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={() => toggleAllMulti("type", TYPE_OPTIONS)}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${filters.type.length === TYPE_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {filters.type.length === TYPE_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {TYPE_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => toggleMulti("type", opt)} className="search-bar__dropdown-item text-m">
                        <span className={`search-bar__check ${filters.type.includes(opt) ? "search-bar__check--active" : ""}`}>
                          {filters.type.includes(opt) && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Valor */}
              <div className="relative search-bar__field" ref={priceRef}>
                <button
                  type="button"
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="search-bar__select-button text-m"
                >
                  {filters.priceRange.length === 0
                    ? "Valor"
                    : filters.priceRange.length === 1
                    ? PRICE_OPTIONS.find((p) => p.value === filters.priceRange[0])?.label || filters.priceRange[0]
                    : `${filters.priceRange.length} selecionados`}
                </button>
                <ChevronDown className="search-bar__chevron" />
                {priceOpen && (
                  <div className="search-bar__dropdown search-bar__dropdown--left">
                    <button
                      type="button"
                      onClick={() => toggleAllMulti("priceRange", PRICE_OPTIONS.map((p) => p.value))}
                      className="search-bar__dropdown-item text-m font-bold border-b border-border mb-1 pb-2"
                    >
                      <span className={`search-bar__check ${filters.priceRange.length === PRICE_OPTIONS.length ? "search-bar__check--active" : ""}`}>
                        {filters.priceRange.length === PRICE_OPTIONS.length && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                      </span>
                      Selecionar todos
                    </button>
                    {PRICE_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => toggleMulti("priceRange", opt.value)} className="search-bar__dropdown-item text-m">
                        <span className={`search-bar__check ${filters.priceRange.includes(opt.value) ? "search-bar__check--active" : ""}`}>
                          {filters.priceRange.includes(opt.value) && <Check className="w-3 h-3 text-[#2F2F2F]" />}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
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

        {/* Favoritos — mobile only, in normal flow (no fragile pixel offsets) */}
        <div className="md:hidden flex justify-center px-4 pb-10 -mt-2">
          <Link
            to="/favoritos"
            className="flex items-center gap-2 text-foreground hover:opacity-70 transition-colors"
          >
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-xl">Favoritos</span>
          </Link>
        </div>
      </div>

      {/* Favoritos link below search bar — desktop only (absolute positioned) */}
      <div className="hero-favorites z-[8] hidden md:flex justify-center w-full absolute md:top-[770px] top-[1150px] mb-8" style={{ height: "35px" }}>
        <Link
          to="/favoritos"
          className="flex items-center gap-2 text-foreground hover:opacity-70 transition-colors"
        >
          <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
          <span className="font-bold" style={{ fontSize: "1.5rem" }}>Favoritos</span>
        </Link>
      </div>

      {/* Gradient transition from water color to page background */}
      <div className="hero-section__transition h-24 md:h-32" />
    </section>
  );
};

export default HeroSection;
