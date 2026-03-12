import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { properties } from "@/data/properties";

const ITEMS_PER_PAGE = 9;

const Listing = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...properties];

    const transacao = searchParams.get("transacao");
    if (transacao) result = result.filter((p) => p.transactionType === transacao);

    const codigo = searchParams.get("codigo");
    if (codigo) result = result.filter((p) => p.code.includes(codigo));

    const estado = searchParams.get("estado");
    if (estado) result = result.filter((p) => p.state === estado);

    const cidade = searchParams.get("cidade");
    if (cidade) result = result.filter((p) => p.city === cidade);

    const bairro = searchParams.get("bairro");
    if (bairro) result = result.filter((p) => p.neighborhood === bairro);

    const tipo = searchParams.get("tipo");
    if (tipo) result = result.filter((p) => p.type === tipo);

    const valor = searchParams.get("valor");
    if (valor) {
      if (valor.endsWith("+")) {
        const min = parseInt(valor);
        result = result.filter((p) => p.price >= min);
      } else {
        const [min, max] = valor.split("-").map(Number);
        result = result.filter((p) => p.price >= min && p.price <= max);
      }
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
  }, [searchParams, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Results Bar */}
        <div className="flex items-center justify-between mb-6 bg-card rounded-xl border border-border px-5 py-3">
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
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
