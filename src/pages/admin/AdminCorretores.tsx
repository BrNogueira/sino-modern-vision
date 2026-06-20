import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Loader2, Phone, Mail, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SortableHead } from "@/components/admin/SortableHead";
import { useTableSort, type SortAccessors } from "@/hooks/useTableSort";

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

type CorretorRow = CorretorInfo & { roles: string[] };
type CorretorSortKey = "full_name" | "creci";
const CORRETOR_SORT: SortAccessors<CorretorRow, CorretorSortKey> = {
  full_name: (c) => c.full_name?.toLowerCase(),
  creci: (c) => c.creci?.toLowerCase(),
};

const AdminCorretores = () => {
  const { hasRole } = useAdminAuth();
  const [corretores, setCorretores] = useState<CorretorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = corretores.filter((c) => {
    const t = search.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(t) ||
      (c.email || "").toLowerCase().includes(t) ||
      (c.creci || "").toLowerCase().includes(t)
    );
  });
  const { sort, toggle, sorted } = useTableSort(filtered, CORRETOR_SORT, { key: "full_name", dir: "asc" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corretores"
        description={`${corretores.length} ${corretores.length === 1 ? "profissional ativo" : "profissionais ativos"} na equipe`}
        icon={Users}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou CRECI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full md:w-72"
            />
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
        {/* Desktop: table */}
        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Nome" sortKey="full_name" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <TableHead>Contato</TableHead>
                <SortableHead label="CRECI" sortKey="creci" activeKey={sort.key} dir={sort.dir} onSort={toggle} />
                <TableHead>Perfis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(c => (
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
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum corretor encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {sorted.length === 0 ? (
            <div className="bg-card border border-border rounded-xl text-center text-muted-foreground py-8">
              Nenhum corretor encontrado.
            </div>
          ) : (
            sorted.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{c.full_name}</p>
                    {c.creci && <p className="text-xs text-muted-foreground">CRECI: {c.creci}</p>}
                  </div>
                  <Badge variant="default" className="text-xs shrink-0">Ativo</Badge>
                </div>
                {(c.phone || c.email) && (
                  <div className="space-y-1">
                    {c.phone && <p className="text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />{c.phone}</p>}
                    {c.email && <p className="text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="truncate">{c.email}</span></p>}
                  </div>
                )}
                {c.roles.length > 0 && (
                  <div className="flex gap-1 flex-wrap border-t border-border pt-3">
                    {c.roles.map(r => <Badge key={r} variant="secondary" className="text-xs">{ROLE_LABELS[r] || r}</Badge>)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default AdminCorretores;
