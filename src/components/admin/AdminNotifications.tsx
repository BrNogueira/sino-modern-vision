import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Home, UserPlus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { SystemLogEntry } from "@/lib/systemLog";

const SEEN_KEY = "sinos_admin_notif_seen";
const POLL_MS = 60_000;

interface NotifItem {
  id: string;
  tipo: string;
  descricao: string;
  createdAt: string;
  href: string;
}

const hrefByTipo: Record<string, string> = {
  lead: "/admin/leads",
  imovel: "/admin/imoveis",
  usuario: "/admin/usuarios",
};

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const TipoIcon = ({ tipo }: { tipo: string }) => {
  if (tipo === "lead") return <UserPlus className="w-4 h-4 text-primary shrink-0" />;
  if (tipo === "imovel") return <Home className="w-4 h-4 text-primary shrink-0" />;
  return <Activity className="w-4 h-4 text-primary shrink-0" />;
};

export function AdminNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [lastSeen, setLastSeen] = useState<string>(() => localStorage.getItem(SEEN_KEY) || new Date(0).toISOString());

  const fetchNotifications = useCallback(async () => {
    // Leads novos (inclusive do formulário público) + trilha de auditoria.
    const [leadsRes, logsRes] = await Promise.all([
      supabase.from("leads").select("id,nome,origem,created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("system_logs").select("id,tipo,acao,descricao,created_at").order("created_at", { ascending: false }).limit(15),
    ]);
    const leadItems: NotifItem[] = ((leadsRes.data as any[]) || []).map((l) => ({
      id: `lead-${l.id}`,
      tipo: "lead",
      descricao: `Novo lead: ${l.nome}${l.origem ? ` (${l.origem})` : ""}`,
      createdAt: l.created_at,
      href: "/admin/leads",
    }));
    const logItems: NotifItem[] = ((logsRes.data as SystemLogEntry[]) || [])
      // Lead criado pelo admin já aparece via tabela leads — evita duplicar.
      .filter((l) => !(l.tipo === "lead" && l.acao === "criado"))
      .map((l) => ({
        id: l.id,
        tipo: l.tipo,
        descricao: l.descricao,
        createdAt: l.created_at,
        href: hrefByTipo[l.tipo] ?? "/admin/logs",
      }));
    const merged = [...leadItems, ...logItems]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12);
    setItems(merged);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  const unread = useMemo(() => items.filter((i) => i.createdAt > lastSeen).length, [items, lastSeen]);

  const markSeen = (open: boolean) => {
    if (!open) return;
    const now = new Date().toISOString();
    localStorage.setItem(SEEN_KEY, now);
    // Badge some só depois de fechar; manter até lá ajuda a localizar os novos.
    setTimeout(() => setLastSeen(now), 400);
  };

  return (
    <DropdownMenu onOpenChange={markSeen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" aria-label="Notificações">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(48,100%,50%)] text-[10px] font-bold text-black flex items-center justify-center ring-2 ring-card">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">Nenhuma notificação por enquanto.</div>
        )}
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => navigate(item.href)}
            className="flex items-start gap-2.5 py-2.5 cursor-pointer"
          >
            <TipoIcon tipo={item.tipo} />
            <span className="flex-1 text-sm leading-snug line-clamp-2">{item.descricao}</span>
            <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1.5">
              {relTime(item.createdAt)}
              {item.createdAt > lastSeen && <span className="w-2 h-2 rounded-full bg-[hsl(48,100%,50%)]" />}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/admin/logs")} className="justify-center text-sm font-medium text-primary cursor-pointer">
          Ver todos os logs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
