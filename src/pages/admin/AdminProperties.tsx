import { useAdminProperties } from "@/contexts/AdminPropertiesContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, ExternalLink, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ImportImoveisDialog } from "@/components/admin/ImportImoveisDialog";

const generateSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminProperties = () => {
  const { properties, deleteProperty, updateProperty } = useAdminProperties();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = properties.filter(
    (p) =>
      p.tituloImovel.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoImovel.toLowerCase().includes(search.toLowerCase()) ||
      p.cidade.toLowerCase().includes(search.toLowerCase()) ||
      p.bairro.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    deleteProperty(id);
    toast({ title: "Imóvel excluído", description: `"${title}" foi removido.` });
  };

  const toggleAtivo = (id: string, currentStatus: boolean) => {
    updateProperty(id, { ativo: !currentStatus });
    toast({
      title: currentStatus ? "Imóvel desativado" : "Imóvel ativado",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imóveis"
        description={`${properties.length} ${properties.length === 1 ? "imóvel cadastrado" : "imóveis cadastrados"} no portfólio`}
        icon={Building2}
        actions={
          <div className="flex items-center gap-2">
            <ImportImoveisDialog />
            <Button asChild size="lg" className="gap-2">
              <Link to="/admin/imoveis/novo">
                <Plus className="w-4 h-4" />
                Novo Imóvel
              </Link>
            </Button>
          </div>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, código, cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          maxLength={100}
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Código</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Título</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Cidade</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Preço</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.codigoImovel}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{p.tituloImovel}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.tipoImovel}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.cidade}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {p.precoVenda
                        ? `R$ ${p.precoVenda.toLocaleString("pt-BR")}`
                        : p.precoAluguel
                        ? `R$ ${p.precoAluguel.toLocaleString("pt-BR")}/mês`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleAtivo(p.id, p.ativo)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                          p.ativo
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {p.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Visualizar imóvel">
                          <Link to={`/imovel/${generateSlug(p.tituloImovel)}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar na página">
                          <Link to={`/imovel/${generateSlug(p.tituloImovel)}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar no formulário">
                          <Link to={`/admin/imoveis/editar/${p.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O imóvel "{p.tituloImovel}" será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id, p.tituloImovel)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProperties;
