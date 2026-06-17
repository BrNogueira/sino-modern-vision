import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { LayoutGrid, List, ArrowUpDown, Home, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SearchBar from "@/components/SearchBar";
import { properties as staticProperties } from "@/data/properties";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { useCategorias } from "@/contexts/CategoriasContext";
import { zapToProperty } from "@/lib/zapToProperty";

const ITEMS_PER_PAGE = 12;

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

const Listing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { properties: dbProperties, loading } = useAdminProperties();
  const { categorias } = useCategorias();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const categoriaSlug = searchParams.get("categoria");
  const categoriaFiltro = categoriaSlug
    ? categorias.find((c) => c.slug === categoriaSlug)
    : null;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams, categoriaFiltro?.id, sortOrder]);

  const allProperties = useMemo(() => {
    let dbList = dbProperties.filter((p) => p.ativo);
    if (categoriaFiltro) {
      dbList = dbList.filter((p) => p.categoriaId === categoriaFiltro.id);
    }
    const fromDb = dbList.map(zapToProperty);
    if (fromDb.length > 0) return fromDb;
    return categoriaFiltro ? [] : staticProperties;
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

    result.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

    return result;
  }, [searchParams, sortOrder, allProperties]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );
  const visiblePages = pageWindow(safePage, totalPages);

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-card rounded-xl border border-border px-5 py-3 gap-4">
          <div>
            <span className="text-lg font-bold text-foreground">{filtered.length}</span>
            <span className="text-muted-foreground ml-2">imóveis encontrados</span>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando imóveis..." : `Página ${safePage} de ${totalPages}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              Preço {sortOrder === "asc" ? "↑" : "↓"}
            </button>
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

        {paginated.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 md:mt-[70px]"
                : "flex flex-col gap-4"
            }
          >
            {paginated.map((property) => (
              <PropertyCard key={property.id ?? property.code} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {loading ? "Carregando imóveis..." : "Nenhum imóvel encontrado"}
            </p>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros de busca</p>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-10 px-3 rounded-lg border border-border bg-card disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            {visiblePages.map((page, idx) => {
              const prev = visiblePages[idx - 1];
              const gap = prev != null && page - prev > 1;
              return (
                <span key={page} className="flex items-center gap-2">
                  {gap && <span className="text-muted-foreground px-1">…</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      safePage === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-10 px-3 rounded-lg border border-border bg-card disabled:opacity-40 flex items-center gap-1"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Listing;
