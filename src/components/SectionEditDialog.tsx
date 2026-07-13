import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useChangeLog } from "@/contexts/ChangeLogContext";
import { toast } from "@/hooks/use-toast";
import type { ZapImovel } from "@/types/zapImoveis";

export interface SectionField {
  /** Chave do ZapImovel persistida via updateProperty. */
  key: keyof ZapImovel;
  label: string;
  type?: "text" | "number" | "textarea";
  value: string | number | null | undefined;
}

interface SectionEditDialogProps {
  sectionTitle: string;
  propertyCode: string;
  propertyTitle: string;
  fields: SectionField[];
  onSave: (updates: Partial<ZapImovel>) => Promise<unknown> | void;
  /** Estilo do botão-lápis (ajusta a cor conforme o fundo da seção). */
  triggerClassName?: string;
}

/**
 * Um único lápis por seção. Abre um diálogo com os campos da seção e persiste
 * as alterações (apenas os campos que mudaram) via `onSave`. Só aparece para
 * usuários autenticados.
 */
const SectionEditDialog = ({
  sectionTitle,
  propertyCode,
  propertyTitle,
  fields,
  onSave,
  triggerClassName = "bg-primary text-primary-foreground hover:bg-primary/80",
}: SectionEditDialogProps) => {
  const { isAuthenticated, roles, profile } = useAdminAuth();
  const role = roles[0] || null;
  const userName = profile?.full_name || null;
  const { addLog } = useChangeLog();

  const initDraft = () =>
    Object.fromEntries(fields.map((f) => [String(f.key), f.value == null ? "" : String(f.value)]));

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(initDraft);

  if (!isAuthenticated) return null;

  const handleOpenChange = (o: boolean) => {
    if (o) setDraft(initDraft());
    setOpen(o);
  };

  const handleSubmit = async () => {
    const updates: Partial<ZapImovel> = {};
    const changed: { label: string; oldV: string; newV: string }[] = [];
    for (const f of fields) {
      const orig = f.value == null ? "" : String(f.value);
      const next = draft[String(f.key)] ?? "";
      if (next === orig) continue;
      (updates as Record<string, unknown>)[f.key as string] =
        f.type === "number" ? (next.trim() === "" ? null : Number(next)) : next;
      changed.push({ label: f.label, oldV: orig, newV: next });
    }
    if (changed.length === 0) {
      setOpen(false);
      return;
    }
    try {
      setSaving(true);
      await onSave(updates);
      if (role === "corretor") {
        changed.forEach((c) =>
          addLog({
            propertyCode,
            propertyTitle,
            field: c.label,
            oldValue: c.oldV,
            newValue: c.newV,
            changedBy: userName || "Corretor",
            role: "corretor",
          }),
        );
      }
      toast({ title: "Seção atualizada", description: `${sectionTitle} salvo com sucesso.` });
      setOpen(false);
    } catch (e) {
      toast({
        title: "Erro ao salvar",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          title={`Editar ${sectionTitle}`}
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors shadow-sm shrink-0 ${triggerClassName}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {sectionTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((f) => (
            <div key={String(f.key)} className="space-y-1.5">
              <Label htmlFor={String(f.key)}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={String(f.key)}
                  value={draft[String(f.key)] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [String(f.key)]: e.target.value }))}
                  className="min-h-[120px]"
                />
              ) : (
                <Input
                  id={String(f.key)}
                  type={f.type === "number" ? "number" : "text"}
                  value={draft[String(f.key)] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [String(f.key)]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SectionEditDialog;
