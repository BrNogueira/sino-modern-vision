import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { useCategorias } from "@/contexts/CategoriasContext";
import { supabase } from "@/integrations/supabase/client";
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
import { ArrowLeft, Save, Upload, X, ChevronLeft, ChevronRight, GripVertical, ImageIcon } from "lucide-react";
import {
  ZapImovel,
  TipoImovel,
  SubTipoImovel,
  TipoOferta,
  defaultFeatureFlags,
  defaultGarantias,
  tipoImovelOptions,
  subTipoByTipo,
  featureCategories,
  garantiasLabels,
  GarantiasAluguel,
  ZapImovelPhoto,
} from "@/types/zapImoveis";

type FormData = Omit<ZapImovel, "id" | "createdAt" | "updatedAt">;

const emptyForm: FormData = {
  codigoImovel: "",
  tituloImovel: "",
  tipoImovel: "Casa",
  subTipoImovel: "Casa Padrão",
  categoriaImovel: "Padrão",
  tipoOferta: 1,
  cep: "",
  estado: "Rio Grande do Sul",
  cidade: "",
  zona: "",
  bairro: "",
  endereco: "",
  numero: "",
  complemento: "",
  latitude: "",
  longitude: "",
  precoVenda: null,
  precoAluguel: null,
  iptu: null,
  valorCondominio: null,
  areaTotal: null,
  areaUtil: null,
  areaDimensions: "",
  qtdDormitorios: null,
  qtdSuites: null,
  qtdBanheiros: null,
  qtdVagas: null,
  observacao: "",
  descricaoCurta: "",
  fotos: [],
  videoUrl: "",
  linkTourVirtual: "",
  features: defaultFeatureFlags(),
  garantias: { ...defaultGarantias },
  anoConstrucao: null,
  proprietarioNome: "",
  proprietarioTelefone: "",
  proprietarioEmail: "",
  proprietarioDocumento: "",
  modalidade: [],
  ativo: true,
  destaque: false,
  exclusivo: false,
};

/* ─── Photo Upload Section ─── */
const PhotoUploadSection = ({
  photos,
  onChange,
}: {
  photos: ZapImovelPhoto[];
  onChange: (photos: ZapImovelPhoto[]) => void;
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragItemRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!fileArray.length) return;

      setUploading(true);
      try {
        const uploaded: ZapImovelPhoto[] = [];
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("imoveis-fotos")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });
          if (upErr) {
            console.error("Photo upload failed:", upErr);
            continue;
          }
          const { data: pub } = supabase.storage.from("imoveis-fotos").getPublicUrl(path);
          uploaded.push({
            url: pub.publicUrl,
            principal: photos.length === 0 && uploaded.length === 0,
          });
        }
        if (uploaded.length) onChange([...photos, ...uploaded]);
      } finally {
        setUploading(false);
      }
    },
    [photos, onChange]
  );

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    if (carouselIndex >= updated.length) setCarouselIndex(Math.max(0, updated.length - 1));
  };

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItemRef.current === null || dragOverIndex === null || dragItemRef.current === dragOverIndex) {
      setDragOverIndex(null);
      dragItemRef.current = null;
      return;
    }

    const updated = [...photos];
    const [moved] = updated.splice(dragItemRef.current, 1);
    updated.splice(dragOverIndex, 0, moved);
    onChange(updated);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files.length) {
      addPhotos(e.dataTransfer.files);
    }
  };

  const prevSlide = () => setCarouselIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextSlide = () => setCarouselIndex((i) => (i + 1) % photos.length);

  return (
    <section className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        📷 Fotos do Imóvel
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({photos.length} {photos.length === 1 ? "foto" : "fotos"} — ilimitado)
        </span>
      </h2>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDraggingOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {uploading
            ? "Enviando fotos..."
            : <>Arraste fotos aqui ou <span className="text-primary font-semibold">clique para selecionar</span></>}
        </p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — sem limite de quantidade</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addPhotos(e.target.files)}
        />
      </div>

      {/* Carousel preview */}
      {photos.length > 0 && (
        <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/10] border border-border">
          <img
            src={photos[carouselIndex].url}
            alt={`Foto ${carouselIndex + 1}`}
            className="w-full h-full object-contain bg-muted"
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                {carouselIndex + 1} / {photos.length}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => removePhoto(carouselIndex)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gallery grid with drag-and-drop reorder */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <GripVertical className="w-3 h-3" /> Arraste para reordenar • A primeira foto será a capa
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => setCarouselIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all group ${
                  carouselIndex === index
                    ? "border-primary ring-2 ring-primary/30"
                    : dragOverIndex === index
                    ? "border-accent scale-105"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <img src={photo.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[9px] font-bold px-1 rounded">
                    CAPA
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-primary-foreground text-[9px] text-center py-0.5">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4 justify-center">
          <ImageIcon className="w-5 h-5" />
          Nenhuma foto adicionada ainda
        </div>
      )}
    </section>
  );
};

const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addProperty, updateProperty, getProperty, properties, loading } = useAdminProperties();
  const { categorias } = useCategorias();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    if (!isEditing || !id) return;
    // Aguarda o carregamento dos imóveis antes de decidir; caso contrário,
    // ao abrir a edição direto pela URL (ou recarregar a página) o contexto
    // ainda está vazio e redirecionaria de volta indevidamente.
    if (loading) return;
    const existing = getProperty(id);
    if (existing) {
      const { id: _, createdAt, updatedAt, ...rest } = existing;
      setForm(rest);
    } else {
      navigate("/admin/imoveis", { replace: true });
    }
  }, [id, isEditing, loading, getProperty, navigate]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleFeature = (featureKey: string) =>
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [featureKey]: !prev.features[featureKey] },
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

  const [submitting, setSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepLookup = async (cepValue: string) => {
    const cleaned = cepValue.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast({ title: "CEP não encontrado", variant: "destructive" });
        return;
      }
      setForm((prev) => ({
        ...prev,
        cep: cleaned,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf === "RS" ? "Rio Grande do Sul" : (data.estado || data.uf || prev.estado),
        complemento: data.complemento || prev.complemento,
      }));
      toast({ title: "Endereço preenchido pelo CEP" });
    } catch {
      toast({ title: "Erro ao buscar CEP", variant: "destructive" });
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.codigoImovel.trim()) {
      toast({ title: "Erro", description: "Código do imóvel é obrigatório.", variant: "destructive" });
      return;
    }
    if (!form.tituloImovel.trim() || form.tituloImovel.trim().length < 10) {
      toast({ title: "Erro", description: "Título deve ter pelo menos 10 caracteres.", variant: "destructive" });
      return;
    }
    if (!form.observacao.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória.", variant: "destructive" });
      return;
    }
    if (!form.precoVenda && !form.precoAluguel) {
      toast({ title: "Erro", description: "Informe ao menos um preço (venda ou aluguel).", variant: "destructive" });
      return;
    }
    if (!form.areaTotal && !form.areaUtil) {
      toast({ title: "Erro", description: "Informe ao menos uma área (total ou útil).", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updateProperty(id, form);
        toast({ title: "Imóvel atualizado com sucesso!" });
      } else {
        await addProperty(form);
        toast({ title: "Imóvel cadastrado com sucesso!" });
      }
      navigate("/admin/imoveis");
    } catch (err: any) {
      toast({
        title: "Erro ao salvar imóvel",
        description: err?.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const numericField = (label: string, key: keyof FormData, placeholder = "", required = false) => (
    <div className="space-y-1.5">
      <Label className="text-foreground text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type="number"
        placeholder={placeholder}
        value={form[key] !== null && form[key] !== undefined ? String(form[key]) : ""}
        onChange={(e) => set(key, e.target.value ? Number(e.target.value) : null as any)}
      />
    </div>
  );

  const textField = (label: string, key: keyof FormData, placeholder = "", maxLength = 200, required = false) => (
    <div className="space-y-1.5">
      <Label className="text-foreground text-sm">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        placeholder={placeholder}
        value={String(form[key] || "")}
        onChange={(e) => set(key, e.target.value as any)}
        maxLength={maxLength}
      />
    </div>
  );

  const selectedFeaturesCount = Object.values(form.features).filter(Boolean).length;

  if (isEditing && loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-muted-foreground">
        Carregando imóvel...
      </div>
    );
  }

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
            Campos obrigatórios conforme padrão Zap Imóveis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identificação */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            📋 Identificação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("Código do Imóvel", "codigoImovel", "CA0003", 50, true)}
            {textField("Título do Imóvel (10-100 chars)", "tituloImovel", "Lindo Apartamento a venda em São Paulo", 100, true)}
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Categoria da Home</Label>
            <Select
              value={form.categoriaId || "__none__"}
              onValueChange={(v) => set("categoriaId", v === "__none__" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem categoria</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome} {!c.ativo && "(inativa)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Vincula este imóvel a uma categoria do carrossel da home. Gerencie em <span className="font-medium">Imóveis › Categorias</span>.
            </p>
          </div>
        </section>

        {/* Classificação */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            🏷️ Classificação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Tipo do Imóvel <span className="text-destructive">*</span></Label>
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
              <Label className="text-foreground text-sm">Subtipo <span className="text-destructive">*</span></Label>
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
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">Modalidade <span className="text-destructive">*</span></Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={form.modalidade.includes("venda")}
                    onCheckedChange={(checked) => {
                      const current = form.modalidade;
                      if (checked) {
                        set("modalidade", [...current, "venda"] as any);
                      } else {
                        set("modalidade", current.filter((m: string) => m !== "venda") as any);
                      }
                    }}
                  />
                  Venda
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={form.modalidade.includes("aluguel")}
                    onCheckedChange={(checked) => {
                      const current = form.modalidade;
                      if (checked) {
                        set("modalidade", [...current, "aluguel"] as any);
                      } else {
                        set("modalidade", current.filter((m: string) => m !== "aluguel") as any);
                      }
                    }}
                  />
                  Aluguel
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            📍 Endereço
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground text-sm">
                CEP
                {cepLoading && <span className="text-xs text-muted-foreground ml-2">buscando...</span>}
              </Label>
              <Input
                placeholder="93700000"
                value={form.cep}
                maxLength={9}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                  set("cep", v);
                  if (v.length === 8) handleCepLookup(v);
                }}
                onBlur={(e) => handleCepLookup(e.target.value)}
              />
            </div>
            {textField("Estado", "estado", "Rio Grande do Sul")}
            {textField("Cidade", "cidade", "Novo Hamburgo")}
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
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            💰 Preços e Valores <span className="text-sm font-normal text-muted-foreground">(ao menos um obrigatório)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {numericField("Preço Venda (R$)", "precoVenda", "150000")}
            {numericField("Preço Aluguel (R$/mês)", "precoAluguel", "1800")}
            {numericField("IPTU (R$/ano)", "iptu", "3500")}
            {numericField("Condomínio (R$/mês)", "valorCondominio", "450")}
          </div>
        </section>

        {/* Áreas e Quantidades */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            📐 Áreas e Quantidades
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {numericField("Área Total (m²)", "areaTotal", "", true)}
            {numericField("Área Útil (m²)", "areaUtil", "", true)}
            {textField("Dimensões (Ex: 15x35)", "areaDimensions", "15x35")}
            {numericField("Dormitórios", "qtdDormitorios")}
            {numericField("Suítes", "qtdSuites")}
            {numericField("Banheiros", "qtdBanheiros")}
            {numericField("Vagas Garagem", "qtdVagas")}
            {numericField("Ano Construção", "anoConstrucao", "2024")}
          </div>
        </section>

        {/* Descrição */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            📝 Descrição <span className="text-destructive">*</span>
          </h2>
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Descrição completa <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Descreva o imóvel com detalhes (até 3000 caracteres)..."
              value={form.observacao}
              onChange={(e) => set("observacao", e.target.value)}
              className="min-h-[150px]"
              maxLength={3000}
            />
            <p className="text-xs text-muted-foreground">{form.observacao.length}/3000 caracteres</p>
          </div>
        </section>

        {/* Fotos e Mídia */}
        <PhotoUploadSection
          photos={form.fotos}
          onChange={(fotos) => set("fotos", fotos)}
        />

        {/* Vídeo e Tour */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            🎥 Vídeo e Tour Virtual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("URL do Vídeo (YouTube)", "videoUrl", "https://youtu.be/...", 500)}
            {textField("Link Tour Virtual (HTTPS)", "linkTourVirtual", "https://...", 500)}
          </div>
        </section>

        {/* ====== SISTEMA DE ÍCONES ====== */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-semibold text-foreground">
              📋 Características do Imóvel
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedFeaturesCount} {selectedFeaturesCount === 1 ? "item selecionado" : "itens selecionados"}
            </p>
          </div>

          {featureCategories.map((category) => {
            const categorySelectedCount = category.items.filter(
              (item) => form.features[item.key]
            ).length;

            return (
              <div key={category.key} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  {category.title}
                  {categorySelectedCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {categorySelectedCount}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {category.items.map((item) => {
                    const isSelected = form.features[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleFeature(item.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/30"
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{item.emoji}</span>
                        <span className="truncate">{item.label}</span>
                        {isSelected && (
                          <span className="ml-auto text-primary font-bold text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Garantias */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            🔐 Garantias (Aluguel)
          </h2>
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

        {/* Proprietário */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            👤 Proprietário
          </h2>

          {/* Select de proprietários existentes */}
          {(() => {
            const uniqueOwners = properties
              .filter((p) => p.proprietarioNome?.trim())
              .reduce<{ nome: string; telefone: string; email: string; documento: string }[]>((acc, p) => {
                if (!acc.find((o) => o.nome === p.proprietarioNome)) {
                  acc.push({
                    nome: p.proprietarioNome,
                    telefone: p.proprietarioTelefone || "",
                    email: p.proprietarioEmail || "",
                    documento: p.proprietarioDocumento || "",
                  });
                }
                return acc;
              }, []);

            return uniqueOwners.length > 0 ? (
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Selecionar Proprietário Existente</Label>
                <Select
                  value={form.proprietarioNome || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      set("proprietarioNome", "");
                      set("proprietarioTelefone", "");
                      set("proprietarioEmail", "");
                      set("proprietarioDocumento", "");
                    } else if (v === "__new__") {
                      set("proprietarioNome", "");
                      set("proprietarioTelefone", "");
                      set("proprietarioEmail", "");
                      set("proprietarioDocumento", "");
                    } else {
                      const owner = uniqueOwners.find((o) => o.nome === v);
                      if (owner) {
                        set("proprietarioNome", owner.nome);
                        set("proprietarioTelefone", owner.telefone);
                        set("proprietarioEmail", owner.email);
                        set("proprietarioDocumento", owner.documento);
                      }
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione um proprietário" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Nenhum —</SelectItem>
                    <SelectItem value="__new__">➕ Cadastrar novo</SelectItem>
                    {uniqueOwners.map((o) => (
                      <SelectItem key={o.nome} value={o.nome}>{o.nome} {o.documento ? `(${o.documento})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textField("Nome do Proprietário", "proprietarioNome", "João da Silva", 200)}
            {textField("Telefone", "proprietarioTelefone", "(51) 99999-9999", 20)}
            {textField("E-mail", "proprietarioEmail", "proprietario@email.com", 200)}
            {textField("CPF/CNPJ", "proprietarioDocumento", "000.000.000-00", 20)}
          </div>
        </section>

        {/* Controle */}
        <section className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            ⚙️ Controle Interno
          </h2>
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
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="outline" type="button" onClick={() => navigate("/admin/imoveis")}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Imóvel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
