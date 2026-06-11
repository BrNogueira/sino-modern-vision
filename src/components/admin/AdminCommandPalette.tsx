import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Building,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Shield,
  UserPlus,
  Radio,
  Settings,
  LogOut,
  Home,
  Map,
  Search,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const commands = [
  { group: "Visão Geral", items: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, module: "dashboard" },
    { label: "Relatórios", href: "/admin/relatorios", icon: FileText, module: "relatorios" },
  ]},
  { group: "Imóveis", items: [
    { label: "Todos os imóveis", href: "/admin/imoveis", icon: Building2, module: "imoveis" },
    { label: "Cadastrar imóvel", href: "/admin/imoveis/novo", icon: PlusCircle, module: "imoveis" },
    { label: "Condomínios", href: "/admin/condominios", icon: Building, module: "condominios" },
  ]},
  { group: "CRM", items: [
    { label: "Leads", href: "/admin/leads", icon: TrendingUp, module: "leads" },
    { label: "Agenda", href: "/admin/agenda", icon: Calendar, module: "agenda" },
  ]},
  { group: "Corretor", items: [
    { label: "Meus imóveis", href: "/admin/corretor/imoveis", icon: Home, module: "imoveis" },
    { label: "Mapa", href: "/admin/corretor/mapa", icon: Map, module: "imoveis" },
    { label: "Pesquisar", href: "/admin/corretor/pesquisar", icon: Search, module: "imoveis" },
  ]},
  { group: "Equipe", items: [
    { label: "Corretores", href: "/admin/corretores", icon: Users, module: "corretores" },
    { label: "Usuários", href: "/admin/usuarios", icon: Shield, module: "usuarios" },
    { label: "Cadastrar usuário", href: "/admin/usuarios/novo", icon: UserPlus, module: "usuarios" },
    { label: "Permissões", href: "/admin/permissoes", icon: Shield, module: "usuarios" },
  ]},
  { group: "Integrações & Sistema", items: [
    { label: "Canal Pro / ZAP", href: "/admin/canal-pro", icon: Radio, module: "canal_pro" },
    { label: "Configurações", href: "/admin/configuracoes", icon: Settings, module: "configuracoes" },
  ]},
];

export const ADMIN_PALETTE_EVENT = "admin:open-palette";
export const openAdminPalette = () => {
  window.dispatchEvent(new Event(ADMIN_PALETTE_EVENT));
};

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { canAccess, logout } = useAdminAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener(ADMIN_PALETTE_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener(ADMIN_PALETTE_EVENT, onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, imóveis, ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        {commands.map((g, idx) => {
          const visible = g.items.filter((i) => canAccess(i.module));
          if (visible.length === 0) return null;
          return (
            <div key={g.group}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={g.group}>
                {visible.map((item) => (
                  <CommandItem key={item.href} onSelect={() => go(item.href)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => { setOpen(false); logout(); }}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair do painel
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
