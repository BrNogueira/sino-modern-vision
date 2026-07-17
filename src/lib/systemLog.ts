import { supabase } from "@/integrations/supabase/client";

export interface SystemLogEntry {
  id: string;
  tipo: "imovel" | "lead" | "usuario" | "sistema";
  acao: string;
  entidade?: string | null;
  entidade_id?: string | null;
  descricao: string;
  usuario?: string | null;
  role?: string | null;
  dados?: Record<string, unknown> | null;
  created_at: string;
}

export type NewSystemLog = Omit<SystemLogEntry, "id" | "created_at">;

// Registra um evento na trilha de auditoria (system_logs). Fire-and-forget:
// falha de log nunca pode quebrar a operação principal.
export const logSystem = (entry: NewSystemLog): void => {
  void supabase
    .from("system_logs")
    .insert({ ...entry, dados: entry.dados ?? null })
    .then(({ error }: { error: unknown }) => {
      if (error) console.warn("system_logs insert failed:", error);
    });
};
