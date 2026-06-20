import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface AsyncPickerProps {
  /** Rótulo do item já selecionado (mostrado no botão). */
  valueLabel?: string | null;
  placeholder?: string;
  /** Busca assíncrona; recebe o termo (pode ser vazio p/ lista inicial). */
  search: (term: string) => Promise<PickerItem[]>;
  onSelect: (item: PickerItem | null) => void;
  disabled?: boolean;
  className?: string;
}

/** Combobox de busca assíncrona (Popover + input + lista debounced). */
export function AsyncPicker({
  valueLabel,
  placeholder = "Buscar...",
  search,
  onSelect,
  disabled,
  className,
}: AsyncPickerProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!open) return;
    const id = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await search(term.trim());
        if (id === reqId.current) setItems(res);
      } catch {
        if (id === reqId.current) setItems([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [term, open, search]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="flex-1 justify-between font-normal min-w-0"
          >
            <span className={cn("truncate", !valueLabel && "text-muted-foreground")}>
              {valueLabel || placeholder}
            </span>
            <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[260px]" align="start">
          <div className="relative border-b border-border">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Digite para buscar..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="pl-9 border-0 focus-visible:ring-0 rounded-b-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">Nada encontrado.</p>
            ) : (
              items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => { onSelect(it); setOpen(false); setTerm(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors"
                >
                  <p className="text-sm text-foreground truncate">{it.label}</p>
                  {it.sublabel && <p className="text-xs text-muted-foreground truncate">{it.sublabel}</p>}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {valueLabel && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          title="Remover vínculo"
          onClick={() => onSelect(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
