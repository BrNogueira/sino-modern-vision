import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth, AppRole } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, ArrowLeft, Shield } from "lucide-react";

const ALL_ROLES: AppRole[] = ["admin", "corretor", "financeiro", "gerente"];
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  corretor: "Corretor",
  financeiro: "Financeiro",
};

const AdminUserCreate = () => {
  const { hasRole } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    creci: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>(["corretor"]);

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    
    if (formData.password.length < 8) {
      toast({ title: "Erro", description: "Senha deve ter ao menos 8 caracteres.", variant: "destructive" });
      return;
    }

    if (selectedRoles.length === 0) {
      toast({ title: "Erro", description: "Selecione ao menos um perfil de acesso.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.name.trim(),
          roles: selectedRoles,
          phone: formData.phone,
          creci: formData.creci,
        },
      });

      if (error || (data && (data as any).error)) {
        const msg = (data as any)?.error || error?.message || "Erro ao criar usuário";
        toast({ title: "Erro ao criar usuário", description: msg, variant: "destructive" });
      } else {
        toast({ title: "Usuário criado", description: `${formData.name} criado com sucesso.` });
        navigate("/admin/usuarios");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/usuarios")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cadastrar Novo Usuário</h1>
          <p className="text-sm text-muted-foreground">Adicione um novo membro à equipe com perfis de acesso específicos.</p>
        </div>
      </div>

      <form onSubmit={handleCreateUser}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>Dados básicos e credenciais de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input 
                  id="name"
                  placeholder="Ex: João Silva" 
                  value={formData.name} 
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="joao@exemplo.com"
                  value={formData.email} 
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha Temporária *</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone} 
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                />
              </div>
            </div>

            {selectedRoles.includes("corretor") && (
              <div className="space-y-1.5">
                <Label htmlFor="creci">CRECI</Label>
                <Input 
                  id="creci"
                  placeholder="Ex: 12345-F"
                  value={formData.creci} 
                  onChange={e => setFormData(prev => ({ ...prev, creci: e.target.value }))} 
                />
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Label>Perfis de Acesso</Label>
              <div className="grid grid-cols-2 gap-3">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2 text-sm p-2 border rounded-md cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    {ROLE_LABELS[role]}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando Usuário...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AdminUserCreate;