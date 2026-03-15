import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, User } from "lucide-react";

interface CorretorData {
  nomeCompleto: string;
  creci: string;
  cpf: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  especialidade: string;
  bio: string;
}

const initialData: CorretorData = {
  nomeCompleto: "Administrador Sinos",
  creci: "12345-RS",
  cpf: "000.000.000-00",
  email: "admin@sinosimoveis.com.br",
  telefone: "(51) 3333-4444",
  celular: "(51) 99999-8888",
  endereco: "Rua Principal, 100",
  cidade: "São Leopoldo",
  estado: "RS",
  cep: "93000-000",
  especialidade: "Residencial e Comercial",
  bio: "Corretor especializado em imóveis na região do Vale dos Sinos.",
};

const AdminCorretorProfile = () => {
  const [data, setData] = useState<CorretorData>(initialData);
  const { toast } = useToast();

  const handleChange = (field: keyof CorretorData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({ title: "Cadastro salvo", description: "Dados do corretor atualizados com sucesso." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <User className="w-6 h-6" />
            Meu Cadastro
          </h1>
          <p className="text-sm text-muted-foreground">Edite seus dados de corretor</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Dados Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nome Completo</Label>
            <Input value={data.nomeCompleto} onChange={(e) => handleChange("nomeCompleto", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>CRECI</Label>
            <Input value={data.creci} onChange={(e) => handleChange("creci", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>CPF</Label>
            <Input value={data.cpf} onChange={(e) => handleChange("cpf", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={data.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={data.telefone} onChange={(e) => handleChange("telefone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Celular</Label>
            <Input value={data.celular} onChange={(e) => handleChange("celular", e.target.value)} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">Endereço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Endereço</Label>
            <Input value={data.endereco} onChange={(e) => handleChange("endereco", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Input value={data.cidade} onChange={(e) => handleChange("cidade", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Input value={data.estado} onChange={(e) => handleChange("estado", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>CEP</Label>
            <Input value={data.cep} onChange={(e) => handleChange("cep", e.target.value)} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">Profissional</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Input value={data.especialidade} onChange={(e) => handleChange("especialidade", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Bio / Apresentação</Label>
            <Textarea rows={4} value={data.bio} onChange={(e) => handleChange("bio", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCorretorProfile;
