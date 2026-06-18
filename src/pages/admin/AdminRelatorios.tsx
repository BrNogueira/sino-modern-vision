import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Building2, TrendingUp, Eye, Star, Users, DollarSign } from "lucide-react";

const COLORS = ["hsl(147, 82%, 23%)", "hsl(48, 100%, 50%)", "hsl(200, 80%, 50%)", "hsl(340, 70%, 50%)", "hsl(270, 60%, 55%)"];

const AdminRelatorios = () => {
  const { properties } = useAdminProperties();
  const { canAccess } = useAdminAuth();

  const totalAtivos = properties.filter(p => p.ativo).length;
  const totalInativos = properties.filter(p => !p.ativo).length;
  const totalVenda = properties.filter(p => p.precoVenda !== null).length;
  const totalAluguel = properties.filter(p => p.precoAluguel !== null).length;
  const totalDestaques = properties.filter(p => p.destaque).length;
  const totalExclusivos = properties.filter(p => p.exclusivo).length;

  const avgPrecoVenda = properties.filter(p => p.precoVenda).reduce((a, b) => a + (b.precoVenda || 0), 0) / (totalVenda || 1);
  const avgPrecoAluguel = properties.filter(p => p.precoAluguel).reduce((a, b) => a + (b.precoAluguel || 0), 0) / (totalAluguel || 1);

  // By type
  const typeCount = properties.reduce((acc, p) => {
    acc[p.tipoImovel] = (acc[p.tipoImovel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

  // By city
  const cityCount = properties.reduce((acc, p) => {
    acc[p.cidade] = (acc[p.cidade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const cityData = Object.entries(cityCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // By rooms
  const roomsData = [1, 2, 3, 4, 5].map(n => ({
    name: `${n}+ dorm`,
    value: properties.filter(p => p.qtdDormitorios >= n).length,
  }));

  const stats = [
    { label: "Total Imóveis", value: properties.length, icon: Building2 },
    { label: "Ativos", value: totalAtivos, icon: Eye },
    { label: "Venda", value: totalVenda, icon: TrendingUp },
    { label: "Aluguel", value: totalAluguel, icon: DollarSign },
    { label: "Destaques", value: totalDestaques, icon: Star },
    { label: "Exclusivos", value: totalExclusivos, icon: Users },
  ];

  const ofertaData = [
    { name: "Venda", value: totalVenda },
    { name: "Aluguel", value: totalAluguel },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Relatórios & Métricas</h1>
        <p className="text-sm text-muted-foreground">Visão analítica dos imóveis e operações</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Price averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Preço Médio de Venda</p>
          <p className="text-2xl md:text-3xl font-bold text-primary">R$ {avgPrecoVenda.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Aluguel Médio</p>
          <p className="text-2xl md:text-3xl font-bold text-primary">R$ {avgPrecoAluguel.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By city */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Imóveis por Cidade</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 85%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(147, 82%, 23%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By type pie */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Venda vs Aluguel */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Venda vs Aluguel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ofertaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                <Cell fill="hsl(147, 82%, 23%)" />
                <Cell fill="hsl(48, 100%, 50%)" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By rooms */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Por Dormitórios</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roomsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 85%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorios;
