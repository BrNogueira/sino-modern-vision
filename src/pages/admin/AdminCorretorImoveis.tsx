import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Building2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const AdminCorretorImoveis = () => {
  const { properties } = useAdminProperties();

  const ativos = properties.filter((p) => p.ativo);
  const inativos = properties.filter((p) => !p.ativo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Meus Imóveis
        </h1>
        <p className="text-sm text-muted-foreground">Imóveis vinculados ao seu cadastro</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{ativos.length}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <EyeOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold text-foreground">{inativos.length}</p>
            <p className="text-xs text-muted-foreground">Inativos</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Listagem</h2>
        {properties.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum imóvel cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
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
        )}
      </div>
    </div>
  );
};

export default AdminCorretorImoveis;
