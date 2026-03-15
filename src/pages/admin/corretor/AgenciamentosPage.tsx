import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const AdminCorretorAgenciamentos = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Agenciamentos</h1>
      <p className="text-sm text-muted-foreground">Imóveis agenciados pelo corretor</p>
    </div>
    <div className="bg-card border border-border rounded-xl p-6">
      <p className="text-muted-foreground text-sm">Nenhum agenciamento registrado.</p>
    </div>
  </div>
);

export default AdminCorretorAgenciamentos;
