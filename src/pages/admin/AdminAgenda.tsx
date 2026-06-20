import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/integrations/api/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { AsyncPicker, type PickerItem } from "@/components/admin/AsyncPicker";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Save,
  MapPin, Phone, Building2, User, Clock, Loader2,
} from "lucide-react";

// ── catálogos ─────────────────────────────────────────────────────────────
const TIPOS = [
  { value: "visita",    label: "Visita",    badge: "bg-blue-100 text-blue-800",      dot: "bg-blue-500" },
  { value: "reuniao",   label: "Reunião",   badge: "bg-purple-100 text-purple-800",  dot: "bg-purple-500" },
  { value: "ligacao",   label: "Ligação",   badge: "bg-amber-100 text-amber-800",    dot: "bg-amber-500" },
  { value: "avaliacao", label: "Avaliação", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
] as const;
const STATUS = [
  { value: "agendado",      label: "Agendado",       badge: "bg-blue-100 text-blue-800" },
  { value: "confirmado",    label: "Confirmado",     badge: "bg-indigo-100 text-indigo-800" },
  { value: "realizado",     label: "Realizado",      badge: "bg-green-100 text-green-800" },
  { value: "cancelado",     label: "Cancelado",      badge: "bg-red-100 text-red-800" },
  { value: "nao_compareceu", label: "Não compareceu", badge: "bg-gray-200 text-gray-700" },
] as const;
const tipoMap = Object.fromEntries(TIPOS.map((t) => [t.value, t]));
const statusMap = Object.fromEntries(STATUS.map((s) => [s.value, s]));

interface AgendaEvento {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  status: string;
  local: string | null;
  imovel_id: string | null;
  imovel_label: string | null;
  contato_tipo: string | null;
  contato_id: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  corretor_id: string | null;
  corretor_nome: string | null;
}

// O servidor retorna DATETIME como ISO-UTC (pool timezone:"Z" preserva o relógio
// de parede). Lemos data/hora direto da string p/ evitar conversão de fuso.
const wallDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const wallTime = (iso?: string | null) => (iso ? iso.slice(11, 16) : "");

type FormState = {
  id?: string;
  tipo: string;
  titulo: string;
  descricao: string;
  data: string;       // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFim: string;    // HH:mm
  status: string;
  local: string;
  imovel_id: string | null;
  imovel_label: string | null;
  contato_tipo: string | null;
  contato_id: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  corretor_id: string | null;
  corretor_nome: string | null;
};

const emptyForm = (data: string): FormState => ({
  tipo: "visita", titulo: "", descricao: "", data,
  horaInicio: "09:00", horaFim: "", status: "agendado", local: "",
  imovel_id: null, imovel_label: null,
  contato_tipo: null, contato_id: null, contato_nome: null, contato_telefone: null,
  corretor_id: null, corretor_nome: null,
});

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface AdminAgendaProps {
  /** Restringe à agenda do corretor logado (esconde filtro de corretor). */
  mineOnly?: boolean;
}

const AdminAgenda = ({ mineOnly = false }: AdminAgendaProps) => {
  const { user, profile, canEdit, canDelete } = useAdminAuth();
  const { toast } = useToast();
  const podeEditar = canEdit("agenda");

  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [corretores, setCorretores] = useState<{ id: string; full_name: string }[]>([]);
  const [filterCorretor, setFilterCorretor] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(format(new Date(), "yyyy-MM-dd")));
  const [saving, setSaving] = useState(false);

  const gridStart = useMemo(() => startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 }), [viewDate]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 }), [viewDate]);
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  // corretores (responsáveis) — qualquer usuário interno ativo
  useEffect(() => {
    if (mineOnly) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id,full_name").eq("active", 1).order("full_name");
      setCorretores((data as { id: string; full_name: string }[]) || []);
    })();
  }, [mineOnly]);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    try {
      let qb = supabase
        .from("agenda_eventos")
        .select("*")
        .gte("data_inicio", `${format(gridStart, "yyyy-MM-dd")} 00:00:00`)
        .lte("data_inicio", `${format(gridEnd, "yyyy-MM-dd")} 23:59:59`)
        .order("data_inicio", { ascending: true });
      const cor = mineOnly ? user?.id : filterCorretor !== "all" ? filterCorretor : null;
      if (cor) qb = qb.eq("corretor_id", cor);
      if (filterTipo !== "all") qb = qb.eq("tipo", filterTipo);
      if (filterStatus !== "all") qb = qb.eq("status", filterStatus);
      const { data } = await qb;
      setEventos((data as AgendaEvento[]) || []);
    } catch {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [gridStart, gridEnd, mineOnly, user?.id, filterCorretor, filterTipo, filterStatus]);

  useEffect(() => { loadEventos(); }, [loadEventos]);

  // eventos agrupados por dia (yyyy-MM-dd)
  const eventosByDay = useMemo(() => {
    const map = new Map<string, AgendaEvento[]>();
    for (const ev of eventos) {
      const key = wallDate(ev.data_inicio);
      const arr = map.get(key);
      if (arr) arr.push(ev); else map.set(key, [ev]);
    }
    return map;
  }, [eventos]);

  const dayEvents = (d: Date) => eventosByDay.get(format(d, "yyyy-MM-dd")) ?? [];
  const selectedEvents = dayEvents(selectedDay);

  // ── busca dos vínculos ──
  const searchImovel = useCallback(async (term: string): Promise<PickerItem[]> => {
    const qs = new URLSearchParams({ select: "id,codigo_imovel,titulo_imovel,cidade", limit: "10" });
    if (term) qs.set("q", term);
    const rows = await api.get<Record<string, string>[]>(`/api/data/imoveis?${qs}`);
    return (rows || []).map((r) => ({
      id: r.id,
      label: `${r.codigo_imovel ? r.codigo_imovel + " · " : ""}${r.titulo_imovel ?? "Imóvel"}`,
      sublabel: r.cidade ?? undefined,
    }));
  }, []);

  const searchContato = useCallback(async (term: string): Promise<PickerItem[]> => {
    const mk = (tbl: "leads" | "clientes") => {
      const qs = new URLSearchParams({ select: "id,nome,telefone,email", limit: "8" });
      if (term) qs.set("q", term);
      return api.get<Record<string, string>[]>(`/api/data/${tbl}?${qs}`).catch(() => []);
    };
    const [leads, clientes] = await Promise.all([mk("leads"), mk("clientes")]);
    const map = (rows: Record<string, string>[], tipo: "lead" | "cliente"): PickerItem[] =>
      (rows || []).map((r) => ({
        id: `${tipo}:${r.id}`,
        label: r.nome ?? "—",
        sublabel: [tipo === "lead" ? "Lead" : "Cliente", r.telefone || r.email].filter(Boolean).join(" · "),
      }));
    return [...map(clientes, "cliente"), ...map(leads, "lead")];
  }, []);

  // ── form helpers ──
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openNew = (day?: Date) => {
    const base = emptyForm(format(day ?? selectedDay, "yyyy-MM-dd"));
    // pré-seleciona o corretor logado como responsável
    if (user?.id) { base.corretor_id = user.id; base.corretor_nome = profile?.full_name ?? null; }
    setForm(base);
    setDialogOpen(true);
  };

  const openEdit = (ev: AgendaEvento) => {
    setForm({
      id: ev.id,
      tipo: ev.tipo, titulo: ev.titulo, descricao: ev.descricao ?? "",
      data: wallDate(ev.data_inicio), horaInicio: wallTime(ev.data_inicio),
      horaFim: wallTime(ev.data_fim), status: ev.status, local: ev.local ?? "",
      imovel_id: ev.imovel_id, imovel_label: ev.imovel_label,
      contato_tipo: ev.contato_tipo, contato_id: ev.contato_id,
      contato_nome: ev.contato_nome, contato_telefone: ev.contato_telefone,
      corretor_id: ev.corretor_id, corretor_nome: ev.corretor_nome,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast({ title: "Informe um título", variant: "destructive" }); return;
    }
    if (!form.data || !form.horaInicio) {
      toast({ title: "Informe data e hora de início", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      data_inicio: `${form.data} ${form.horaInicio}:00`,
      data_fim: form.horaFim ? `${form.data} ${form.horaFim}:00` : null,
      status: form.status,
      local: form.local.trim() || null,
      imovel_id: form.imovel_id,
      imovel_label: form.imovel_label,
      contato_tipo: form.contato_tipo,
      contato_id: form.contato_id,
      contato_nome: form.contato_nome,
      contato_telefone: form.contato_telefone,
      corretor_id: form.corretor_id,
      corretor_nome: form.corretor_nome,
    };
    try {
      if (form.id) {
        await supabase.from("agenda_eventos").update(payload).eq("id", form.id);
        toast({ title: "Compromisso atualizado" });
      } else {
        await supabase.from("agenda_eventos").insert({ ...payload, created_by: user?.id });
        toast({ title: "Compromisso agendado" });
      }
      setDialogOpen(false);
      setSelectedDay(new Date(`${form.data}T00:00:00`));
      await loadEventos();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("agenda_eventos").delete().eq("id", id);
      toast({ title: "Compromisso excluído" });
      await loadEventos();
    } catch (e) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handleStatus = async (id: string, status: string) => {
    await supabase.from("agenda_eventos").update({ status }).eq("id", id);
    await loadEventos();
  };

  const goToday = () => { const t = new Date(); setViewDate(startOfMonth(t)); setSelectedDay(t); };

  const TipoBadge = ({ tipo }: { tipo: string }) => {
    const t = tipoMap[tipo];
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t?.badge ?? "bg-muted"}`}>{t?.label ?? tipo}</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={mineOnly ? "Minha Agenda" : "Agenda"}
        description="Calendário de visitas e compromissos"
        icon={CalendarDays}
        actions={
          podeEditar && (
            <Button size="lg" className="gap-2" onClick={() => openNew()}>
              <Plus className="w-4 h-4" /> Novo Compromisso
            </Button>
          )
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setViewDate((d) => addMonths(d, -1))} title="Mês anterior">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setViewDate((d) => addMonths(d, 1))} title="Próximo mês">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
        <span className="text-lg font-semibold capitalize ml-1 mr-auto">
          {format(viewDate, "MMMM yyyy", { locale: ptBR })}
        </span>
        {!mineOnly && (
          <Select value={filterCorretor} onValueChange={setFilterCorretor}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Corretor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos corretores</SelectItem>
              {corretores.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name || "—"}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tipos</SelectItem>
            {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Calendário */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-1 py-2 text-center text-[11px] font-medium text-muted-foreground">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const evs = dayEvents(day);
              const inMonth = isSameMonth(day, viewDate);
              const selected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[76px] md:min-h-[96px] border-b border-r border-border p-1 text-left align-top transition-colors hover:bg-muted/40 ${
                    !inMonth ? "bg-muted/20 text-muted-foreground/50" : ""
                  } ${selected ? "ring-2 ring-inset ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday(day) ? "bg-primary text-primary-foreground font-semibold" : ""
                    }`}>
                      {format(day, "d")}
                    </span>
                    {evs.length > 0 && (
                      <span className="text-[10px] text-muted-foreground md:hidden">{evs.length}</span>
                    )}
                  </div>
                  {/* desktop: chips; mobile: dots */}
                  <div className="mt-1 space-y-0.5 hidden md:block">
                    {evs.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-1 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tipoMap[ev.tipo]?.dot ?? "bg-muted"}`} />
                        <span className="text-[11px] truncate">{wallTime(ev.data_inicio)} {ev.titulo}</span>
                      </div>
                    ))}
                    {evs.length > 3 && <p className="text-[10px] text-muted-foreground">+{evs.length - 3} mais</p>}
                  </div>
                  <div className="mt-1 flex gap-0.5 flex-wrap md:hidden">
                    {evs.slice(0, 4).map((ev) => (
                      <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${tipoMap[ev.tipo]?.dot ?? "bg-muted"}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel do dia */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold capitalize">
              {format(selectedDay, "EEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            {podeEditar && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => openNew(selectedDay)}>
                <Plus className="w-3.5 h-3.5" /> Novo
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum compromisso neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {wallTime(ev.data_inicio)}{ev.data_fim ? `–${wallTime(ev.data_fim)}` : ""}
                        </span>
                        <TipoBadge tipo={ev.tipo} />
                      </div>
                      <p className="font-medium text-foreground mt-0.5 truncate">{ev.titulo}</p>
                    </div>
                    {(podeEditar || canDelete("agenda")) && (
                      <div className="flex gap-0.5 shrink-0">
                        {podeEditar && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(ev)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {canDelete("agenda") && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {ev.imovel_label && <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.imovel_label}</span></p>}
                    {ev.contato_nome && <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.contato_nome}{ev.contato_telefone ? ` · ${ev.contato_telefone}` : ""}</span></p>}
                    {ev.contato_telefone && !ev.contato_nome && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0" />{ev.contato_telefone}</p>}
                    {ev.local && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.local}</span></p>}
                    {!mineOnly && ev.corretor_nome && <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.corretor_nome}</span></p>}
                  </div>
                  {podeEditar ? (
                    <Select value={ev.status} onValueChange={(v) => handleStatus(ev.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusMap[ev.status]?.badge ?? "bg-muted"}`}>
                      {statusMap[ev.status]?.label ?? ev.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Visita casa no Centro" maxLength={200} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Início *</Label>
                <Input type="time" value={form.horaInicio} onChange={(e) => set("horaInicio", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input type="time" value={form.horaFim} onChange={(e) => set("horaFim", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Imóvel</Label>
              <AsyncPicker
                valueLabel={form.imovel_label}
                placeholder="Vincular imóvel (opcional)"
                search={searchImovel}
                onSelect={(it) => { set("imovel_id", it?.id ?? null); set("imovel_label", it?.label ?? null); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Contato (lead/cliente)</Label>
              <AsyncPicker
                valueLabel={form.contato_nome}
                placeholder="Vincular contato (opcional)"
                search={searchContato}
                onSelect={(it) => {
                  if (!it) { set("contato_tipo", null); set("contato_id", null); set("contato_nome", null); set("contato_telefone", null); return; }
                  const [tipo, id] = it.id.split(":");
                  set("contato_tipo", tipo); set("contato_id", id);
                  set("contato_nome", it.label);
                  set("contato_telefone", it.sublabel?.split(" · ").pop() ?? null);
                }}
              />
            </div>

            {!mineOnly && (
              <div className="space-y-1.5">
                <Label>Corretor responsável</Label>
                <Select
                  value={form.corretor_id ?? "none"}
                  onValueChange={(v) => {
                    if (v === "none") { set("corretor_id", null); set("corretor_nome", null); return; }
                    set("corretor_id", v);
                    set("corretor_nome", corretores.find((c) => c.id === v)?.full_name ?? null);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem responsável</SelectItem>
                    {corretores.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name || "—"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Local / endereço</Label>
              <Input value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="Endereço ou ponto de encontro" maxLength={255} />
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={2} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {form.id ? "Salvar" : "Agendar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgenda;
