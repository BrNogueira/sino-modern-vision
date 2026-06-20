import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Plus, Pencil, Trash2, Loader2, Save, Search, Phone, Mail, Copy } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SortableHead } from "@/components/admin/SortableHead";
import { useTableSort, type SortAccessors } from "@/hooks/useTableSort";

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  interesse: string;
  tipo_interesse: string;
  faixa_preco_min: number;
  faixa_preco_max: number;
  bairros_interesse: string;
  observacoes: string;
  status: string;
  corretor_id: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "novo", label: "Novo", color: "bg-blue-100 text-blue-800" },
  { value: "contato", label: "Em Contato", color: "bg-yellow-100 text-yellow-800" },
  { value: "visita", label: "Visita Agendada", color: "bg-purple-100 text-purple-800" },
  { value: "negociacao", label: "Em Negociação", color: "bg-orange-100 text-orange-800" },
  { value: "fechado", label: "Fechado", color: "bg-green-100 text-green-800" },
  { value: "perdido", label: "Perdido", color: "bg-red-100 text-red-800" },
];

const ORIGEM_OPTIONS = ["site", "telefone", "indicacao", "portal", "redes_sociais", "presencial", "outro"];

type LeadSortKey = "nome" | "interesse" | "origem" | "status" | "created_at";
const LEAD_SORT: SortAccessors<Lead, LeadSortKey> = {
  nome: (l) => l.nome?.toLowerCase(),
  interesse: (l) => l.interesse?.toLowerCase(),
  origem: (l) => l.origem?.toLowerCase(),
  status: (l) => STATUS_OPTIONS.findIndex((o) => o.value === l.status),
  created_at: (l) => l.created_at, // ISO → ordena cronologicamente
};

const emptyLead = {
  nome: "", email: "", telefone: "", origem: "site", interesse: "",
  tipo_interesse: "compra", faixa_preco_min: 0, faixa_preco_max: 0,
  bairros_interesse: "", observacoes: "", status: "novo", corretor_id: null as string | null,
};

const normEmail = (s?: string | null) => (s || "").trim().toLowerCase();
const normPhone = (s?: string | null) => (s || "").replace(/\D/g, "");

// Agrupa leads que compartilham e-mail ou telefone (transitivo via union-find).
// Telefones com < 8 dígitos são ignorados para evitar falsos positivos.
function findDuplicateGroups(leads: Lead[]): Lead[][] {
  const parent = leads.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };
  const byEmail = new Map<string, number>();
  const byPhone = new Map<string, number>();
  leads.forEach((l, i) => {
    const e = normEmail(l.email);
    if (e) { const j = byEmail.get(e); if (j !== undefined) union(i, j); else byEmail.set(e, i); }
    const p = normPhone(l.telefone);
    if (p.length >= 8) { const j = byPhone.get(p); if (j !== undefined) union(i, j); else byPhone.set(p, i); }
  });
  const groups = new Map<number, Lead[]>();
  leads.forEach((l, i) => {
    const r = find(i);
    const g = groups.get(r);
    if (g) g.push(l); else groups.set(r, [l]);
  });
  return [...groups.values()].filter(g => g.length > 1).sort((a, b) => b.length - a.length);
}

const AdminLeads = () => {
  const { canEdit, canDelete, user } = useAdminAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyLead & { id?: string }>(emptyLead);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState("all");
  const [dupOpen, setDupOpen] = useState(false);

  const duplicateGroups = useMemo(() => findDuplicateGroups(items), [items]);
  const duplicateCount = duplicateGroups.reduce((n, g) => n + g.length, 0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setItems((data as Lead[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    if (form.id) {
      const { id, ...rest } = form;
      await supabase.from("leads").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      toast({ title: "Lead atualizado" });
    } else {
      await supabase.from("leads").insert({ ...form, created_by: user?.id });
      toast({ title: "Lead cadastrado" });
    }
    setDialogOpen(false);
    setForm(emptyLead);
    fetchData();
  };

  const handleEdit = (item: Lead) => {
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("leads").delete().eq("id", id);
    toast({ title: "Lead excluído" });
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchData();
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const filtered = items.filter(i => {
    const matchSearch = i.nome.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.telefone.includes(search);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchOrigem = origemFilter === "all" || i.origem === origemFilter;
    return matchSearch && matchStatus && matchOrigem;
  });

  const { sort, toggle, sorted } = useTableSort(filtered, LEAD_SORT, { key: "created_at", dir: "desc" });

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find(o => o.value === status);
    return <span className={`text-xs px-2 py-0.5 rounded-full ${s?.color || "bg-muted text-muted-foreground"}`}>{s?.label || status}</span>;
  };

  // Stats
  const totalNovos = items.filter(i => i.status === "novo").length;
  const totalContato = items.filter(i => i.status === "contato").length;
  const totalNegociacao = items.filter(i => i.status === "negociacao").length;
  const totalFechados = items.filter(i => i.status === "fechado").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Contatos"
        description="Funil de vendas e gestão de clientes interessados"
        icon={TrendingUp}
        actions={
          canEdit("leads") && (
            <Button size="lg" className="gap-2" onClick={() => { setForm(emptyLead); setDialogOpen(true); }}>
              <Plus className="w-4 h-4" />Novo Lead
            </Button>
          )
        }
      />

      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Novos", value: totalNovos, color: "text-blue-600" },
          { label: "Em Contato", value: totalContato, color: "text-yellow-600" },
          { label: "Negociação", value: totalNegociacao, color: "text-orange-600" },
          { label: "Fechados", value: totalFechados, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={origemFilter} onValueChange={setOrigemFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {ORIGEM_OPTIONS.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={() => setDupOpen(true)}>
          <Copy className="w-4 h-4" />
          Verificar Duplicados
          {duplicateGroups.length > 0 && (
            <Badge variant="secondary" className="ml-1">{duplicateGroups.length}</Badge>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
        {/* Desktop: table */}
        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Nome" sortKey="nome" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <TableHead>Contato</TableHead>
                <SortableHead label="Interesse" sortKey="interesse" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <SortableHead label="Origem" sortKey="origem" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <SortableHead label="Status" sortKey="status" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <SortableHead label="Data" sortKey="created_at" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {item.telefone && <p className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{item.telefone}</p>}
                      {item.email && <p className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{item.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">{item.interesse || "—"}</TableCell>
                  <TableCell className="text-xs capitalize">{item.origem}</TableCell>
                  <TableCell>
                    <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-32 border-0 p-0">
                        <SelectValue>{getStatusBadge(item.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {canEdit("leads") && <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>}
                      {canDelete("leads") && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum lead encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-card border border-border rounded-xl text-center text-muted-foreground py-8">
              Nenhum lead encontrado.
            </div>
          ) : (
            sorted.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{item.nome}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.origem} · {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Select value={item.status} onValueChange={v => handleStatusChange(item.id, v)}>
                    <SelectTrigger className="h-7 text-xs w-auto border-0 p-0 shrink-0">
                      <SelectValue>{getStatusBadge(item.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(item.telefone || item.email || item.interesse) && (
                  <div className="space-y-1">
                    {item.telefone && (
                      <p className="text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{item.telefone}</p>
                    )}
                    {item.email && (
                      <p className="text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="truncate">{item.email}</span></p>
                    )}
                    {item.interesse && <p className="text-sm text-muted-foreground">{item.interesse}</p>}
                  </div>
                )}
                {(canEdit("leads") || canDelete("leads")) && (
                  <div className="flex gap-2 border-t border-border pt-3">
                    {canEdit("leads") && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleEdit(item)}>
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </Button>
                    )}
                    {canDelete("leads") && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Lead" : "Novo Lead"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5"><Label>Nome *</Label><Input value={form.nome} onChange={e => updateField("nome", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Telefone</Label><Input value={form.telefone} onChange={e => updateField("telefone", e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Tipo de Interesse</Label>
                <Select value={form.tipo_interesse} onValueChange={v => updateField("tipo_interesse", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="aluguel">Aluguel</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Origem</Label>
                <Select value={form.origem} onValueChange={v => updateField("origem", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORIGEM_OPTIONS.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1.5"><Label>Interesse</Label><Input value={form.interesse} onChange={e => updateField("interesse", e.target.value)} placeholder="Ex: Casa 3 quartos em Campo Bom" /></div>
              <div className="space-y-1.5"><Label>Faixa Preço Mín (R$)</Label><Input type="number" value={form.faixa_preco_min} onChange={e => updateField("faixa_preco_min", Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Faixa Preço Máx (R$)</Label><Input type="number" value={form.faixa_preco_max} onChange={e => updateField("faixa_preco_max", Number(e.target.value))} /></div>
              <div className="md:col-span-2 space-y-1.5"><Label>Bairros de Interesse</Label><Input value={form.bairros_interesse} onChange={e => updateField("bairros_interesse", e.target.value)} placeholder="Ex: Centro, Hamburgo Velho, Lomba Grande" /></div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1.5"><Label>Observações</Label><Textarea rows={3} value={form.observacoes} onChange={e => updateField("observacoes", e.target.value)} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />{form.id ? "Salvar" : "Cadastrar Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: leads duplicados */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leads duplicados</DialogTitle>
          </DialogHeader>
          {duplicateGroups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma duplicidade encontrada — nenhum lead compartilha e-mail ou telefone.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                {duplicateGroups.length} grupo(s) · {duplicateCount} cadastros com e-mail ou telefone repetidos.
              </p>
              {duplicateGroups.map((group, gi) => (
                <div key={gi} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {group.length} cadastros
                  </div>
                  <div className="divide-y divide-border">
                    {group.map(lead => (
                      <div key={lead.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium truncate flex items-center gap-2">
                            {lead.nome}{getStatusBadge(lead.status)}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {lead.telefone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefone}</p>}
                            {lead.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /><span className="truncate">{lead.email}</span></p>}
                            <p className="capitalize">{lead.origem} · {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {canEdit("leads") && (
                            <Button size="sm" variant="ghost" onClick={() => { setDupOpen(false); handleEdit(lead); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canDelete("leads") && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(lead.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
