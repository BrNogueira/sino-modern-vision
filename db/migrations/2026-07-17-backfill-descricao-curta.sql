-- ============================================================================
-- Backfill: descricao_curta a partir de observacao (truncada em 250, sem HTML)
--
-- O popup de descrição dos cards usa descricao_curta; parte do legado só tem
-- texto em observacao — sem isso o card fica sem popup (ex.: cód 6407).
--
-- Idempotente: só preenche onde descricao_curta está vazia. Seguro reaplicar.
-- ============================================================================

SET NAMES utf8mb4;

UPDATE imoveis
SET descricao_curta = LEFT(
  TRIM(
    REGEXP_REPLACE(
      REPLACE(REPLACE(REGEXP_REPLACE(observacao, '<[^>]*>', ' '), '&nbsp;', ' '), '&amp;', '&'),
      '[[:space:]]+', ' '
    )
  ),
  250
)
WHERE (descricao_curta IS NULL OR descricao_curta = '')
  AND observacao IS NOT NULL AND TRIM(observacao) <> '';
