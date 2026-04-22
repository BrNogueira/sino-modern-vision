import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Building2,
  Plus,
  TrendingUp,
  Eye,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { properties } = useAdminProperties();
  const { profile, canAccess } = useAdminAuth();

  const totalAtivos = properties.filter((p) => p.ativo).length;
  const totalVenda = properties.filter((p) => p.precoVenda !== null).length;
  const totalAluguel = properties.filter((p) => p.precoAluguel !== null).length;
  const totalDestaques = properties.filter((p) => p.destaque).length;

  const stats = [
    {
      label: "Total de Imóveis",
      value: properties.length,
      icon: Building2,
      trend: "+12%",
      trendUp: true,
      gradient: "from-emerald-500/10 to-emerald-500/0",
      iconBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Imóveis Ativos",
      value: totalAtivos,
      icon: Activity,
      trend: `${properties.length ? Math.round((totalAtivos / properties.length) * 100) : 0}%`,
      trendUp: true,
      gradient: "from-blue-500/10 to-blue-500/0",
      iconBg: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "À Venda",
      value: totalVenda,
      icon: DollarSign,
      trend: "+5",
      trendUp: true,
      gradient: "from-amber-500/10 to-amber-500/0",
      iconBg: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Para Alugar",
      value: totalAluguel,
      icon: Home,
      trend: "+3",
      trendUp: true,
      gradient: "from-purple-500/10 to-purple-500/0",
      iconBg: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Em Destaque",
      value: totalDestaques,
      icon: Star,
      trend: "★",
      trendUp: true,
      gradient: "from-yellow-500/10 to-yellow-500/0",
      iconBg: "bg-yellow-500/10 text-yellow-600",
    },
  ];

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
        description="Visão geral do sistema. Tudo o que importa em um só lugar."
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
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 pointer-events-none`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={`rounded-xl p-2 ${stat.iconBg}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 bg-background/80 backdrop-blur">
                  {stat.trend}
                </Badge>
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
          {properties.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum imóvel cadastrado ainda</p>
              {canAccess("imoveis") && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/admin/imoveis/novo">
                    <Plus className="w-4 h-4 mr-1" />
                    Cadastrar primeiro imóvel
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            properties.slice(0, 5).map((p) => (
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
                      {p.tituloImovel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.codigoImovel} · {p.cidade}/{p.estado}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3 flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.precoVenda
                        ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
                        : p.precoAluguel
                        ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
                        : "—"}
                    </p>
                    <Badge
                      variant={p.ativo ? "default" : "secondary"}
                      className="text-[9px] h-4 mt-0.5"
                    >
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
