import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const CadastroProprietarioPage = () => {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    toast({ title: "Proprietário cadastrado", description: `${nome || "Novo proprietário"} salvo com sucesso.` });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cadastrar Proprietário</h1>
        <p className="text-sm text-muted-foreground">Registre um novo proprietário de imóvel</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nome Completo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CPF</Label><Input value={cpf} onChange={(e) => setCpf(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Salvar</Button>
      </div>
    </div>
  );
};

export default CadastroProprietarioPage;
