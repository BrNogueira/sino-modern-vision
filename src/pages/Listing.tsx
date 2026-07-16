import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import HomeBackNav from "@/components/HomeBackNav";
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

    const splitParam = (key: string): string[] =>
      searchParams.get(key)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

    const norm = (s?: string) =>
      (s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Comparação case-insensitive: qualquer valor selecionado bate com o campo do imóvel.
    const matchesAny = (selected: string[], value?: string) =>
      selected.some((sel) => norm(sel) === norm(value));

    // Estados podem estar gravados como nome completo ("Rio Grande do Sul") ou
    // sigla ("RS"). Normaliza ambos para a sigla (UF) para o filtro funcionar
    // independentemente de como veio da barra de busca.
    const UF_BY_NAME: Record<string, string> = {
      "rio grande do sul": "RS", "santa catarina": "SC", "parana": "PR",
    };
    const toUf = (s?: string) => {
      const n = norm(s);
      if (!n) return "";
      return n.length === 2 ? n.toUpperCase() : (UF_BY_NAME[n] ?? n.toUpperCase());
    };

    // Modalidade da barra de busca ("Venda"/"Aluguel") mapeada para transactionType
    // (que pode ser "venda", "aluguel" ou "venda/aluguel"). Aceita também o
    // parâmetro legado "transacao".
    const modalidades = [...splitParam("modalidade"), ...splitParam("transacao")];
    if (modalidades.length) {
      const wanted = modalidades.map(norm);
      result = result.filter((p) => wanted.some((w) => p.transactionType.includes(w)));
    }

    const codigo = searchParams.get("codigo");
    if (codigo) result = result.filter((p) => p.code.includes(codigo));

    const estados = splitParam("estado");
    if (estados.length) {
      const wantedUf = estados.map(toUf);
      result = result.filter((p) => wantedUf.includes(toUf(p.state)));
    }

    const cidades = splitParam("cidade");
    if (cidades.length) result = result.filter((p) => matchesAny(cidades, p.city));

    const bairros = splitParam("bairro");
    if (bairros.length) result = result.filter((p) => matchesAny(bairros, p.neighborhood));

    const tipos = splitParam("tipo");
    if (tipos.length) result = result.filter((p) => matchesAny(tipos, p.type));

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

    // Busca livre: normaliza acentos/caixa e exige que TODA palavra do termo
    // apareça em algum campo do imóvel (título, tipo, localização, código, UF).
    const q = searchParams.get("q");
    if (q) {
      const tokens = norm(q).split(/\s+/).filter(Boolean);
      if (tokens.length) {
        result = result.filter((p) => {
          const haystack = norm(
            [p.title, p.type, p.location, p.city, p.neighborhood, p.state, toUf(p.state), p.code]
              .filter(Boolean)
              .join(" ")
          );
          return tokens.every((t) => haystack.includes(t));
        });
      }
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

      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-card rounded-xl border border-border px-5 py-3 gap-4">
          <div>
            <span className="text-lg font-bold text-foreground">{filtered.length}</span>
            <span className="text-muted-foreground ml-2">imóveis encontrados</span>
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando imóveis..." : `Página ${safePage} de ${totalPages}`}
            </p>
          </div>

          <div className="order-last w-full flex items-center justify-center gap-6 md:order-none md:w-auto">
            <HomeBackNav />
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
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:mt-[50px]"
                : "flex flex-col gap-4 md:mt-[50px]"
            }
          >
            {paginated.map((property) => (
              <PropertyCard
                key={property.id ?? property.code}
                property={property}
                layout={viewMode === "grid" ? "grid" : "list"}
              />
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
