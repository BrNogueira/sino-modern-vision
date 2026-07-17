-- ============================================================================
-- Migração: vínculo `imoveis.corretor_id` → profiles.id
--
-- "Meus Imóveis" (área do corretor) filtra por este campo. O backfill do
-- legado (produtos.corretor → corretores.cor_email → profiles.email) é feito
-- por scripts/import-corretor-vinculo.ts; aqui só a coluna + imóveis criados
-- no app novo (corretor = criador).
--
-- Link soft (sem FK rígida; enforce no app), mesma estratégia de
-- imoveis.proprietario_id / categoria_id / condominio_id.
--
-- Idempotente: ADD COLUMN/KEY IF NOT EXISTS (MariaDB). Seguro reaplicar.
--
-- Uso (produção, MariaDB via socket):
--   set -a; . server/.env; set +a
--   mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -S "$MYSQL_SOCKET" "$MYSQL_DATABASE" \
--     < db/migrations/2026-07-16-imoveis-corretor.sql
-- ============================================================================

SET NAMES utf8mb4;

ALTER TABLE imoveis
  ADD COLUMN IF NOT EXISTS corretor_id CHAR(36) NULL AFTER created_by;

ALTER TABLE imoveis
  ADD KEY IF NOT EXISTS idx_imoveis_corretor (corretor_id);

-- Imóveis criados no app novo: corretor = quem cadastrou.
UPDATE imoveis SET corretor_id = created_by
WHERE corretor_id IS NULL AND created_by IS NOT NULL;
