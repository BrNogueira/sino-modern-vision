import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import {
  ZapImovel,
  TipoImovel,
  SubTipoImovel,
  CategoriaImovel,
  TipoOferta,
  defaultCaracteristicas,
  defaultGarantias,
  tipoImovelOptions,
  subTipoByTipo,
  caracteristicasLabels,
  garantiasLabels,
  CaracteristicasImovel,
  GarantiasAluguel,
} from "@/types/zapImoveis";

type FormData = Omit<ZapImovel, "id" | "createdAt" | "updatedAt">;

const emptyForm: FormData = {
  codigoImovel: "",
  tituloImovel: "",
  tipoImovel: "Casa",
  subTipoImovel: "Casa Padrão",
  categoriaImovel: "Padrão",
  tipoOferta: 1,
  estado: "Rio Grande do Sul",
  cidade: "",
  zona: "",
  bairro: "",
  endereco: "",
  numero: "",
  complemento: "",
  cep: "",
  latitude: "",
  longitude: "",
  precoVenda: null,
  precoAluguel: null,
  iptu: null,
  valorCondominio: null,
  areaTotal: null,
  areaUtil: null,
  qtdDormitorios: null,
  qtdSuites: null,
  qtdBanheiros: null,
  qtdVagas: null,
  observacao: "",
  fotos: [],
  videoUrl: "",
  linkTourVirtual: "",
  caracteristicas: { ...defaultCaracteristicas },
  garantias: { ...defaultGarantias },
  anoConstrucao: null,
  ativo: true,
  destaque: false,
  exclusivo: false,
};

const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addProperty, updateProperty, getProperty } = useAdminProperties();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    if (isEditing && id) {
      const existing = getProperty(id);
      if (existing) {
        const { id: _, createdAt, updatedAt, ...rest } = existing;
        setForm(rest);
      } else {
        navigate("/admin/imoveis", { replace: true });
      }
    }
  }, [id, isEditing, getProperty, navigate]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setCaracteristica = (key: keyof CaracteristicasImovel, value: boolean | number) =>
    setForm((prev) => ({
      ...prev,
      caracteristicas: { ...prev.caracteristicas, [key]: value },
    }));

  const setGarantia = (key: keyof GarantiasAluguel, value: boolean) =>
    setForm((prev) => ({
      ...prev,
      garantias: { ...prev.garantias, [key]: value },
    }));

  const handleTipoChange = (tipo: TipoImovel) => {
    const subTipos = subTipoByTipo[tipo];
    set("tipoImovel", tipo);
    set("subTipoImovel", subTipos[0]);
    set("categoriaImovel", "Padrão");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.codigoImovel.trim()) {
      toast({ title: "Erro", description: "Código do imóvel é obrigatório.", variant: "destructive" });
      return;
    }
    if (!form.tituloImovel.trim() || form.tituloImovel.trim().length < 10) {
      toast({ title: "Erro", description: "Título deve ter pelo menos 10 caracteres.", variant: "destructive" });
      return;
    }
    if (!form.cep.trim()) {
      toast({ title: "Erro", description: "CEP é obrigatório.", variant: "destructive" });
      return;
    }
    if (form.observacao.trim().length < 50) {
      toast({ title: "Erro", description: "Descrição deve ter pelo menos 50 caracteres.", variant: "destructive" });
      return;
    }
    if (!form.precoVenda && !form.precoAluguel) {
      toast({ title: "Erro", description: "Informe ao menos um preço (venda ou aluguel).", variant: "destructive" });
      return;
    }

    if (isEditing && id) {
      updateProperty(id, form);
      toast({ title: "Imóvel atualizado com sucesso!" });
    } else {
      addProperty(form);
      toast({ title: "Imóvel cadastrado com sucesso!" });
    }
    navigate("/admin/imoveis");
  };

  const numericField = (label: string, key: keyof FormData, placeholder = "") => (
    <div className="space-y-1.5">
      <Label className="text-foreground text-sm">{label}</Label>
      <Input
        type="number"
        placeholder={placeholder}
        value={form[key] !== null && form[key] !== undefined ? String(form[key]) : ""}
        onChange={(e) => set(key, e.target.value ? Number(e.target.value) : null as any)}
      />
    </div>
  );

  const textField = (label: string, key: keyof FormData, placeholder = "", maxLength = 200) => (
    <div className="space-y-1.5">
      <Label className="text-foreground text-sm">{label}</Label>
      <Input
        placeholder={placeholder}
        value={String(form[key] || "")}
        onChange={(e) => set(key, e.target.value as any)}
        maxLength={maxLength}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/imoveis")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? "Editar Imóvel" : "Novo Imóvel"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Campos conforme padrão Zap Imóveis / VRSync
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identificação */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Identificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("Código do Imóvel *", "codigoImovel", "CA0003", 50)}
            {textField("Título do Imóvel *", "tituloImovel", "Lindo Apartamento a venda em São Paulo", 100)}
          </div>
        </section>

        {/* Classificação */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Classificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Tipo do Imóvel</Label>
              <Select value={form.tipoImovel} onValueChange={(v) => handleTipoChange(v as TipoImovel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipoImovelOptions.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Subtipo</Label>
              <Select value={form.subTipoImovel} onValueChange={(v) => set("subTipoImovel", v as SubTipoImovel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subTipoByTipo[form.tipoImovel].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Tipo de Oferta</Label>
              <Select value={String(form.tipoOferta)} onValueChange={(v) => set("tipoOferta", Number(v) as TipoOferta)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Padrão</SelectItem>
                  <SelectItem value="2">Destaque Padrão</SelectItem>
                  <SelectItem value="3">Super Destaque</SelectItem>
                  <SelectItem value="5">Destaque Exclusivo</SelectItem>
                  <SelectItem value="6">Destaque Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {textField("CEP *", "cep", "93700000", 8)}
            {textField("Estado", "estado", "Rio Grande do Sul")}
            {textField("Cidade", "cidade", "Novo Hamburgo")}
            {textField("Zona", "zona", "Zona Sul")}
            {textField("Bairro", "bairro", "Centro")}
            {textField("Endereço", "endereco", "Rua das Flores")}
            {textField("Número", "numero", "123", 20)}
            {textField("Complemento", "complemento", "Apto 301")}
            {textField("Latitude", "latitude", "-29.6842")}
            {textField("Longitude", "longitude", "-51.0497")}
          </div>
        </section>

        {/* Preços */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Preços e Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {numericField("Preço Venda (R$)", "precoVenda", "150000")}
            {numericField("Preço Aluguel (R$/mês)", "precoAluguel", "1800")}
            {numericField("IPTU (R$/ano)", "iptu", "3500")}
            {numericField("Condomínio (R$/mês)", "valorCondominio", "450")}
          </div>
        </section>

        {/* Áreas e Quantidades */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Áreas e Quantidades</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {numericField("Área Total (m²)", "areaTotal")}
            {numericField("Área Útil (m²)", "areaUtil")}
            {numericField("Dormitórios", "qtdDormitorios")}
            {numericField("Suítes", "qtdSuites")}
            {numericField("Banheiros", "qtdBanheiros")}
            {numericField("Vagas Garagem", "qtdVagas")}
            {numericField("Ano Construção", "anoConstrucao", "2024")}
          </div>
        </section>

        {/* Descrição */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Descrição (Observação) *</h2>
          <Textarea
            placeholder="Mínimo 50, máximo 3000 caracteres. Descreva o imóvel com detalhes..."
            value={form.observacao}
            onChange={(e) => set("observacao", e.target.value)}
            className="min-h-[150px]"
            maxLength={3000}
          />
          <p className="text-xs text-muted-foreground">{form.observacao.length}/3000 caracteres</p>
        </section>

        {/* Mídia */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Mídia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("URL do Vídeo (YouTube)", "videoUrl", "https://youtu.be/...", 500)}
            {textField("Link Tour Virtual (HTTPS)", "linkTourVirtual", "https://...", 500)}
          </div>
          <p className="text-xs text-muted-foreground">
            As fotos serão gerenciadas via upload quando o backend estiver integrado.
          </p>
        </section>

        {/* Características */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Características</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.keys(caracteristicasLabels) as (keyof CaracteristicasImovel)[]).map((key) => {
              if (key === "qtdElevador") {
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-foreground text-sm">{caracteristicasLabels[key]}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.caracteristicas.qtdElevador}
                      onChange={(e) => setCaracteristica("qtdElevador", Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                );
              }
              return (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.caracteristicas[key] as boolean}
                    onCheckedChange={(checked) => setCaracteristica(key, !!checked)}
                  />
                  <span className="text-sm text-foreground">{caracteristicasLabels[key]}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Garantias */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Garantias (Aluguel)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(garantiasLabels) as (keyof GarantiasAluguel)[]).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.garantias[key]}
                  onCheckedChange={(checked) => setGarantia(key, !!checked)}
                />
                <span className="text-sm text-foreground">{garantiasLabels[key]}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Controle */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Controle Interno</h2>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={(v) => set("ativo", v)} />
              <span className="text-sm text-foreground">Ativo</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={form.destaque} onCheckedChange={(v) => set("destaque", v)} />
              <span className="text-sm text-foreground">Destaque</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={form.exclusivo} onCheckedChange={(v) => set("exclusivo", v)} />
              <span className="text-sm text-foreground">Exclusivo</span>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate("/admin/imoveis")}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Salvar Alterações" : "Cadastrar Imóvel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
