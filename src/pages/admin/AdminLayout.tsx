import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCircle,
  Home,
  Briefcase,
  FileText,
  Map,
  Search,
  Calendar,
  UserPlus,
  Users,
  Radio,
  Settings,
  Shield,
  Bell,
  TrendingUp,
  Building,
  Loader2,
} from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  module: string;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, module: "dashboard" },
  { label: "Imóveis", href: "/admin/imoveis", icon: Building2, module: "imoveis" },
  { label: "Cadastrar Imóvel", href: "/admin/imoveis/novo", icon: Home, module: "imoveis" },
  { label: "Corretores", href: "/admin/corretores", icon: Users, module: "corretores" },
  { label: "Condomínios", href: "/admin/condominios", icon: Building, module: "condominios" },
  { label: "Leads & Contatos", href: "/admin/leads", icon: TrendingUp, module: "leads" },
  { label: "Agenda", href: "/admin/agenda", icon: Calendar, module: "agenda" },
  { label: "Relatórios", href: "/admin/relatorios", icon: FileText, module: "relatorios" },
  { label: "Usuários", href: "/admin/usuarios", icon: Shield, module: "usuarios" },
  { label: "Permissões", href: "/admin/permissoes", icon: Settings, module: "usuarios" },
  { label: "Canal Pro", href: "/admin/canal-pro", icon: Radio, module: "canal_pro" },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings, module: "configuracoes" },
];

const corretorNavItems: NavItem[] = [
  { label: "Meus Imóveis", href: "/admin/corretor/imoveis", icon: Building2, module: "imoveis" },
  { label: "Agenciamentos", href: "/admin/corretor/agenciamentos", icon: Briefcase, module: "imoveis" },
  { label: "Pré Cadastros", href: "/admin/corretor/pre-cadastros", icon: FileText, module: "imoveis" },
  { label: "Mapa", href: "/admin/corretor/mapa", icon: Map, module: "imoveis" },
  { label: "Pesquisar", href: "/admin/corretor/pesquisar", icon: Search, module: "imoveis" },
  { label: "Meu Cadastro", href: "/admin/corretor", icon: UserCircle, module: "imoveis" },
  { label: "Cadastrar Proprietário", href: "/admin/corretor/proprietario", icon: UserPlus, module: "imoveis" },
  { label: "Cadastrar Cliente", href: "/admin/corretor/cliente", icon: Users, module: "leads" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  corretor: "Corretor",
  financeiro: "Financeiro",
};

const AdminLayout = () => {
  const { isAuthenticated, isLoading, logout, profile, roles, canAccess } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const visibleNavItems = allNavItems.filter(item => canAccess(item.module));
  const visibleCorretorItems = roles.includes("corretor") || roles.includes("admin") || roles.includes("gerente")
    ? corretorNavItems.filter(item => canAccess(item.module))
    : [];

  const primaryRole = roles[0] || "corretor";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logoSinos} alt="Sinos Imóveis" className="h-10 w-auto" />
              <span className="text-sm font-semibold">Admin</span>
            </Link>
            <button
              className="md:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-3 border-b border-sidebar-border">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "Usuário"}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {roles.map(r => (
                <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {ROLE_LABELS[r] || r}
                </Badge>
              ))}
              {roles.length === 0 && (
                <span className="text-[10px] text-sidebar-foreground/50">Sem perfil atribuído</span>
              )}
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {/* Main nav */}
            {visibleNavItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 px-3 py-1">
                  Geral
                </p>
                {visibleNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Corretor section */}
            {visibleCorretorItems.length > 0 && (
              <div className="space-y-1 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 px-3 py-1">
                  Área do Corretor
                </p>
                {visibleCorretorItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            className="md:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-foreground flex-1">
            Painel Administrativo
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {profile?.email}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
