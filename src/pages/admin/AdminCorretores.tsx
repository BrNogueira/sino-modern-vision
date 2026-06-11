import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Loader2, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

interface CorretorInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  creci: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador", gerente: "Gerente", corretor: "Corretor", financeiro: "Financeiro",
};

const AdminCorretores = () => {
  const { hasRole } = useAdminAuth();
  const [corretores, setCorretores] = useState<(CorretorInfo & { roles: string[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: profiles } = await supabase.from("profiles").select("*").eq("active", true).order("full_name");
      const { data: allRoles } = await supabase.from("user_roles").select("*");

      const result = (profiles || [])
        .map((p: any) => {
          const roles = (allRoles || []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role);
          return { ...p, roles };
        })
        .filter((p: any) => p.roles.includes("corretor") || p.roles.includes("gerente"));
      
      setCorretores(result);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corretores"
        description={`${corretores.length} ${corretores.length === 1 ? "profissional ativo" : "profissionais ativos"} na equipe`}
        icon={Users}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CRECI</TableHead>
                <TableHead>Perfis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corretores.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {c.phone && <p className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                      {c.email && <p className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.creci || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.roles.map(r => <Badge key={r} variant="secondary" className="text-xs">{ROLE_LABELS[r] || r}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="text-xs">Ativo</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {corretores.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum corretor cadastrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCorretores;
