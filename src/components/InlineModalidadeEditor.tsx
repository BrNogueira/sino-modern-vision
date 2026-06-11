import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useChangeLog } from "@/contexts/ChangeLogContext";
import { toast } from "@/hooks/use-toast";

export type Modalidade = "venda" | "aluguel" | "venda/aluguel";

interface InlineModalidadeEditorProps {
  value: Modalidade;
  propertyCode: string;
  propertyTitle: string;
  /** Persiste a nova modalidade. Recebe o array (venda/aluguel) e o tipoOferta equivalente. */
  onSave: (modalidade: ("venda" | "aluguel")[], tipoOferta: number) => Promise<void> | void;
  children: React.ReactNode;
}

const options: { key: Modalidade; label: string }[] = [
  { key: "venda", label: "Venda" },
  { key: "aluguel", label: "Aluguel" },
  { key: "venda/aluguel", label: "Venda e Aluguel" },
];

const toPayload = (m: Modalidade): { modalidade: ("venda" | "aluguel")[]; tipoOferta: number } => {
  if (m === "venda/aluguel") return { modalidade: ["venda", "aluguel"], tipoOferta: 3 };
  if (m === "aluguel") return { modalidade: ["aluguel"], tipoOferta: 2 };
  return { modalidade: ["venda"], tipoOferta: 1 };
};

const labelOf = (m: Modalidade) => options.find((o) => o.key === m)?.label ?? m;

const InlineModalidadeEditor = ({
  value,
  propertyCode,
  propertyTitle,
  onSave,
  children,
}: InlineModalidadeEditorProps) => {
  const { isAuthenticated, roles, profile } = useAdminAuth();
  const role = roles[0] || null;
  const userName = profile?.full_name || null;
  const { addLog } = useChangeLog();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Modalidade>(value);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) return <>{children}</>;

  const handleSave = async () => {
    if (selected === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const { modalidade, tipoOferta } = toPayload(selected);
      await onSave(modalidade, tipoOferta);

      if (role === "corretor") {
        addLog({
          propertyCode,
          propertyTitle,
          field: "Modalidade",
          oldValue: labelOf(value),
          newValue: labelOf(selected),
          changedBy: userName || "Corretor",
          role: "corretor",
        });
      }

      toast({
        title: "Modalidade atualizada",
        description:
          role === "corretor"
            ? `Alteração de modalidade para "${labelOf(selected)}" registrada no log.`
            : `Imóvel agora é "${labelOf(selected)}".`,
      });
      setEditing(false);
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar modalidade",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelected(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border border-primary/40 bg-background p-1">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSelected(o.key)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                selected === o.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50"
          title="Salvar"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
          title="Cancelar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group/edit relative inline-flex items-center gap-1.5">
      {children}
      <button
        onClick={() => {
          setSelected(value);
          setEditing(true);
        }}
        className="opacity-70 hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 flex-shrink-0 shadow-sm"
        title="Editar modalidade (venda/aluguel)"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
};

export default InlineModalidadeEditor;
