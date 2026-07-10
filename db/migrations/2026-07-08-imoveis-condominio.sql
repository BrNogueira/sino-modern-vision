-- ============================================================================
-- Migração: vínculo `imoveis.condominio_id` → condominios.id
--
-- Permite associar um imóvel a um condomínio no cadastro (PropertyForm) e
-- "puxar" as fotos das áreas comuns do condomínio para a galeria do imóvel.
--
-- Link soft (sem FK rígida; enforce no app), mesma estratégia de
-- imoveis.proprietario_id / categoria_id. A view imoveis_completo passa a
-- expor condominio_id/condominio_nome reais (ver db/views.sql).
--
-- Idempotente: ADD COLUMN/KEY IF NOT EXISTS (MariaDB). Seguro reaplicar.
--
-- Uso (produção, MariaDB via socket):
--   set -a; . server/.env; set +a
--   mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -S "$MYSQL_SOCKET" "$MYSQL_DATABASE" \
--     < db/migrations/2026-07-08-imoveis-condominio.sql
-- ============================================================================

SET NAMES utf8mb4;

ALTER TABLE imoveis
  ADD COLUMN IF NOT EXISTS condominio_id CHAR(36) NULL AFTER categoria_id;

ALTER TABLE imoveis
  ADD KEY IF NOT EXISTS idx_imoveis_condominio (condominio_id);
