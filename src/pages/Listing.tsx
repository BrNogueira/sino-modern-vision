import { useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { LayoutGrid, List, ArrowUpDown, Home, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SearchBar from "@/components/SearchBar";
import { properties as staticProperties } from "@/data/properties";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { useCategorias } from "@/contexts/CategoriasContext";
import { zapToProperty } from "@/lib/zapToProperty";

const ITEMS_PER_PAGE = 9;

const Listing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { properties: dbProperties } = useAdminProperties();
  const { categorias } = useCategorias();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const categoriaSlug = searchParams.get("categoria");
  const categoriaFiltro = categoriaSlug
    ? categorias.find((c) => c.slug === categoriaSlug)
    : null;

  const allProperties = useMemo(() => {
    let dbList = dbProperties.filter((p) => p.ativo);
    if (categoriaFiltro) {
      dbList = dbList.filter((p) => p.categoriaId === categoriaFiltro.id);
    }
    const fromDb = dbList.map(zapToProperty);
    // When filtering by categoria, only show DB properties (mocks têm categoria)
    return categoriaFiltro ? fromDb : [...fromDb, ...staticProperties];
  }, [dbProperties, categoriaFiltro]);

  const filtered = useMemo(() => {
    let result = [...allProperties];

    const transacao = searchParams.get("transacao");
    if (transacao) result = result.filter((p) => p.transactionType === transacao);

    const codigo = searchParams.get("codigo");
    if (codigo) result = result.filter((p) => p.code.includes(codigo));

    const splitParam = (key: string): string[] =>
      searchParams.get(key)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

    const estados = splitParam("estado");
    if (estados.length) result = result.filter((p) => estados.includes(p.state));

    const cidades = splitParam("cidade");
    if (cidades.length) result = result.filter((p) => cidades.includes(p.city));

    const bairros = splitParam("bairro");
    if (bairros.length) result = result.filter((p) => bairros.includes(p.neighborhood));

    const tipos = splitParam("tipo");
    if (tipos.length) result = result.filter((p) => tipos.includes(p.type));

    const valores = splitParam("valor");
    if (valores.length) {
      result = result.filter((p) =>
        valores.some((valor) => {
          if (valor.endsWith("+")) return p.price >= parseInt(valor);
          const [min, max] = valor.split("-").map(Number);
          return p.price >= min && p.price <= max;
        })
      );
    }

    const q = searchParams.get("q");
    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

    return result;
  }, [searchParams, sortOrder, allProperties]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Navigation buttons */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 md:gap-6 py-2 md:py-3">
          <Link
            to="/"
            className="flex items-center gap-1 md:gap-2 text-primary font-bold text-lg md:text-2xl uppercase hover:opacity-80 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 md:gap-2 text-primary font-bold text-lg md:text-2xl uppercase hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Results Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-card rounded-xl border border-border px-5 py-3 gap-4">
          <div>
            <span className="text-lg font-bold text-foreground">{filtered.length}</span>
            <span className="text-muted-foreground ml-2">imóveis encontrados</span>
            <p className="text-xs text-muted-foreground">Resultados para sua busca</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              title={sortOrder === "asc" ? "Menor preço primeiro" : "Maior preço primeiro"}
            >
              <ArrowUpDown className="w-4 h-4" />
              Preço {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            {/* View Toggle */}
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property Grid/List */}
        {paginated.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 md:mt-[70px]"
                : "flex flex-col gap-4"
            }
          >
            {paginated.map((property) => (
              <PropertyCard key={property.code} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Nenhum imóvel encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros de busca</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Listing;
