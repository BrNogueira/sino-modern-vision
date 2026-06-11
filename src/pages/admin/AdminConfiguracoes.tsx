import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Shield } from "lucide-react";

const AdminConfiguracoes = () => {
  const { hasRole } = useAdminAuth();
  const { toast } = useToast();
  
  const [config, setConfig] = useState({
    nomeEmpresa: "Sinos Imóveis",
    telefone: "(51) 3596-1446",
    celular: "(51) 99595-1446",
    email: "atendimento@sinosimoveis.com.br",
    endereco: "Rua João Aloisio Algayer, 1565 - Lomba Grande/NH",
    creci: "23250",
    horarioSemana: "8h30 às 12h e das 13h30 às 18h",
    horarioSabado: "8h30 às 12h",
    whatsappNumero: "5551995951446",
    notificacaoEmail: true,
    notificacaoWhatsapp: true,
    autoPublicar: false,
    marcaDagua: true,
  });

  const handleSave = () => {
    toast({ title: "Configurações salvas", description: "As configurações foram atualizadas." });
  };

  if (!hasRole("admin")) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
        <p className="text-muted-foreground text-sm mt-2">Apenas administradores podem acessar configurações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />Configurações
          </h1>
          <p className="text-sm text-muted-foreground">Configurações gerais do sistema</p>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Salvar</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Dados da Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5"><Label>Nome da Empresa</Label><Input value={config.nomeEmpresa} onChange={e => setConfig(p => ({ ...p, nomeEmpresa: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Telefone</Label><Input value={config.telefone} onChange={e => setConfig(p => ({ ...p, telefone: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Celular/WhatsApp</Label><Input value={config.celular} onChange={e => setConfig(p => ({ ...p, celular: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input value={config.email} onChange={e => setConfig(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>CRECI</Label><Input value={config.creci} onChange={e => setConfig(p => ({ ...p, creci: e.target.value }))} /></div>
          <div className="md:col-span-2 space-y-1.5"><Label>Endereço</Label><Input value={config.endereco} onChange={e => setConfig(p => ({ ...p, endereco: e.target.value }))} /></div>
        </div>

        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">Horário de Atendimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Seg à Sexta</Label><Input value={config.horarioSemana} onChange={e => setConfig(p => ({ ...p, horarioSemana: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Sábados</Label><Input value={config.horarioSabado} onChange={e => setConfig(p => ({ ...p, horarioSabado: e.target.value }))} /></div>
        </div>

        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">Notificações & Automação</h2>
        <div className="space-y-4">
          {[
            { key: "notificacaoEmail", label: "Notificação por E-mail", desc: "Receber notificações de novos leads por e-mail" },
            { key: "notificacaoWhatsapp", label: "Notificação por WhatsApp", desc: "Receber alertas via WhatsApp" },
            { key: "autoPublicar", label: "Auto Publicar Imóveis", desc: "Publicar automaticamente imóveis ao cadastrar" },
            { key: "marcaDagua", label: "Marca D'água nas Fotos", desc: "Adicionar marca d'água automaticamente nas fotos" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={(config as any)[item.key]}
                onCheckedChange={v => setConfig(p => ({ ...p, [item.key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracoes;
