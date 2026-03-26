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
} from "lucide-react";
import logoSinos from "@/assets/logo-sinos-imoveis.png";
import { useState } from "react";

const navItems = [
  { label: "Painel", href: "/admin", icon: LayoutDashboard },
  { label: "Imóveis", href: "/admin/imoveis", icon: Building2 },
  { label: "Agenciamentos", href: "/admin/corretor/agenciamentos", icon: Briefcase },
  { label: "Pré Cadastros", href: "/admin/corretor/pre-cadastros", icon: FileText },
  { label: "Mapa", href: "/admin/corretor/mapa", icon: Map },
  { label: "Pesquisar", href: "/admin/corretor/pesquisar", icon: Search },
  { label: "Meu Cadastro", href: "/admin/corretor", icon: UserCircle },
  { label: "Agenda", href: "/admin/corretor/agenda", icon: Calendar },
  { label: "Cadastrar Proprietário", href: "/admin/corretor/proprietario", icon: UserPlus },
  { label: "Cadastrar Cliente", href: "/admin/corretor/cliente", icon: Users },
  { label: "Cadastrar Imóvel", href: "/admin/imoveis/novo", icon: Home },
];

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

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

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
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
          <h2 className="text-lg font-semibold text-foreground">
            Painel Administrativo
          </h2>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
