import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Building, Plus, Pencil, Trash2, Loader2, Save, Search, Upload, X, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  sindico: string;
  telefone_sindico: string;
  administradora: string;
  valor_condominio: number;
  qtd_unidades: number;
  qtd_blocos: number;
  tem_portaria: boolean;
  tem_elevador: boolean;
  tem_piscina: boolean;
  tem_salao_festas: boolean;
  tem_churrasqueira: boolean;
  tem_academia: boolean;
  observacoes: string;
  ativo: boolean;
  fotos: string[];
}

const emptyCondominio: Omit<Condominio, "id"> = {
  nome: "", endereco: "", bairro: "", cidade: "", estado: "RS", cep: "",
  sindico: "", telefone_sindico: "", administradora: "", valor_condominio: 0,
  qtd_unidades: 0, qtd_blocos: 0, tem_portaria: false, tem_elevador: false,
  tem_piscina: false, tem_salao_festas: false, tem_churrasqueira: false,
  tem_academia: false, observacoes: "", ativo: true, fotos: [],
};

const AdminCondominios = () => {
  const { canEdit, canDelete } = useAdminAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Omit<Condominio, "id"> & { id?: string }>(emptyCondominio);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUploadFotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("condominios-fotos").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("condominios-fotos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setForm(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...uploaded] }));
      toast({ title: `${uploaded.length} foto(s) enviada(s)` });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeFoto = (url: string) => {
    setForm(prev => ({ ...prev, fotos: (prev.fotos || []).filter(f => f !== url) }));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("condominios").select("*").order("nome");
    setItems((data as Condominio[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    if (form.id) {
      const { id, ...rest } = form;
      await supabase.from("condominios").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      toast({ title: "Condomínio atualizado" });
    } else {
      await supabase.from("condominios").insert({ ...form, created_by: (await supabase.auth.getUser()).data.user?.id });
      toast({ title: "Condomínio cadastrado" });
    }
    setDialogOpen(false);
    setForm(emptyCondominio);
    fetchData();
  };

  const handleEdit = (item: Condominio) => {
    setForm(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("condominios").delete().eq("id", id);
    toast({ title: "Condomínio excluído" });
    fetchData();
  };

  const handleNew = () => {
    setForm(emptyCondominio);
    setDialogOpen(true);
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const filtered = items.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.bairro.toLowerCase().includes(search.toLowerCase()) ||
    i.cidade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Condomínios"
        description="Centralize dados de prédios e infraestrutura"
        icon={Building}
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
            </div>
            {canEdit("condominios") && (
              <Button size="lg" className="gap-2" onClick={handleNew}><Plus className="w-4 h-4" />Novo</Button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Bairro/Cidade</TableHead>
                <TableHead>Síndico</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.bairro}{item.cidade ? `, ${item.cidade}` : ""}</TableCell>
                  <TableCell className="text-sm">{item.sindico || "—"}</TableCell>
                  <TableCell className="text-sm">{item.qtd_unidades}</TableCell>
                  <TableCell className="text-sm">R$ {Number(item.valor_condominio || 0).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={item.ativo ? "default" : "outline"} className="text-xs">{item.ativo ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {canEdit("condominios") && (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      )}
                      {canDelete("condominios") && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum condomínio encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar Condomínio" : "Novo Condomínio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5"><Label>Nome *</Label><Input value={form.nome} onChange={e => updateField("nome", e.target.value)} /></div>
              <div className="md:col-span-2 space-y-1.5"><Label>Endereço</Label><Input value={form.endereco} onChange={e => updateField("endereco", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Bairro</Label><Input value={form.bairro} onChange={e => updateField("bairro", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Cidade</Label><Input value={form.cidade} onChange={e => updateField("cidade", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Estado</Label><Input value={form.estado} onChange={e => updateField("estado", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>CEP</Label><Input value={form.cep} onChange={e => updateField("cep", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Síndico</Label><Input value={form.sindico} onChange={e => updateField("sindico", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Tel. Síndico</Label><Input value={form.telefone_sindico} onChange={e => updateField("telefone_sindico", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Administradora</Label><Input value={form.administradora} onChange={e => updateField("administradora", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Valor Condomínio (R$)</Label><Input type="number" value={form.valor_condominio} onChange={e => updateField("valor_condominio", Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Qtd Unidades</Label><Input type="number" value={form.qtd_unidades} onChange={e => updateField("qtd_unidades", Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Qtd Blocos</Label><Input type="number" value={form.qtd_blocos} onChange={e => updateField("qtd_blocos", Number(e.target.value))} /></div>
            </div>

            <div>
              <Label className="mb-2 block">Infraestrutura</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "tem_portaria", label: "Portaria" },
                  { key: "tem_elevador", label: "Elevador" },
                  { key: "tem_piscina", label: "Piscina" },
                  { key: "tem_salao_festas", label: "Salão de Festas" },
                  { key: "tem_churrasqueira", label: "Churrasqueira" },
                  { key: "tem_academia", label: "Academia" },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={(form as any)[f.key]} onCheckedChange={v => updateField(f.key, v)} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.observacoes} onChange={e => updateField("observacoes", e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={form.ativo} onCheckedChange={v => updateField("ativo", v)} />
              <Label>Ativo</Label>
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />{form.id ? "Salvar Alterações" : "Cadastrar Condomínio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCondominios;
