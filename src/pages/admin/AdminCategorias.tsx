import { useState, useRef, useEffect } from "react";
import { useCategorias, slugify } from "@/contexts/CategoriasContext";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutGrid, Plus, Pencil, Trash2, GripVertical, Upload, ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Categoria } from "@/types/zapImoveis";

interface FormState {
  nome: string;
  slug: string;
  descricao: string;
  fotoUrl: string;
  ordem: number;
  ativo: boolean;
}

const emptyForm: FormState = {
  nome: "",
  slug: "",
  descricao: "",
  fotoUrl: "",
  ordem: 0,
  ativo: true,
};

const AdminCategorias = () => {
  const { categorias, addCategoria, updateCategoria, deleteCategoria, reorderCategorias } = useCategorias();
  const { properties } = useAdminProperties();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hero Banner State
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>("");
  const [loadingHero, setLoadingHero] = useState(true);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_banner")
        .single();
      if (data) setHeroBannerUrl(data.value);
      setLoadingHero(false);
    };
    fetchHero();
  }, []);


  const handleUpdateHeroBanner = async (url: string) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: url })
        .eq("key", "hero_banner");
      if (error) throw error;
      setHeroBannerUrl(url);
      toast({ title: "Banner atualizado com sucesso" });
    } catch (e: any) {
      toast({
        title: "Erro ao atualizar banner",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadHero = async (file: File) => {
    setUploadingHero(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `hero-banner-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("categorias")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      
      if (error) throw error;
      
      const { data: pub } = supabase.storage.from("categorias").getPublicUrl(path);
      await handleUpdateHeroBanner(pub.publicUrl);
    } catch (e: any) {
      toast({
        title: "Erro ao enviar banner",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setUploadingHero(false);
    }
  };


  const countByCategoria = (id: string) =>
    properties.filter((p) => p.categoriaId === id && p.ativo).length;

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, ordem: categorias.length });
    setOpen(true);
  };

  const openEdit = (c: Categoria) => {
    setEditing(c);
    setForm({
      nome: c.nome,
      slug: c.slug,
      descricao: c.descricao,
      fotoUrl: c.fotoUrl,
      ordem: c.ordem,
      ativo: c.ativo,
    });
    setOpen(true);
  };

  const handleNomeChange = (nome: string) => {
    setForm((prev) => ({
      ...prev,
      nome,
      // só auto-gera slug se ainda não foi editado manualmente ou está vazio
      slug: !editing && (!prev.slug || prev.slug === slugify(prev.nome)) ? slugify(nome) : prev.slug,
    }));
  };

  const handleUploadFoto = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("categorias")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("categorias").getPublicUrl(path);
      setForm((prev) => ({ ...prev, fotoUrl: pub.publicUrl }));
      toast({ title: "Foto carregada" });
    } catch (e: any) {
      toast({
        title: "Erro ao enviar foto",
        description: e?.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    const slug = form.slug.trim() || slugify(form.nome);
    setSaving(true);
    try {
      if (editing) {
        await updateCategoria(editing.id, { ...form, slug });
        toast({ title: "Categoria atualizada" });
      } else {
        await addCategoria({ ...form, slug });
        toast({ title: "Categoria criada" });
      }
      setOpen(false);
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: e?.message || "Verifique se o slug já existe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategoria(deleteId);
      toast({ title: "Categoria removida" });
      setDeleteId(null);
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e?.message, variant: "destructive" });
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= categorias.length) return;
    const ids = categorias.map((c) => c.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    await reorderCategorias(ids);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias exibidas no carrossel da home e vincule aos imóveis"
        icon={LayoutGrid}
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Categoria
          </Button>
        }
      />

      {/* Bloco de Banner Hero */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Banner Principal (Hero)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="aspect-[21/9] rounded-lg bg-muted overflow-hidden border border-border relative group">
                {loadingHero ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : heroBannerUrl ? (
                  <img src={heroBannerUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingHero}
                  >
                    <Upload className="w-4 h-4" />
                    Alterar Imagem
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Configurações do Banner</h3>
                <p className="text-sm text-muted-foreground">
                  Esta imagem é exibida no topo da página inicial, atrás da barra de busca.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Dimensões Recomendadas
                </p>
                <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
                  <li>Largura mínima: <strong>1920px</strong></li>
                  <li>Altura mínima: <strong>680px</strong></li>
                  <li>Proporção ideal: <strong>21:9</strong></li>
                  <li>Tamanho máximo: <strong>2MB</strong> (para melhor performance)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => heroFileInputRef.current?.click()} 
                  disabled={uploadingHero}
                  className="gap-2"
                >
                  {uploadingHero ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingHero ? "Enviando..." : "Enviar Nova Imagem"}
                </Button>
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadHero(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Listagem</h2>
          <span className="text-xs text-muted-foreground">
            {categorias.length} {categorias.length === 1 ? "categoria" : "categorias"}
          </span>
        </div>

        {categorias.length === 0 ? (
          <div className="p-12 text-center">
            <LayoutGrid className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">Nenhuma categoria criada ainda.</p>
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeira categoria
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ordem</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="text-center">Imóveis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={i === categorias.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {c.fotoUrl ? (
                          <img src={c.fotoUrl} alt={c.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{c.nome}</p>
                        {c.descricao && (
                          <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {c.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                    {c.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      {countByCategoria(c.id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        c.ativo ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.ativo ? "bg-primary" : "bg-muted-foreground"
                        }`}
                      />
                      {c.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(c.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Casas, Apartamentos, Lançamentos"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="casas"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Texto curto opcional para a categoria"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Foto da categoria</Label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                  {form.fotoUrl ? (
                    <img src={form.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2 w-full"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Enviando..." : form.fotoUrl ? "Trocar foto" : "Enviar foto"}
                  </Button>
                  {form.fotoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((p) => ({ ...p, fotoUrl: "" }))}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      Remover foto
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadFoto(e.target.files[0])}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Recomendado: imagem quadrada, mínimo 600×600px
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
              <div>
                <Label className="text-sm">Categoria ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Apenas categorias ativas são clicáveis no site
                </p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Os imóveis vinculados a esta categoria ficarão sem categoria, mas não serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategorias;
