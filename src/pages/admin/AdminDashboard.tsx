import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Building2, Plus, TrendingUp, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { properties } = useAdminProperties();

  const totalAtivos = properties.filter((p) => p.ativo).length;
  const totalVenda = properties.filter((p) => p.precoVenda !== null).length;
  const totalAluguel = properties.filter((p) => p.precoAluguel !== null).length;
  const totalDestaques = properties.filter((p) => p.destaque).length;

  const stats = [
    { label: "Total de Imóveis", value: properties.length, icon: Building2, color: "text-primary" },
    { label: "Ativos", value: totalAtivos, icon: Eye, color: "text-primary" },
    { label: "Venda", value: totalVenda, icon: TrendingUp, color: "text-primary" },
    { label: "Aluguel", value: totalAluguel, icon: TrendingUp, color: "text-primary" },
    { label: "Destaques", value: totalDestaques, icon: Star, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral dos imóveis cadastrados</p>
        </div>
        <Button asChild>
          <Link to="/admin/imoveis/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Últimos imóveis cadastrados</h2>
        <div className="space-y-3">
          {properties.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              to={`/admin/imoveis/editar/${p.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground text-sm">{p.tituloImovel}</p>
                <p className="text-xs text-muted-foreground">
                  {p.codigoImovel} • {p.cidade}/{p.estado}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {p.precoVenda
                    ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
                    : p.precoAluguel
                    ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
                    : "—"}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
