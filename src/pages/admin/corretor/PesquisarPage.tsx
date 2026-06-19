import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { fetchAdminImoveisPage } from "@/lib/adminImoveisApi";
import type { ZapImovel } from "@/types/zapImoveis";

const priceLabel = (p: ZapImovel) =>
  p.precoVenda
    ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
    : p.precoAluguel
    ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
    : "—";

const PesquisarPage = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<ZapImovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchAdminImoveisPage(1, debounced)
      .then(({ items, total }) => {
        if (!active) return;
        setResults(items);
        setTotal(total);
      })
      .catch(() => {
        if (!active) return;
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debounced]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pesquisar</h1>
        <p className="text-sm text-muted-foreground">
          Busque imóveis por código, título, cidade ou bairro
        </p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Digite código, título, cidade..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          maxLength={100}
          autoFocus
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs text-muted-foreground">
            {!debounced
              ? "Digite para pesquisar"
              : loading
              ? "Buscando…"
              : total === 0
              ? "Nenhum resultado encontrado."
              : `${total} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}${
                  total > results.length ? ` (exibindo ${results.length})` : ""
                }`}
          </span>
        </div>

        {results.length > 0 && (
          <div className="divide-y divide-border">
            {results.map((p) => (
              <Link
                key={p.id}
                to={`/admin/imoveis/editar/${p.id}`}
                className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm truncate">{p.tituloImovel}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="font-mono">{p.codigoImovel}</span>
                    {p.cidade ? ` • ${p.cidade}` : ""}
                    {p.bairro ? `/${p.bairro}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  {priceLabel(p)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PesquisarPage;
