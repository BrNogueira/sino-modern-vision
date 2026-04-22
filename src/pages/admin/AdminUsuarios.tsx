import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth, AppRole } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
  roles: AppRole[];
}

const ALL_ROLES: AppRole[] = ["admin", "corretor", "financeiro", "gerente"];
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  corretor: "Corretor",
  financeiro: "Financeiro",
};

const AdminUsuarios = () => {
  const { hasRole } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);


  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("full_name");
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    const usersWithRoles: UserWithRoles[] = (profiles || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone || "",
      active: p.active,
      roles: (allRoles || [])
        .filter((r: any) => r.user_id === p.id)
        .map((r: any) => r.role as AppRole),
    }));
    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEditRoles = (user: UserWithRoles) => {
    setEditUser(user);
    setSelectedRoles([...user.roles]);
    setDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!editUser) return;

    // Remove all current roles
    await supabase.from("user_roles").delete().eq("user_id", editUser.id);

    // Add selected roles
    if (selectedRoles.length > 0) {
      await supabase.from("user_roles").insert(
        selectedRoles.map(role => ({ user_id: editUser.id, role }))
      );
    }

    toast({ title: "Perfis atualizados", description: `Perfis de ${editUser.full_name} atualizados.` });
    setDialogOpen(false);
    fetchUsers();
  };

  const handleToggleActive = async (user: UserWithRoles) => {
    await supabase.from("profiles").update({ active: !user.active }).eq("id", user.id);
    toast({ title: user.active ? "Usuário desativado" : "Usuário ativado" });
    fetchUsers();
  };


  const toggleRole = (role: AppRole, list: AppRole[], setList: (v: AppRole[]) => void) => {
    setList(list.includes(role) ? list.filter(r => r !== role) : [...list, role]);
  };

  if (!hasRole("admin")) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
        <p className="text-muted-foreground text-sm mt-2">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Usuários"
        description="Gerencie usuários do sistema e seus perfis de acesso"
        icon={Shield}
        actions={
          <Button size="lg" className="gap-2" onClick={() => navigate("/admin/usuarios/novo")}>
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length > 0 ? user.roles.map(r => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {ROLE_LABELS[r]}
                        </Badge>
                      )) : (
                        <span className="text-xs text-muted-foreground">Sem perfil</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "outline"} className="text-xs">
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleEditRoles(user)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleActive(user)}>
                        {user.active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit roles dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfis — {editUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              {ALL_ROLES.map(role => (
                <label key={role} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => toggleRole(role, selectedRoles, setSelectedRoles)}
                  />
                  <div>
                    <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button onClick={handleSaveRoles} className="w-full">Salvar Perfis</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
