import { useEffect, useState } from "react";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";
import { SortIcon } from "@/components/admin/SortableHead";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ImportImoveisDialog } from "@/components/admin/ImportImoveisDialog";
import {
  ADMIN_IMOVEIS_PAGE_SIZE,
  ADMIN_IMOVEIS_TIPOS,
  fetchAdminImoveisCount,
  fetchAdminImoveisPage,
  pageWindow,
  type ImovelFilters,
  type ImovelSort,
  type ImovelSortCol,
} from "@/lib/adminImoveisApi";
import type { ZapImovel } from "@/types/zapImoveis";

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DEFAULT_SORT = "created_at.desc";
const numOrUndef = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "created_at.desc", label: "Mais recentes" },
  { value: "created_at.asc", label: "Mais antigos" },
  { value: "preco_venda.desc", label: "Maior preço" },
  { value: "preco_venda.asc", label: "Menor preço" },
  { value: "titulo_imovel.asc", label: "Título (A–Z)" },
  { value: "cidade.asc", label: "Cidade (A–Z)" },
];

const AdminProperties = () => {
  const { deleteProperty, updateProperty } = useAdminProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [properties, setProperties] = useState<ZapImovel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [portfolioTotal, setPortfolioTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  // Inputs controlados (espelham a URL; gravam na URL com debounce)
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [cidade, setCidade] = useState(searchParams.get("cidade") || "");
  const [pmin, setPmin] = useState(searchParams.get("pmin") || "");
  const [pmax, setPmax] = useState(searchParams.get("pmax") || "");

  // ── leitura dos critérios a partir da URL (fonte da verdade) ──
  const sortRaw = searchParams.get("sort") || DEFAULT_SORT;
  const [sortColRaw, sortDirRaw] = sortRaw.split(".");
  const sort: ImovelSort = {
    col: (sortColRaw || "created_at") as ImovelSortCol,
    dir: sortDirRaw === "asc" ? "asc" : "desc",
  };
  const statusUrl = searchParams.get("status") || "";
  const tipoUrl = searchParams.get("tipo") || "";
  const filters: ImovelFilters = {
    status: statusUrl === "ativo" || statusUrl === "inativo" ? statusUrl : undefined,
    tipo: tipoUrl || undefined,
    cidade: searchParams.get("cidade") || undefined,
    precoMin: numOrUndef(searchParams.get("pmin")),
    precoMax: numOrUndef(searchParams.get("pmax")),
  };
  const queryQ = searchParams.get("q") || "";
  const hasActiveFilters = !!(
    queryQ || statusUrl || tipoUrl || filters.cidade || filters.precoMin != null || filters.precoMax != null
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_IMOVEIS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePages = pageWindow(safePage, totalPages);

  // Atualiza a URL (mesclando), zerando a página por padrão.
  const commit = (updates: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (resetPage) next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Mantém os inputs sincronizados quando a URL muda (voltar/limpar).
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCidade(searchParams.get("cidade") || "");
    setPmin(searchParams.get("pmin") || "");
    setPmax(searchParams.get("pmax") || "");
  }, [searchParams]);

  // Debounce dos campos digitados → grava na URL só quando muda de fato.
  useEffect(() => {
    const t = setTimeout(() => {
      const updates: Record<string, string | undefined> = {};
      let changed = false;
      if (search.trim() !== (searchParams.get("q") || "")) {
        updates.q = search.trim() || undefined; changed = true;
      }
      if (cidade.trim() !== (searchParams.get("cidade") || "")) {
        updates.cidade = cidade.trim() || undefined; changed = true;
      }
      if (pmin.trim() !== (searchParams.get("pmin") || "")) {
        updates.pmin = pmin.trim() || undefined; changed = true;
      }
      if (pmax.trim() !== (searchParams.get("pmax") || "")) {
        updates.pmax = pmax.trim() || undefined; changed = true;
      }
      if (changed) commit(updates);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, cidade, pmin, pmax]);

  // Carrega a página sempre que a URL (critérios/paginação) muda.
  useEffect(() => {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const q = searchParams.get("q") || "";
    const st = searchParams.get("status") || "";
    const tp = searchParams.get("tipo") || "";
    const cd = searchParams.get("cidade") || undefined;
    const min = numOrUndef(searchParams.get("pmin"));
    const max = numOrUndef(searchParams.get("pmax"));
    const raw = searchParams.get("sort") || DEFAULT_SORT;
    const [sc, sd] = raw.split(".");
    const sortLoad: ImovelSort = {
      col: (sc || "created_at") as ImovelSortCol,
      dir: sd === "asc" ? "asc" : "desc",
    };
    const filtersLoad: ImovelFilters = {
      status: st === "ativo" || st === "inativo" ? st : undefined,
      tipo: tp || undefined,
      cidade: cd,
      precoMin: min,
      precoMax: max,
    };
    const active = !!(q || st || tp || cd || min != null || max != null);

    let cancelled = false;
    setLoading(true);
    setCurrentPage(page);
    (async () => {
      try {
        const [{ items, total }, countAll] = await Promise.all([
          fetchAdminImoveisPage(page, q, { sort: sortLoad, filters: filtersLoad }),
          active ? Promise.resolve(0) : fetchAdminImoveisCount(),
        ]);
        if (cancelled) return;
        setProperties(items);
        setTotalItems(total);
        if (!active) setPortfolioTotal(countAll);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load admin imoveis:", err);
        setProperties([]);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar a listagem de imóveis.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, refreshTick]);

  const reload = () => setRefreshTick((t) => t + 1);

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    const clamped = Math.min(Math.max(1, page), totalPages);
    if (clamped > 1) next.set("page", String(clamped));
    else next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const handleSort = (col: ImovelSortCol) => {
    const dir = sort.col === col ? (sort.dir === "asc" ? "desc" : "asc") : "asc";
    const value = `${col}.${dir}`;
    commit({ sort: value === DEFAULT_SORT ? undefined : value });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (searchParams.get("sort")) next.set("sort", searchParams.get("sort")!);
    setSearchParams(next, { replace: true });
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteProperty(id);
      toast({ title: "Imóvel excluído", description: `"${title}" foi removido.` });
      if (properties.length === 1 && safePage > 1) goToPage(safePage - 1);
      else reload();
      if (!hasActiveFilters) setPortfolioTotal((n) => Math.max(0, n - 1));
    } catch (err: unknown) {
      toast({
        title: "Erro ao excluir imóvel",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      await updateProperty(id, { ativo: !currentStatus });
      toast({ title: currentStatus ? "Imóvel desativado" : "Imóvel ativado" });
      reload();
    } catch (err: unknown) {
      toast({
        title: "Erro ao alterar status",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * ADMIN_IMOVEIS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * ADMIN_IMOVEIS_PAGE_SIZE, totalItems);
  const headerTotal = hasActiveFilters ? totalItems : portfolioTotal || totalItems;

  const priceLabel = (p: ZapImovel) =>
    p.precoVenda
      ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
      : p.precoAluguel
      ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
      : "—";

  // Shared between desktop table and mobile cards (avoids duplicated logic)
  const StatusButton = ({ p }: { p: ZapImovel }) => (
    <button
      onClick={() => toggleAtivo(p.id, p.ativo)}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
        p.ativo
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {p.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {p.ativo ? "Ativo" : "Inativo"}
    </button>
  );

  const ActionButtons = ({ p }: { p: ZapImovel }) => (
    <>
      <Button variant="ghost" size="icon" asChild title="Visualizar imóvel">
        <Link to={`/imovel/${generateSlug(p.tituloImovel)}`}>
          <Eye className="w-4 h-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Editar na página">
        <Link to={`/imovel/${generateSlug(p.tituloImovel)}`}>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Editar no formulário">
        <Link to={`/admin/imoveis/editar/${p.id}`}>
          <Pencil className="w-4 h-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              O imóvel "{p.tituloImovel}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(p.id, p.tituloImovel)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  // Cabeçalho clicável da tabela (raw <th>) com indicador de ordenação.
  const Th = ({
    label, col, className,
  }: { label: string; col: ImovelSortCol; className?: string }) => (
    <th className={className}>
      <button
        type="button"
        onClick={() => handleSort(col)}
        className={`inline-flex items-center gap-1 select-none transition-colors hover:text-foreground ${
          sort.col === col ? "text-foreground font-semibold" : ""
        }`}
      >
        {label}
        <SortIcon active={sort.col === col} dir={sort.dir} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imóveis"
        description={`${headerTotal} ${headerTotal === 1 ? "imóvel cadastrado" : "imóveis cadastrados"} no portfólio`}
        icon={Building2}
        actions={
          <div className="flex items-center gap-2">
            <ImportImoveisDialog />
            <Button asChild size="lg" className="gap-2">
              <Link to="/admin/imoveis/novo">
                <Plus className="w-4 h-4" />
                Novo Imóvel
              </Link>
            </Button>
          </div>
        }
      />

      {/* Busca + filtros */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, código, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
          </div>
          {/* Ordenação no mobile (no desktop usa-se os cabeçalhos) */}
          <Select
            value={sortRaw}
            onValueChange={(v) => commit({ sort: v === DEFAULT_SORT ? undefined : v })}
          >
            <SelectTrigger className="md:hidden w-full sm:w-48">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={statusUrl || "all"}
            onValueChange={(v) => commit({ status: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={tipoUrl || "all"}
            onValueChange={(v) => commit({ tipo: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ADMIN_IMOVEIS_TIPOS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-[150px]"
            maxLength={80}
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Preço mín."
            value={pmin}
            onChange={(e) => setPmin(e.target.value)}
            className="w-[130px]"
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Preço máx."
            value={pmax}
            onChange={(e) => setPmax(e.target.value)}
            className="w-[130px]"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {loading
              ? "Carregando…"
              : totalItems === 0
                ? "Nenhum imóvel encontrado"
                : `Exibindo ${rangeStart}–${rangeEnd} de ${totalItems} imóveis`}
          </span>
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <Th label="Código" col="codigo_imovel" className="text-left px-4 py-3 text-muted-foreground font-medium" />
                <Th label="Título" col="titulo_imovel" className="text-left px-4 py-3 text-muted-foreground font-medium" />
                <Th label="Tipo" col="tipo_imovel" className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell" />
                <Th label="Cidade" col="cidade" className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell" />
                <Th label="Preço" col="preco_venda" className="text-left px-4 py-3 text-muted-foreground font-medium" />
                <Th label="Status" col="ativo" className="text-center px-4 py-3 text-muted-foreground font-medium" />
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Carregando imóveis…
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.codigoImovel}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{p.tituloImovel}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.tipoImovel}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.cidade}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{priceLabel(p)}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusButton p={p} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ActionButtons p={p} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Carregando imóveis…</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Nenhum imóvel encontrado.</div>
          ) : (
            properties.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{p.codigoImovel}</p>
                    <p className="font-medium text-foreground truncate">{p.tituloImovel}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {[p.tipoImovel, p.cidade].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusButton p={p} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="font-semibold text-primary">{priceLabel(p)}</span>
                  <div className="flex items-center gap-1">
                    <ActionButtons p={p} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="px-4 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => goToPage(safePage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-1 flex-wrap justify-center">
              {visiblePages.map((page, idx) => {
                const prev = visiblePages[idx - 1];
                const showEllipsis = prev !== undefined && page - prev > 1;
                return (
                  <span key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-muted-foreground text-sm">…</span>}
                    <Button
                      variant={page === safePage ? "default" : "outline"}
                      size="sm"
                      className="min-w-9"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  </span>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => goToPage(safePage + 1)}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;
