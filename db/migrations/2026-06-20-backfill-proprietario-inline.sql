-- ============================================================================
-- Backfill: espelhar dados do proprietário vinculado (FK imoveis.proprietario_id
-- → clientes) nas colunas DENORMALIZADAS proprietario_nome/telefone/email.
--
-- Por quê: o de-para (scripts/import-pessoas-mysql.ts) populou imoveis.proprietario_id,
-- mas o admin (AdminPropertiesContext / PropertyForm) LÊ E EDITA os campos inline
-- proprietario_nome/telefone/email — não o FK. Sem este backfill os imóveis ficam
-- "sem proprietário" na tela mesmo com o vínculo relacional correto.
--
-- Idempotente: só preenche onde o nome inline está vazio (preserva edição manual).
-- clientes não tem coluna de documento → proprietario_documento não é tocado.
--
-- Uso (produção, MariaDB via socket):
--   set -a; . server/.env; set +a
--   mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -S "$MYSQL_SOCKET" "$MYSQL_DATABASE" \
--     < db/migrations/2026-06-20-backfill-proprietario-inline.sql
-- ============================================================================

SET NAMES utf8mb4;

UPDATE imoveis i
  JOIN clientes c ON c.id = i.proprietario_id
SET
  i.proprietario_nome     = c.nome,
  i.proprietario_telefone = COALESCE(NULLIF(c.telefone, ''), i.proprietario_telefone),
  i.proprietario_email    = COALESCE(NULLIF(c.email, ''),    i.proprietario_email)
WHERE i.proprietario_id IS NOT NULL
  AND (i.proprietario_nome IS NULL OR i.proprietario_nome = '');
