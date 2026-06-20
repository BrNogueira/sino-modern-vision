import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/hooks/useTableSort";

interface SortIconProps {
  active: boolean;
  dir: SortDir;
  className?: string;
}

/** Indicador visual de ordenação (asc/desc/inativo). Reutilizável fora da Table. */
export function SortIcon({ active, dir, className }: SortIconProps) {
  if (!active) return <ChevronsUpDown className={cn("w-3.5 h-3.5 opacity-40", className)} />;
  return dir === "asc" ? (
    <ArrowUp className={cn("w-3.5 h-3.5", className)} />
  ) : (
    <ArrowDown className={cn("w-3.5 h-3.5", className)} />
  );
}

interface SortableHeadProps<K extends string> {
  label: string;
  sortKey: K;
  activeKey: K | null;
  dir: SortDir;
  onSort: (key: K) => void;
  className?: string;
  align?: "left" | "center" | "right";
}

/** <TableHead> clicável que ordena pela coluna `sortKey`. */
export function SortableHead<K extends string>({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
  align = "left",
}: SortableHeadProps<K>) {
  const active = activeKey === sortKey;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 select-none transition-colors hover:text-foreground",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto",
          active && "text-foreground font-semibold",
        )}
      >
        {label}
        <SortIcon active={active} dir={dir} />
      </button>
    </TableHead>
  );
}
