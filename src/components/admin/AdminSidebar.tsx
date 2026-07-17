import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Home,
  Building,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  UserPlus,
  Shield,
  Radio,
  Settings,
  Briefcase,
  Map,
  Search,
  UserCircle,
  PlusCircle,
  Sparkles,
  LayoutGrid,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  ScrollText,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoSinos from "@/assets/logo-sinos-imoveis.webp";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon?: any;
  module: string;
  exact?: boolean;
}

// Menu enxuto: itens diretos ou menus com submenu (evita scrollbar no primeiro olhar).
interface NavEntry {
  label: string;
  icon: any;
  module?: string; // item direto
  href?: string;
  exact?: boolean;
  children?: NavItem[]; // menu com submenu
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  corretor: "Corretor",
  financeiro: "Financeiro",
};

const NAV: NavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", module: "dashboard", exact: true },
  {
    label: "Imóveis",
    icon: Building2,
    children: [
      { label: "Todos os Imóveis", href: "/admin/imoveis", icon: Building2, module: "imoveis", exact: true },
      { label: "Cadastrar Imóvel", href: "/admin/imoveis/novo", icon: PlusCircle, module: "imoveis" },
      { label: "Categorias (Home)", href: "/admin/categorias", icon: LayoutGrid, module: "imoveis" },
      { label: "Condomínios", href: "/admin/condominios", icon: Building, module: "condominios" },
    ],
  },
  {
    label: "CRM & Atendimento",
    icon: TrendingUp,
    children: [
      { label: "Leads", href: "/admin/leads", icon: TrendingUp, module: "leads" },
      { label: "Agenda", href: "/admin/agenda", icon: Calendar, module: "agenda" },
    ],
  },
  {
    label: "Área do Corretor",
    icon: Briefcase,
    children: [
      { label: "Meus Imóveis", href: "/admin/corretor/imoveis", icon: Home, module: "imoveis" },
      { label: "Agenciamentos", href: "/admin/corretor/agenciamentos", icon: Briefcase, module: "imoveis" },
      { label: "Pré Cadastros", href: "/admin/corretor/pre-cadastros", icon: FileText, module: "imoveis" },
      { label: "Mapa", href: "/admin/corretor/mapa", icon: Map, module: "imoveis" },
      { label: "Pesquisar", href: "/admin/corretor/pesquisar", icon: Search, module: "imoveis" },
      { label: "Meu Cadastro", href: "/admin/corretor", icon: UserCircle, module: "imoveis", exact: true },
      { label: "Cadastrar Proprietário", href: "/admin/corretor/proprietario", icon: UserPlus, module: "imoveis" },
      { label: "Cadastrar Cliente", href: "/admin/corretor/cliente", icon: Users, module: "leads" },
    ],
  },
  {
    label: "Equipe",
    icon: Users,
    children: [
      { label: "Corretores", href: "/admin/corretores", icon: Users, module: "corretores" },
      { label: "Usuários", href: "/admin/usuarios", icon: Shield, module: "usuarios", exact: true },
      { label: "Cadastrar Usuário", href: "/admin/usuarios/novo", icon: UserPlus, module: "usuarios" },
      { label: "Permissões", href: "/admin/permissoes", icon: Shield, module: "usuarios" },
    ],
  },
  { label: "Relatórios", icon: FileText, href: "/admin/relatorios", module: "relatorios" },
  { label: "Canal Pro / ZAP", icon: Radio, href: "/admin/canal-pro", module: "canal_pro" },
  {
    label: "Admin",
    icon: Settings,
    children: [
      { label: "Logs do Sistema", href: "/admin/logs", icon: ScrollText, module: "configuracoes" },
      { label: "Configurações", href: "/admin/configuracoes", icon: Settings, module: "configuracoes" },
    ],
  },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { canAccess, profile, roles } = useAdminAuth();
  const collapsed = state === "collapsed";

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname === href || location.pathname.startsWith(href + "/");

  const itemClass = (active: boolean) =>
    `group relative flex items-center gap-3 rounded-md transition-all ${
      active
        ? "bg-white/15 text-sidebar-foreground font-medium shadow-sm"
        : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground"
    }`;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/40 bg-sidebar">
        <Link to="/admin" className="flex items-center gap-3 px-2 py-3">
          <div className="rounded-lg bg-white/10 backdrop-blur p-1.5 ring-1 ring-white/20 shrink-0">
            <img src={logoSinos} alt="Sinos Imóveis" className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-sidebar-foreground">Sinos Imóveis</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Painel Pro
              </span>
            </div>
          )}
        </Link>

        {!collapsed && profile && (
          <div className="mx-2 mb-2 rounded-lg bg-sidebar-accent/40 backdrop-blur px-3 py-2 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{profile.full_name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.length > 0 ? (
                roles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[9px] h-4 px-1.5 bg-white/15 hover:bg-white/20 text-sidebar-foreground border-0">
                    {ROLE_LABELS[r] || r}
                  </Badge>
                ))
              ) : (
                <span className="text-[9px] text-sidebar-foreground/50">Sem perfil</span>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-sidebar gap-0 px-1 py-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarMenu>
          {NAV.map((entry) => {
            // Item direto
            if (!entry.children) {
              if (!canAccess(entry.module!)) return null;
              const active = isActive(entry.href!, entry.exact);
              return (
                <SidebarMenuItem key={entry.label}>
                  <SidebarMenuButton asChild isActive={active} tooltip={entry.label}>
                    <Link to={entry.href!} className={itemClass(active)}>
                      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[hsl(48,100%,50%)]" />}
                      <entry.icon className="w-4 h-4 shrink-0" />
                      <span>{entry.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Menu com submenu
            const visible = entry.children.filter((i) => canAccess(i.module));
            if (visible.length === 0) return null;
            const groupActive = visible.some((i) => isActive(i.href, i.exact));
            return (
              <Collapsible key={entry.label} defaultOpen={groupActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={entry.label}
                      className={itemClass(groupActive && collapsed)}
                    >
                      <entry.icon className="w-4 h-4 shrink-0" />
                      <span>{entry.label}</span>
                      <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-white/15">
                      {visible.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={active}>
                              <Link to={item.href} className={itemClass(active)}>
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border/40">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10 transition-colors"
          title={collapsed ? "Expandir menu" : "Reduzir menu"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4 shrink-0" /> : <PanelLeftClose className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>Reduzir menu</span>}
        </button>
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/50 px-3 pb-2">
            © {new Date().getFullYear()} Sinos Imóveis · v2.0
          </p>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
