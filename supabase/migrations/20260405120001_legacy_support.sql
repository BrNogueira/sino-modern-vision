-- ============================================================
-- FASE 1B: Suporte a migração de dados legados
-- - Adiciona legacy_emp_id em condominios
-- - Cria tabela corretores_legado (sem FK de auth.users)
-- ============================================================


-- ── Adiciona campo legacy_emp_id em condominios ──────────────
ALTER TABLE public.condominios
  ADD COLUMN IF NOT EXISTS legacy_emp_id INTEGER UNIQUE;

CREATE INDEX IF NOT EXISTS idx_condominios_legacy_emp
  ON public.condominios (legacy_emp_id);


-- ── Adiciona campo legacy_corretor_id em profiles ────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_corretor_id INTEGER UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_legacy_corretor
  ON public.profiles (legacy_corretor_id);


-- ── Tabela intermediária para corretores sem conta Supabase ──
-- Corretores legados que ainda não têm login no sistema novo.
-- Quando o corretor for cadastrado no Auth, basta atualizar
-- o campo profile_id para vincular.
CREATE TABLE IF NOT EXISTS public.corretores_legado (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_corretor_id  INTEGER UNIQUE NOT NULL,
  full_name           TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL DEFAULT '',
  phone               TEXT DEFAULT '',
  creci               TEXT DEFAULT '',
  avatar_url          TEXT DEFAULT '',
  active              BOOLEAN NOT NULL DEFAULT true,
  -- Quando o corretor for criado no Supabase Auth, vincular aqui
  profile_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_corretores_legado_email   ON public.corretores_legado (email);
CREATE INDEX idx_corretores_legado_profile ON public.corretores_legado (profile_id);

ALTER TABLE public.corretores_legado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read corretores_legado"
  ON public.corretores_legado FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage corretores_legado"
  ON public.corretores_legado FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
  );

CREATE TRIGGER trg_corretores_legado_updated_at
  BEFORE UPDATE ON public.corretores_legado
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── FK de imoveis para corretores_legado quando não há profile ─
-- A coluna corretor_legacy_id já existe em imoveis (migration anterior).
-- Aqui criamos uma FK soft (sem constraint, mantida por convenção)
-- para evitar problemas com dados legados inconsistentes.
-- A vinculação real é feita via corretor_id (UUID) quando disponível.

COMMENT ON COLUMN public.imoveis.corretor_legacy_id IS
  'ID legado do corretor (corretores.cor_id). Usar corretor_id (UUID) quando disponível.';

COMMENT ON COLUMN public.imoveis.empreendimento_legacy_id IS
  'ID legado do empreendimento (empreendimentos.emp_id). Usar condominio_id (UUID) quando disponível.';
