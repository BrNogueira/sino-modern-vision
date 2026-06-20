import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";
export interface SortState<K extends string = string> {
  key: K | null;
  dir: SortDir;
}

/** Valor comparável extraído de uma linha para ordenação. */
type SortValue = string | number | boolean | null | undefined;
export type SortAccessors<T, K extends string> = Record<K, (item: T) => SortValue>;

/**
 * Ordenação client-side genérica para as tabelas do admin.
 *
 * `accessors` deve ser ESTÁVEL entre renders (defina como constante de módulo
 * ou via useMemo) — é dependência do useMemo interno. Nulos vão sempre ao fim.
 * Strings comparadas com locale pt-BR (numeric) p/ ordenar "Casa 2" < "Casa 10".
 */
export function useTableSort<T, K extends string>(
  items: T[],
  accessors: SortAccessors<T, K>,
  initial: SortState<K> = { key: null, dir: "asc" },
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const toggle = (key: K) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const sorted = useMemo(() => {
    if (!sort.key) return items;
    const acc = accessors[sort.key];
    if (!acc) return items;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // nulos por último, independente da direção
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
      if (typeof av === "boolean" && typeof bv === "boolean")
        return (Number(av) - Number(bv)) * factor;
      return String(av).localeCompare(String(bv), "pt-BR", { numeric: true }) * factor;
    });
  }, [items, sort, accessors]);

  return { sort, toggle, sorted };
}
