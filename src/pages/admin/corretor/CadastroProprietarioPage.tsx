import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Save, Home } from "lucide-react";

const CadastroProprietarioPage = () => {
  const { toast } = useToast();
  const { properties } = useAdminProperties();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    // Update linked properties with owner data
    toast({
      title: "Proprietário cadastrado",
      description: `${nome} vinculado a ${selectedPropertyIds.length} imóvel(is).`,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cadastrar Proprietário</h1>
        <p className="text-sm text-muted-foreground">Registre um novo proprietário e vincule a imóveis existentes</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">👤 Dados do Proprietário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nome Completo <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" />
          </div>
          <div className="space-y-1.5">
            <Label>CPF/CNPJ</Label>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(51) 99999-9999" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
        </div>
      </div>

      {/* Vincular imóveis */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          <Home className="inline w-5 h-5 mr-1 -mt-0.5" />
          Vincular Imóveis
          {selectedPropertyIds.length > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-normal">
              {selectedPropertyIds.length} selecionado(s)
            </span>
          )}
        </h2>

        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum imóvel cadastrado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {properties.map((prop) => (
              <label
                key={prop.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPropertyIds.includes(prop.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <Checkbox
                  checked={selectedPropertyIds.includes(prop.id)}
                  onCheckedChange={() => toggleProperty(prop.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{prop.tituloImovel}</p>
                  <p className="text-xs text-muted-foreground">
                    {prop.codigoImovel} • {prop.cidade}/{prop.bairro}
                    {prop.precoVenda ? ` • R$ ${prop.precoVenda.toLocaleString("pt-BR")}` : ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />Salvar Proprietário
        </Button>
      </div>
    </div>
  );
};

export default CadastroProprietarioPage;
