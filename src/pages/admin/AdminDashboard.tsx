import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Building2,
  Plus,
  TrendingUp,
  Star,
  Users,
  Calendar,
  FileText,
  ArrowUpRight,
  Sparkles,
  Activity,
  Home,
  DollarSign,
  Building,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/integrations/api/client";

type TrendTone = "up" | "flat" | "down";
type StatCard = {
  label: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  trendTone: TrendTone;
  gradient: string;
  iconBg: string;
};

// Contraste forte em light/dark: verde=alta, amarelo=estável, vermelho=baixa.
const TREND_TONE: Record<TrendTone, string> = {
  up: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  flat: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  down: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

// Retorno do endpoint /api/admin/dashboard-stats (agregado leve, sem fotos).
type StatVal = { value: number; current: number; previous: number; pct: number };
type RecentImovel = {
  id: string;
  codigo_imovel: string | null;
  titulo_imovel: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: number;
  preco_venda: number | null;
  preco_aluguel: number | null;
  created_at: string;
};
type DashboardStats = {
  totals: {
    total: StatVal;
    ativos: StatVal;
    venda: StatVal;
    aluguel: StatVal;
    destaque: StatVal;
  };
  recent: RecentImovel[];
};

// % mês a mês → cor: alta=verde, queda=vermelho, estável=amarelo.
const toneFromPct = (pct: number): TrendTone => (pct > 0 ? "up" : pct < 0 ? "down" : "flat");
const trendLabel = (pct: number): string => `${pct > 0 ? "+" : ""}${pct}%`;

const AdminDashboard = () => {
  const { profile, canAccess } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .get<DashboardStats>("/api/admin/dashboard-stats")
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch((err) => console.error("Falha ao carregar dashboard-stats:", err));
    return () => {
      alive = false;
    };
  }, []);

  const t = stats?.totals;
  const card = (v: StatVal | undefined): { value: number; trend: string; trendTone: TrendTone } => ({
    value: v?.value ?? 0,
    trend: v ? trendLabel(v.pct) : "…",
    trendTone: v ? toneFromPct(v.pct) : "flat",
  });

  const statCards: StatCard[] = [
    { label: "Total de Imóveis", icon: Building2, ...card(t?.total), gradient: "from-emerald-500/10 to-emerald-500/0", iconBg: "bg-emerald-500/10 text-emerald-600" },
    { label: "Imóveis Ativos", icon: Activity, ...card(t?.ativos), gradient: "from-blue-500/10 to-blue-500/0", iconBg: "bg-blue-500/10 text-blue-600" },
    { label: "À Venda", icon: DollarSign, ...card(t?.venda), gradient: "from-amber-500/10 to-amber-500/0", iconBg: "bg-amber-500/10 text-amber-600" },
    { label: "Para Alugar", icon: Home, ...card(t?.aluguel), gradient: "from-purple-500/10 to-purple-500/0", iconBg: "bg-purple-500/10 text-purple-600" },
    { label: "Em Destaque", icon: Star, ...card(t?.destaque), gradient: "from-yellow-500/10 to-yellow-500/0", iconBg: "bg-yellow-500/10 text-yellow-600" },
  ];

  const recent = stats?.recent ?? [];

  const quickActions = [
    { label: "Gerenciar Imóveis", description: "Cadastrar, editar e publicar", icon: Building2, href: "/admin/imoveis", module: "imoveis" },
    { label: "Leads & Contatos", description: "Funil de vendas e atendimento", icon: TrendingUp, href: "/admin/leads", module: "leads" },
    { label: "Agenda", description: "Visitas e compromissos", icon: Calendar, href: "/admin/agenda", module: "agenda" },
    { label: "Relatórios", description: "Métricas e indicadores", icon: FileText, href: "/admin/relatorios", module: "relatorios" },
    { label: "Condomínios", description: "Centralizar dados de prédios", icon: Building, href: "/admin/condominios", module: "condominios" },
    { label: "Equipe", description: "Corretores e usuários", icon: Users, href: "/admin/corretores", module: "corretores" },
  ];

  const visibleActions = quickActions.filter((a) => canAccess(a.module));

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${profile?.full_name?.split(" ")[0] || "Usuário"} 👋`}
        description="Visão geral do sistema. Variação de novos cadastros no mês vs. mês anterior."
        icon={Sparkles}
        actions={
          canAccess("imoveis") && (
            <Button asChild size="lg" className="gap-2 shadow-sm">
              <Link to="/admin/imoveis/novo">
                <Plus className="w-4 h-4" />
                Novo Imóvel
              </Link>
            </Button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 pointer-events-none`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={`rounded-xl p-2 ${stat.iconBg}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span
                  title="Variação de novos cadastros: mês atual vs. mês anterior"
                  className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-bold ${TREND_TONE[stat.trendTone]}`}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleActions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-foreground mt-4">{action.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent properties */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Últimos imóveis cadastrados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Os 5 mais recentes do seu portfólio</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/admin/imoveis">
              Ver todos
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {stats ? "Nenhum imóvel cadastrado ainda" : "Carregando…"}
              </p>
              {stats && canAccess("imoveis") && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/admin/imoveis/novo">
                    <Plus className="w-4 h-4 mr-1" />
                    Cadastrar primeiro imóvel
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            recent.map((p) => (
              <Link
                key={p.id}
                to={`/admin/imoveis/editar/${p.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {p.titulo_imovel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.codigo_imovel} · {p.cidade}/{p.estado}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3 flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.preco_venda
                        ? `R$ ${p.preco_venda.toLocaleString("pt-BR")}`
                        : p.preco_aluguel
                        ? `R$ ${p.preco_aluguel.toLocaleString("pt-BR")}/mês`
                        : "—"}
                    </p>
                    <Badge variant={p.ativo ? "default" : "secondary"} className="text-[9px] h-4 mt-0.5">
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
