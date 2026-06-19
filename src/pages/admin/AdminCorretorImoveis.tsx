import { useCallback, useEffect, useState } from "react";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import {
  Building2,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Power,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/integrations/api/client";
import { fromRow } from "@/lib/imovelMapper";
import { resolvePhotoUrl } from "@/lib/resolvePhotoUrl";
import type { ZapImovel } from "@/types/zapImoveis";

const ITEMS_PER_PAGE = 20;

const LIST_SELECT =
  "id,codigo_imovel,titulo_imovel,cidade,estado,bairro,preco_venda,preco_aluguel,ativo,fotos,created_at";

type PagedResponse = { data: Record<string, unknown>[]; total: number };

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function coverUrl(fotos: ZapImovel["fotos"]): string | null {
  if (!Array.isArray(fotos) || fotos.length === 0) return null;
  const first = fotos[0];
  const raw = typeof first === "string" ? first : (first as { url?: string })?.url;
  return raw ? resolvePhotoUrl(raw) : null;
}

type Counts = { total: number; ativos: number; inativos: number };

async function fetchCount(ativo?: boolean): Promise<number> {
  const qs = new URLSearchParams({
    count: "exact",
    limit: "0",
    select: "id",
  });
  if (ativo === true) qs.set("ativo", "eq.1");
  if (ativo === false) qs.set("ativo", "eq.0");
  const res = await api.get<PagedResponse>(`/api/data/imoveis?${qs}`);
  return res.total ?? 0;
}

async function fetchCounts(): Promise<Counts> {
  const [total, ativos, inativos] = await Promise.all([
    fetchCount(),
    fetchCount(true),
    fetchCount(false),
  ]);
  return { total, ativos, inativos };
}

async function fetchPage(page: number, search?: string): Promise<{ items: ZapImovel[]; total: number }> {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const qs = new URLSearchParams({
    select: LIST_SELECT,
    order: "created_at.desc",
    limit: String(ITEMS_PER_PAGE),
    offset: String(offset),
    count: "exact",
  });
  const term = search?.trim();
  if (term) qs.set("q", term);
  const res = await api.get<PagedResponse>(`/api/data/imoveis?${qs}`);
  return {
    items: (res.data ?? []).map(fromRow),
    total: res.total ?? 0,
  };
}

const AdminCorretorImoveis = () => {
  const { updateProperty, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const searchFromUrl = searchParams.get("q") || "";

  const [properties, setProperties] = useState<ZapImovel[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, ativos: 0, inativos: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
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
        const [{ items, total }, stats] = await Promise.all([fetchPage(page, q), fetchCounts()]);
        setProperties(items);
        setTotalItems(total);
        setCounts(stats);
        const maxPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
        const resolved = Math.min(Math.max(1, page), maxPage);
        if (resolved !== page) {
          setCurrentPage(resolved);
          syncUrl(resolved, q);
        }
      } catch (e) {
        console.error("Failed to load imoveis page:", e);
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
    [syncUrl],
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

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      setBusyId(id);
      await updateProperty(id, { ativo: !ativo });
      toast({
        title: ativo ? "Imóvel desativado" : "Imóvel ativado",
        description: ativo
          ? "O imóvel não aparecerá mais no site público."
          : "O imóvel agora está visível no site público.",
      });
      await loadPage(safePage, debouncedSearch);
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setBusyId(deleteId);
      await deleteProperty(deleteId);
      toast({ title: "Imóvel excluído", description: "Registro removido com sucesso." });
      setDeleteId(null);
      const nextPage = properties.length === 1 && safePage > 1 ? safePage - 1 : safePage;
      goToPage(nextPage);
      await loadPage(nextPage, debouncedSearch);
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(safePage * ITEMS_PER_PAGE, totalItems);

  const priceLabel = (p: ZapImovel) =>
    p.precoVenda
      ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
      : p.precoAluguel
      ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
      : "—";

  // Shared action buttons (desktop table + mobile cards)
  const RowActions = ({ p, slug }: { p: ZapImovel; slug: string }) => (
    <>
      <Button variant="ghost" size="icon" asChild title="Visualizar no site">
        <Link to={`/imovel/${slug}-${p.id}`} target="_blank">
          <ExternalLink className="w-4 h-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Editar">
        <Link to={`/admin/imoveis/editar/${p.id}`}>
          <Pencil className="w-4 h-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" disabled={busyId === p.id} onClick={() => handleToggleActive(p.id, p.ativo)} title={p.ativo ? "Desativar" : "Ativar"}>
        <Power className={`w-4 h-4 ${p.ativo ? "text-primary" : "text-muted-foreground"}`} />
      </Button>
      <Button variant="ghost" size="icon" disabled={busyId === p.id} onClick={() => setDeleteId(p.id)} title="Excluir" className="text-destructive hover:text-destructive hover:bg-destructive/10">
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );

  const StatusPill = ({ ativo }: { ativo: boolean }) => (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ativo ? "bg-primary" : "bg-muted-foreground"}`} />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Imóveis"
        description="Gerencie os imóveis vinculados ao seu cadastro"
        icon={Building2}
        actions={
          <Button onClick={() => navigate("/admin/imoveis/novo")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Imóvel
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{counts.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{counts.ativos}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{counts.inativos}</p>
            <p className="text-xs text-muted-foreground">Inativos</p>
          </div>
        </div>
      </div>

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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Listagem</h2>
          <span className="text-xs text-muted-foreground">
            {totalItems === 0
              ? "Nenhum imóvel"
              : `Exibindo ${rangeStart}–${rangeEnd} de ${totalItems} imóveis`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Carregando imóveis…</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">Nenhum imóvel cadastrado.</p>
            <Button onClick={() => navigate("/admin/imoveis/novo")} className="gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar primeiro imóvel
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Imóvel</TableHead>
                  <TableHead className="hidden md:table-cell">Localização</TableHead>
                  <TableHead className="hidden lg:table-cell">Código</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => {
                  const cover = coverUrl(p.fotos);
                  const slug = slugify(p.tituloImovel || p.codigoImovel);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {cover ? (
                              <img
                                src={cover}
                                alt={p.tituloImovel}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate max-w-[240px]">
                              {p.tituloImovel}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {p.cidade}/{p.estado}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {p.bairro ? `${p.bairro}, ` : ""}
                        {p.cidade}/{p.estado}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                        {p.codigoImovel}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-primary whitespace-nowrap">{priceLabel(p)}</p>
                      </TableCell>
                      <TableCell>
                        <StatusPill ativo={p.ativo} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <RowActions p={p} slug={slug} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-border">
              {properties.map((p) => {
                const cover = coverUrl(p.fotos);
                const slug = slugify(p.tituloImovel || p.codigoImovel);
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {cover ? (
                          <img src={cover} alt={p.tituloImovel} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{p.tituloImovel}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.bairro ? `${p.bairro}, ` : ""}{p.cidade}/{p.estado}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">{p.codigoImovel}</p>
                      </div>
                      <StatusPill ativo={p.ativo} />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">{priceLabel(p)}</span>
                      <div className="flex items-center gap-1">
                        <RowActions p={p} slug={slug} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
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
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground text-sm">…</span>
                        )}
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
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O imóvel será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCorretorImoveis;
