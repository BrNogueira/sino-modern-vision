import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import {
  Save,
  Home,
  User,
  FileText,
  Phone,
  Mail,
  Search,
  X,
  Check,
  MapPin,
} from "lucide-react";

// Quantos imóveis mostrar antes de pedir uma busca (a base tem milhares).
const MAX_VISIVEL = 50;

const CadastroProprietarioPage = () => {
  const { toast } = useToast();
  const { properties, updateProperty } = useAdminProperties();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Imóveis selecionados (mostrados sempre, mesmo fora do filtro).
  const selecionados = useMemo(
    () => properties.filter((p) => selectedPropertyIds.includes(p.id)),
    [properties, selectedPropertyIds]
  );

  // Resultado da busca, já sem os que estão selecionados (eles aparecem no topo).
  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const base = properties.filter((p) => !selectedPropertyIds.includes(p.id));
    if (!termo) return base;
    return base.filter((p) =>
      [p.tituloImovel, p.codigoImovel, p.cidade, p.bairro, p.tipoImovel]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termo))
    );
  }, [properties, selectedPropertyIds, busca]);

  const visiveis = busca.trim() ? resultados : resultados.slice(0, MAX_VISIVEL);
  const ocultos = resultados.length - visiveis.length;

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    if (selectedPropertyIds.length === 0) {
      toast({
        title: "Selecione imóveis",
        description: "Vincule o proprietário a pelo menos um imóvel.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Grava os dados do proprietário em cada imóvel vinculado.
      await Promise.all(
        selectedPropertyIds.map((id) =>
          updateProperty(id, {
            proprietarioNome: nome.trim(),
            proprietarioDocumento: cpf.trim(),
            proprietarioTelefone: telefone.trim(),
            proprietarioEmail: email.trim(),
          }),
        ),
      );
      toast({
        title: "Proprietário cadastrado",
        description: `${nome} vinculado a ${selectedPropertyIds.length} imóvel(is).`,
      });
      setNome("");
      setCpf("");
      setTelefone("");
      setEmail("");
      setSelectedPropertyIds([]);
      setBusca("");
    } catch (err: unknown) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderLinha = (prop: (typeof properties)[number], selecionado: boolean) => (
    <label
      key={prop.id}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        selecionado
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      }`}
    >
      <Checkbox checked={selecionado} onCheckedChange={() => toggleProperty(prop.id)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{prop.tituloImovel}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
            {prop.codigoImovel}
          </span>
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {[prop.cidade, prop.bairro].filter(Boolean).join(" / ")}
          </span>
          {prop.precoVenda ? (
            <span className="ml-auto pl-2 font-medium text-foreground shrink-0">
              R$ {prop.precoVenda.toLocaleString("pt-BR")}
            </span>
          ) : null}
        </p>
      </div>
    </label>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cadastrar Proprietário</h1>
          <p className="text-sm text-muted-foreground">
            Registre um proprietário e vincule aos imóveis existentes
          </p>
        </div>
      </div>

      {/* Dados do proprietário */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Dados do Proprietário</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              CPF/CNPJ
            </Label>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              Telefone
            </Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(51) 99999-9999" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              E-mail
            </Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
        </div>
      </div>

      {/* Vincular imóveis */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Home className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Vincular Imóveis</h2>
          {selectedPropertyIds.length > 0 && (
            <span className="ml-auto bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
              {selectedPropertyIds.length} selecionado(s)
            </span>
          )}
        </div>

        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum imóvel cadastrado ainda.
          </p>
        ) : (
          <>
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, código, cidade ou bairro…"
                className="pl-9 pr-9"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selecionados (sempre visíveis) */}
            {selecionados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  Selecionados
                </p>
                <div className="space-y-2">
                  {selecionados.map((prop) => renderLinha(prop, true))}
                </div>
              </div>
            )}

            {/* Resultados da busca */}
            <div className="space-y-2">
              {(selecionados.length > 0 || busca) && (
                <p className="text-xs font-medium text-muted-foreground">
                  {busca
                    ? `${resultados.length} resultado(s)`
                    : "Disponíveis"}
                </p>
              )}
              {visiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {busca
                    ? "Nenhum imóvel encontrado para esta busca."
                    : "Todos os imóveis já foram selecionados."}
                </p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {visiveis.map((prop) => renderLinha(prop, false))}
                </div>
              )}
              {ocultos > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Mostrando {visiveis.length} de {resultados.length}. Use a busca para
                  encontrar outros {ocultos} imóvel(is).
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ações */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando…" : "Salvar Proprietário"}
        </Button>
      </div>
    </div>
  );
};

export default CadastroProprietarioPage;
