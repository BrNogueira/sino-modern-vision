-- ============================================================================
-- sino-modern-vision — Views de compatibilidade (Model A ← Model B)
--
-- O frontend público (src/hooks/useImoveis.ts) ainda consome o "Model A":
--   • imoveis_completo  — lista/detalhe, com colunas planas + dados do corretor
--   • imoveis_imagens   — galeria (1 linha por foto)
--
-- Estas views projetam o Model B (tabela `imoveis` + `profiles`) nos nomes e no
-- formato que o front espera, sem reescrever os call sites. Resolve o achado C1
-- de docs/ARCHITECTURE.md (front e back falavam de entidades diferentes).
--
-- São READ-ONLY: registradas em server/src/routes/data.ts apenas com publicRead.
-- A escrita continua indo para a tabela `imoveis` (Model B), via /api/data/imoveis.
--
-- Idempotente (CREATE OR REPLACE). Requer MySQL 8 (JSON_TABLE / JSON_EXTRACT).
-- Aplicar em banco já existente:  mysql -uroot -p sino < db/views.sql
-- ============================================================================

-- ── imoveis_completo: imoveis (Model B) → shape plano do Model A ─────────────
CREATE OR REPLACE VIEW imoveis_completo AS
SELECT
  i.id                                                       AS id,
  NULL                                                       AS legacy_id,            -- não preservado na migração; rotas usam o id UUID
  i.codigo_imovel                                            AS cod_referencia,
  i.titulo_imovel                                            AS titulo,
  i.descricao_curta                                          AS descricao,
  i.observacao                                               AS conteudo,
  i.observacao                                               AS informacoes,
  i.tipo_imovel                                              AS tipo,
  NULL                                                       AS tipo_legacy_id,
  CASE WHEN i.tipo_oferta = 2 THEN 'aluguel' ELSE 'venda' END AS transacao,
  i.preco_venda                                              AS preco,
  i.preco_aluguel                                            AS valor_aluguel,
  i.iptu                                                     AS iptu,
  i.cep                                                      AS cep,
  i.cidade                                                   AS cidade,
  i.estado                                                   AS estado,
  i.bairro                                                   AS bairro,
  i.endereco                                                 AS endereco,
  CAST(NULLIF(REPLACE(i.latitude,  ',', '.'), '') AS DECIMAL(10,7)) AS latitude,
  CAST(NULLIF(REPLACE(i.longitude, ',', '.'), '') AS DECIMAL(10,7)) AS longitude,
  i.area_dimensions                                          AS dimensoes,
  CAST(i.qtd_dormitorios AS CHAR)                            AS dormitorios,
  i.qtd_dormitorios                                          AS quartos,
  i.qtd_suites                                               AS suites,
  i.qtd_banheiros                                            AS banheiros,
  i.qtd_vagas                                                AS vagas_garagem,
  NULL                                                       AS salas,
  NULL                                                       AS lavabos,
  CAST(i.ano_construcao AS CHAR)                             AS ano_construcao,
  NULL                                                       AS status_obra,
  NULL                                                       AS apto_financiamento,
  NULL                                                       AS acabamentos,
  i.ativo                                                    AS ativo,
  i.destaque                                                 AS destaque,
  CASE WHEN i.tipo_imovel = 'Lançamentos' THEN 1 ELSE 0 END  AS lancamento,
  i.exclusivo                                                AS exclusivo,
  CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(i.features, '$.piscina')) = 'true'
       THEN 1 ELSE 0 END                                     AS tem_piscina,
  JSON_UNQUOTE(JSON_EXTRACT(i.fotos, '$[0].url'))            AS imagem_principal,
  JSON_UNQUOTE(JSON_EXTRACT(i.fotos, '$[1].url'))            AS imagem_secundaria,
  i.video_url                                                AS video_url,
  NULL                                                       AS pdf_src,
  i.created_by                                               AS corretor_id,
  NULL                                                       AS condominio_id,        -- imoveis (Model B) não tem vínculo de condomínio
  i.created_at                                               AS created_at,
  i.updated_at                                               AS updated_at,
  p.full_name                                                AS corretor_nome,
  p.phone                                                    AS corretor_telefone,
  p.creci                                                    AS corretor_creci,
  p.avatar_url                                               AS corretor_avatar,
  NULL                                                       AS condominio_nome,
  JSON_UNQUOTE(JSON_EXTRACT(i.fotos, '$[0].url'))            AS imagem_thumb
FROM imoveis i
LEFT JOIN profiles p ON p.id = i.created_by;

-- ── imoveis_imagens: explode imoveis.fotos (JSON) em 1 linha por foto ────────
-- O front (useImovelImagens) ordena por `posicao` asc; a ordem do array já vem
-- com a foto principal primeiro (ETL). `ativo` permite o anonReadFilter da API
-- não vazar fotos de imóveis inativos.
CREATE OR REPLACE VIEW imoveis_imagens AS
SELECT
  CONCAT(i.id, '-', jt.posicao)  AS id,
  i.id                           AS imovel_id,
  jt.url                         AS arquivo,
  jt.url                         AS url,
  NULL                           AS pasta,
  jt.posicao                     AS posicao,
  NULL                           AS legenda,
  0                              AS tipo,
  i.ativo                        AS ativo
FROM imoveis i,
JSON_TABLE(
  i.fotos, '$[*]' COLUMNS (
    posicao FOR ORDINALITY,
    url     VARCHAR(1024) PATH '$.url'
  )
) AS jt;
