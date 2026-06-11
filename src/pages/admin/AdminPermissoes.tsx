import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth, AppRole } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Permission {
  id: string;
  role: AppRole;
  module: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const ALL_ROLES: AppRole[] = ["admin", "corretor", "financeiro", "gerente"];
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  corretor: "Corretor",
  financeiro: "Financeiro",
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  imoveis: "Imóveis",
  usuarios: "Usuários",
  condominios: "Condomínios",
  leads: "Leads & Contatos",
  agenda: "Agenda",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  canal_pro: "Canal Pro",
  corretores: "Corretores",
  financeiro: "Financeiro",
};

const AdminPermissoes = () => {
  const { hasRole } = useAdminAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("admin");

  const fetchPermissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("role_permissions")
      .select("*")
      .order("module");
    setPermissions((data as Permission[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleToggle = (id: string, field: "can_view" | "can_edit" | "can_delete") => {
    setPermissions(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: !p[field] } : p)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const rolePerms = permissions.filter(p => p.role === activeTab);
    
    for (const perm of rolePerms) {
      await supabase
        .from("role_permissions")
        .update({
          can_view: perm.can_view,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
        })
        .eq("id", perm.id);
    }

    toast({ title: "Permissões salvas", description: `Permissões do perfil ${ROLE_LABELS[activeTab]} atualizadas.` });
    setSaving(false);
  };

  if (!hasRole("admin")) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
        <p className="text-muted-foreground text-sm mt-2">Apenas administradores podem gerenciar permissões.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Controle de Permissões</h1>
          <p className="text-sm text-muted-foreground">Defina o que cada perfil pode visualizar, editar e excluir</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          {ALL_ROLES.map(role => (
            <TabsTrigger key={role} value={role}>{ROLE_LABELS[role]}</TabsTrigger>
          ))}
        </TabsList>

        {ALL_ROLES.map(role => {
          const rolePerms = permissions.filter(p => p.role === role);
          return (
            <TabsContent key={role} value={role}>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/30">
                  <span className="text-sm font-semibold text-foreground">Módulo</span>
                  <span className="text-sm font-semibold text-center text-foreground">Visualizar</span>
                  <span className="text-sm font-semibold text-center text-foreground">Editar</span>
                  <span className="text-sm font-semibold text-center text-foreground">Excluir</span>
                </div>
                {rolePerms.map(perm => (
                  <div key={perm.id} className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/20">
                    <span className="text-sm text-foreground">
                      {MODULE_LABELS[perm.module] || perm.module}
                    </span>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={perm.can_view}
                        onCheckedChange={() => handleToggle(perm.id, "can_view")}
                        disabled={role === "admin"}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={perm.can_edit}
                        onCheckedChange={() => handleToggle(perm.id, "can_edit")}
                        disabled={role === "admin"}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={perm.can_delete}
                        onCheckedChange={() => handleToggle(perm.id, "can_delete")}
                        disabled={role === "admin"}
                      />
                    </div>
                  </div>
                ))}
                {rolePerms.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Nenhuma permissão configurada para este perfil.
                  </div>
                )}
              </div>
              {role === "admin" && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ O perfil Administrador tem acesso total e não pode ser editado.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AdminPermissoes;
