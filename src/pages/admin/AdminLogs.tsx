import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, RefreshCw, Activity } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import type { SystemLogEntry } from "@/lib/systemLog";

const PAGE_SIZE = 50;

const TIPO_LABELS: Record<string, string> = {
  imovel: "Imóvel",
  lead: "Lead",
  usuario: "Usuário",
  sistema: "Sistema",
};

const ACAO_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  criado: "default",
  atualizado: "secondary",
  alterado: "secondary",
  status: "outline",
  excluido: "destructive",
};

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const AdminLogs = () => {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const { data } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE); // pede 1 a mais para saber se há próxima página
    const rows = (data as SystemLogEntry[]) || [];
    setHasMore(rows.length > PAGE_SIZE);
    setLogs(rows.slice(0, PAGE_SIZE));
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (tipoFilter !== "all" && l.tipo !== tipoFilter) return false;
      if (!q) return true;
      return [l.descricao, l.entidade, l.usuario, l.acao]
        .some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [logs, search, tipoFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs do Sistema"
        description="Trilha de tudo que acontece no site: cadastros, edições, leads e alterações da equipe."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição, usuário, entidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(TIPO_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLogs} aria-label="Atualizar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Data</TableHead>
              <TableHead className="w-[90px]">Tipo</TableHead>
              <TableHead className="w-[110px]">Ação</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[180px]">Usuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-5 h-5 animate-spin inline-block text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Activity className="w-5 h-5 inline-block mr-2" />
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(log.created_at)}</TableCell>
                  <TableCell><Badge variant="outline">{TIPO_LABELS[log.tipo] ?? log.tipo}</Badge></TableCell>
                  <TableCell><Badge variant={ACAO_VARIANT[log.acao] ?? "secondary"}>{log.acao}</Badge></TableCell>
                  <TableCell className="text-sm">{log.descricao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.usuario ?? "—"}{log.role ? ` (${log.role})` : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Página {page + 1}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!hasMore || loading} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
