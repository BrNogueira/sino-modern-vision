import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, User, Command, ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { openAdminPalette } from "./AdminCommandPalette";

export function AdminHeader() {
  const { profile, roles, logout } = useAdminAuth();
  const navigate = useNavigate();

  const initials = (profile?.full_name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center gap-3 px-3 md:px-6">
      <SidebarTrigger className="text-foreground" />
      <Separator orientation="vertical" className="h-6 hidden md:block" />

      <button
        onClick={openAdminPalette}
        className="group flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm w-full max-w-md"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar páginas, imóveis...</span>
        <span className="sm:hidden">Buscar</span>
        <kbd className="ml-auto hidden md:inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <div className="flex-1" />

      <Button asChild variant="ghost" size="sm" className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground">
        <a href="/" target="_blank" rel="noreferrer">
          <ExternalLink className="w-4 h-4" />
          Ver site
        </a>
      </Button>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(48,100%,50%)] ring-2 ring-card" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-muted/60 rounded-lg pl-1 pr-2 py-1 transition-colors">
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                {profile?.full_name || "Usuário"}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {roles[0] || "Sem perfil"}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold">{profile?.full_name}</span>
            <span className="text-xs text-muted-foreground font-normal">{profile?.email}</span>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {roles.map((r) => (
                <Badge key={r} variant="secondary" className="text-[9px] h-4">{r}</Badge>
              ))}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/admin/corretor")}>
            <User className="mr-2 h-4 w-4" /> Meu cadastro
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/configuracoes")}>
            <Command className="mr-2 h-4 w-4" /> Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
