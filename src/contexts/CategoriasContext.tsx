import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Categoria } from "@/types/zapImoveis";

interface CategoriasContextType {
  categorias: Categoria[];
  loading: boolean;
  addCategoria: (c: Omit<Categoria, "id" | "createdAt" | "updatedAt">) => Promise<Categoria | null>;
  updateCategoria: (id: string, c: Partial<Categoria>) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;
  reorderCategorias: (orderedIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const CategoriasContext = createContext<CategoriasContextType | null>(null);

const fromRow = (row: any): Categoria => ({
  id: row.id,
  nome: row.nome,
  slug: row.slug,
  descricao: row.descricao || "",
  fotoUrl: row.foto_url || "",
  ordem: row.ordem ?? 0,
  ativo: row.ativo,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toRow = (c: Partial<Categoria>): any => {
  const row: any = {};
  if (c.nome !== undefined) row.nome = c.nome;
  if (c.slug !== undefined) row.slug = c.slug;
  if (c.descricao !== undefined) row.descricao = c.descricao;
  if (c.fotoUrl !== undefined) row.foto_url = c.fotoUrl;
  if (c.ordem !== undefined) row.ordem = c.ordem;
  if (c.ativo !== undefined) row.ativo = c.ativo;
  return row;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const CategoriasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("ordem", { ascending: true })
      .order("nome", { ascending: true });
    if (error) {
      console.error("Failed to load categorias:", error);
      setCategorias([]);
    } else {
      setCategorias((data || []).map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCategoria = useCallback(async (c: Omit<Categoria, "id" | "createdAt" | "updatedAt">) => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...toRow(c), created_by: user?.id ?? null };
    const { data, error } = await supabase.from("categorias").insert(payload).select().single();
    if (error) throw error;
    const created = fromRow(data);
    setCategorias((prev) => [...prev, created].sort((a, b) => a.ordem - b.ordem));
    return created;
  }, []);

  const updateCategoria = useCallback(async (id: string, updates: Partial<Categoria>) => {
    const { data, error } = await supabase
      .from("categorias")
      .update(toRow(updates))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const updated = fromRow(data);
    setCategorias((prev) => prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.ordem - b.ordem));
  }, []);

  const deleteCategoria = useCallback(async (id: string) => {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) throw error;
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const reorderCategorias = useCallback(async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, idx) =>
      supabase.from("categorias").update({ ordem: idx }).eq("id", id),
    );
    await Promise.all(updates);
    setCategorias((prev) =>
      [...prev]
        .map((c) => ({ ...c, ordem: orderedIds.indexOf(c.id) }))
        .sort((a, b) => a.ordem - b.ordem),
    );
  }, []);

  return (
    <CategoriasContext.Provider
      value={{ categorias, loading, addCategoria, updateCategoria, deleteCategoria, reorderCategorias, refresh }}
    >
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = () => {
  const ctx = useContext(CategoriasContext);
  if (!ctx) throw new Error("useCategorias must be used within CategoriasProvider");
  return ctx;
};
