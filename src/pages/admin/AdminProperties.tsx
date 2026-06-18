import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
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
  fetchAdminImoveisCount,
  fetchAdminImoveisPage,
  pageWindow,
} from "@/lib/adminImoveisApi";
import type { ZapImovel } from "@/types/zapImoveis";

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminProperties = () => {
  const { deleteProperty, updateProperty } = useAdminProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const searchFromUrl = searchParams.get("q") || "";

  const [properties, setProperties] = useState<ZapImovel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [portfolioTotal, setPortfolioTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_IMOVEIS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePages = pageWindow(safePage, totalPages);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const syncUrl = useCallback(
    (page: number, q: string) => {
      const next = new URLSearchParams();
      if (page > 1) next.set("page", String(page));
      if (q) next.set("q", q);
      setSearchParams(next, { replace: true });
    },
    [setSearchParams],
  );

  const loadPage = useCallback(
    async (page: number, q: string) => {
      setLoading(true);
      try {
        const [{ items, total }, countAll] = await Promise.all([
          fetchAdminImoveisPage(page, q),
          q ? Promise.resolve(0) : fetchAdminImoveisCount(),
        ]);
        setProperties(items);
        setTotalItems(total);
        if (!q) setPortfolioTotal(countAll);
        const maxPage = Math.max(1, Math.ceil(total / ADMIN_IMOVEIS_PAGE_SIZE));
        const resolved = Math.min(Math.max(1, page), maxPage);
        if (resolved !== page) {
          setCurrentPage(resolved);
          syncUrl(resolved, q);
        }
      } catch (err) {
        console.error("Failed to load admin imoveis:", err);
        setProperties([]);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar a listagem de imóveis.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [syncUrl, toast],
  );

  useEffect(() => {
    setCurrentPage(pageFromUrl);
    setSearch(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [pageFromUrl, searchFromUrl]);

  useEffect(() => {
    const q = debouncedSearch;
    const page = q !== searchFromUrl ? 1 : pageFromUrl;
    if (q !== searchFromUrl) {
      setCurrentPage(1);
      syncUrl(1, q);
    }
    void loadPage(page, q);
  }, [debouncedSearch, pageFromUrl, searchFromUrl, loadPage, syncUrl]);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
    syncUrl(next, debouncedSearch);
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteProperty(id);
      toast({ title: "Imóvel excluído", description: `"${title}" foi removido.` });
      const nextPage =
        properties.length === 1 && safePage > 1 ? safePage - 1 : safePage;
      goToPage(nextPage);
      await loadPage(nextPage, debouncedSearch);
      if (!debouncedSearch) setPortfolioTotal((n) => Math.max(0, n - 1));
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
      await loadPage(safePage, debouncedSearch);
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
  const headerTotal = debouncedSearch ? totalItems : portfolioTotal || totalItems;

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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, código, cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          maxLength={100}
        />
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
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Código</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Título</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Cidade</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Preço</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
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
