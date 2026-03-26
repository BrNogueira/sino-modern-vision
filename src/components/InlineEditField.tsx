import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useChangeLog } from "@/contexts/ChangeLogContext";
import { toast } from "@/hooks/use-toast";

interface InlineEditFieldProps {
  value: string;
  field: string;
  propertyCode: string;
  propertyTitle: string;
  onSave: (newValue: string) => void;
  type?: "text" | "textarea" | "number";
  className?: string;
  children: React.ReactNode;
}

const InlineEditField = ({
  value,
  field,
  propertyCode,
  propertyTitle,
  onSave,
  type = "text",
  className = "",
  children,
}: InlineEditFieldProps) => {
  const { isAuthenticated, roles, profile } = useAdminAuth();
  const role = roles[0] || null;
  const userName = profile?.full_name || null;
  const { addLog } = useChangeLog();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  if (!isAuthenticated) return <>{children}</>;

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);

      if (role === "corretor") {
        addLog({
          propertyCode,
          propertyTitle,
          field,
          oldValue: value,
          newValue: editValue,
          changedBy: userName || "Corretor",
          role: "corretor",
        });
      }

      toast({
        title: "Campo atualizado",
        description: role === "corretor"
          ? `Alteração em "${field}" registrada no log.`
          : `"${field}" atualizado com sucesso.`,
      });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {type === "textarea" ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 rounded-md border border-primary/40 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
            autoFocus
          />
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 rounded-md border border-primary/40 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        )}
        <button onClick={handleSave} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleCancel} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`group/edit relative inline-flex items-center gap-1.5 ${className}`}>
      {children}
      <button
        onClick={() => { setEditValue(value); setEditing(true); }}
        className="opacity-70 hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 flex-shrink-0 shadow-sm"
        title={`Editar ${field}`}
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
};

export default InlineEditField;
