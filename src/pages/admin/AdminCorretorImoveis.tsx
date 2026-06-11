import { useState } from "react";
import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Building2, Eye, EyeOff, Pencil, Trash2, Plus, ExternalLink, Power } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/admin/PageHeader";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const AdminCorretorImoveis = () => {
  const { properties, updateProperty, deleteProperty } = useAdminProperties();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const ativos = properties.filter((p) => p.ativo);
  const inativos = properties.filter((p) => !p.ativo);

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      setBusyId(id);
      await updateProperty(id, { ativo: !ativo });
      toast({
        title: ativo ? "Imóvel desativado" : "Imóvel ativado",
        description: ativo
          ? "O imóvel não aparecerá mais no site público."
          : "O imóvel agora está visível no site público.",
      });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setBusyId(deleteId);
      await deleteProperty(deleteId);
      toast({ title: "Imóvel excluído", description: "Registro removido com sucesso." });
      setDeleteId(null);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Imóveis"
        description="Gerencie os imóveis vinculados ao seu cadastro"
        icon={Building2}
        actions={
          <Button onClick={() => navigate("/admin/imoveis/novo")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Imóvel
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{properties.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{ativos.length}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{inativos.length}</p>
            <p className="text-xs text-muted-foreground">Inativos</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Listagem</h2>
          <span className="text-xs text-muted-foreground">
            {properties.length} {properties.length === 1 ? "imóvel" : "imóveis"}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">Nenhum imóvel cadastrado.</p>
            <Button onClick={() => navigate("/admin/imoveis/novo")} className="gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar primeiro imóvel
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imóvel</TableHead>
                <TableHead className="hidden md:table-cell">Localização</TableHead>
                <TableHead className="hidden lg:table-cell">Código</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => {
                const cover = Array.isArray(p.fotos) && p.fotos.length > 0 ? (p.fotos[0] as any)?.url : null;
                const slug = slugify(p.tituloImovel || p.codigoImovel);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {cover ? (
                            <img src={cover} alt={p.tituloImovel} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate max-w-[240px]">
                            {p.tituloImovel}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {p.cidade}/{p.estado}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {p.bairro ? `${p.bairro}, ` : ""}{p.cidade}/{p.estado}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                      {p.codigoImovel}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-primary whitespace-nowrap">
                        {p.precoVenda
                          ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
                          : p.precoAluguel
                          ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
                          : "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          p.ativo
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.ativo ? "bg-primary" : "bg-muted-foreground"
                          }`}
                        />
                        {p.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Visualizar no site"
                        >
                          <Link to={`/imovel/${slug}-${p.id}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Editar"
                        >
                          <Link to={`/admin/imoveis/editar/${p.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busyId === p.id}
                          onClick={() => handleToggleActive(p.id, p.ativo)}
                          title={p.ativo ? "Desativar" : "Ativar"}
                        >
                          <Power className={`w-4 h-4 ${p.ativo ? "text-primary" : "text-muted-foreground"}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busyId === p.id}
                          onClick={() => setDeleteId(p.id)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O imóvel será removido permanentemente do sistema.
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

export default AdminCorretorImoveis;
