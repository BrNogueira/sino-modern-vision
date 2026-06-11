import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const CadastroClientePage = () => {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [interesse, setInteresse] = useState("");

  const handleSave = () => {
    toast({ title: "Cliente cadastrado", description: `${nome || "Novo cliente"} salvo com sucesso.` });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cadastrar Cliente</h1>
        <p className="text-sm text-muted-foreground">Registre um novo cliente interessado</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nome Completo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CPF</Label><Input value={cpf} onChange={(e) => setCpf(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="md:col-span-2 space-y-1.5"><Label>Interesse</Label><Input value={interesse} onChange={(e) => setInteresse(e.target.value)} placeholder="Ex: Casa 3 quartos em São Leopoldo" /></div>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Salvar</Button>
      </div>
    </div>
  );
};

export default CadastroClientePage;
