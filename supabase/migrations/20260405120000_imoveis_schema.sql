-- ============================================================
-- FASE 1: Schema de Imóveis
-- Migração do banco legado (sinos7596_maya MySQL) para Supabase
-- Tabelas: categorias, cidades, imoveis, imoveis_imagens,
--          imoveis_historico, imoveis_caracteristicas
-- ============================================================


-- ============================================================
-- 1. CATEGORIAS
-- Origem: categorias_subcat (grupos: tipo_imovel, bairro,
--         faixa_valor, caracteristicas, acabamentos, etc.)
-- ============================================================

CREATE TABLE public.categorias (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id     INTEGER     UNIQUE,
  titulo        TEXT        NOT NULL,
  grupo         TEXT,       -- tipo_imovel | bairro | faixa_valor | caracteristicas | acabamentos | NULL
  posicao       INTEGER     DEFAULT 0,
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categorias_grupo   ON public.categorias (grupo);
CREATE INDEX idx_categorias_legacy  ON public.categorias (legacy_id);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler categorias (público)
CREATE POLICY "Public read categorias"
  ON public.categorias FOR SELECT USING (true);

-- Apenas admin/gerente podem gerenciar
CREATE POLICY "Admin manage categorias"
  ON public.categorias FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
  );


-- ============================================================
-- 2. CIDADES
-- Origem: cidades (id_cidade, dsc_cidade, cod_estado)
-- ============================================================

CREATE TABLE public.cidades (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id     INTEGER UNIQUE,
  nome          TEXT    NOT NULL,
  estado_codigo INTEGER,
  estado_sigla  TEXT    DEFAULT ''
);

CREATE INDEX idx_cidades_legacy      ON public.cidades (legacy_id);
CREATE INDEX idx_cidades_estado_sigla ON public.cidades (estado_sigla);
CREATE INDEX idx_cidades_nome        ON public.cidades (nome);

ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cidades"
  ON public.cidades FOR SELECT USING (true);

CREATE POLICY "Admin manage cidades"
  ON public.cidades FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- 3. IMOVEIS
-- Origem: produtos (tabela principal do sistema legado)
-- ============================================================

CREATE TABLE public.imoveis (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id     INTEGER     UNIQUE,

  -- Identificação
  cod_referencia TEXT,

  -- Conteúdo
  titulo        TEXT,
  titulo_ingles TEXT,
  descricao     TEXT,
  conteudo      TEXT,   -- conteúdo HTML completo
  meta_descricao TEXT,
  meta_keywords  TEXT,
  informacoes   TEXT,

  -- Classificação
  tipo          TEXT,           -- nome denormalizado do tipo (Casa, Apartamento...)
  tipo_legacy_id INTEGER,       -- FK legada → categorias_subcat.id (tipo_imovel)
  categoria_legacy_id INTEGER,  -- FK legada → categorias_subcat.id (categoria)

  -- Transação
  transacao     TEXT        NOT NULL DEFAULT 'venda',
  -- venda | aluguel | venda/aluguel
  preco         NUMERIC(15,2) DEFAULT 0,
  valor_aluguel NUMERIC(15,2),
  valor_corretor NUMERIC(15,2),
  iptu          NUMERIC(10,2)  DEFAULT 0,

  -- Localização
  cep           TEXT,
  cidade        TEXT,           -- nome denormalizado
  cidade_legacy_id INTEGER,     -- FK legada → cidades.id_cidade
  estado        TEXT            DEFAULT 'RS',
  bairro        TEXT,
  endereco      TEXT,
  latitude      NUMERIC(10,8),
  longitude     NUMERIC(11,8),

  -- Detalhes do imóvel
  dimensoes     TEXT,           -- dimensões/metragem (texto livre legado)
  area_total    NUMERIC(10,2),
  area_construida NUMERIC(10,2),
  dormitorios   TEXT,           -- texto legado (ex: "3" ou "3 sendo 1 suíte")
  quartos       INTEGER,        -- numero extraído
  suites        INTEGER,
  banheiros     INTEGER,
  vagas_garagem INTEGER,
  salas         INTEGER,
  lavabos       INTEGER,
  ano_construcao TEXT,
  status_obra   TEXT,           -- pronto | em_construcao | na_planta
  apto_financiamento TEXT,
  apto_financiamento_obs TEXT,
  acabamentos   TEXT,           -- texto semicolon-separated legado
  acabamentos_obs TEXT,
  caracteristicas_obs TEXT,

  -- Flags
  ativo         BOOLEAN NOT NULL DEFAULT true,
  destaque      BOOLEAN NOT NULL DEFAULT false,
  lancamento    BOOLEAN NOT NULL DEFAULT false,
  exclusivo     BOOLEAN NOT NULL DEFAULT false,
  tem_piscina   BOOLEAN NOT NULL DEFAULT false,
  viva_real     BOOLEAN NOT NULL DEFAULT false,

  -- Mídia
  imagem_principal TEXT,  -- path legado ou URL
  imagem_secundaria TEXT,
  video_url     TEXT,
  pdf_src       TEXT,

  -- Admin / interno
  posicao       INTEGER,
  ordena_admin  INTEGER,
  quantidade    INTEGER,
  placa         INTEGER,
  chave         INTEGER,
  tempo_venda   TEXT,
  como_achou    INTEGER DEFAULT 0,

  -- Jurídico (dados internos sensíveis)
  matricula     TEXT,
  matricula_obs TEXT,
  dados_proprietario TEXT,
  links         TEXT,
  dick          TEXT,
  proprietario_dick TEXT,

  -- Relações
  corretor_legacy_id  INTEGER,       -- FK legada → corretores.cor_id
  corretor_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  empreendimento_legacy_id INTEGER,  -- FK legada → empreendimentos.emp_id
  condominio_id       UUID REFERENCES public.condominios(id) ON DELETE SET NULL,

  -- Auditoria
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    UUID REFERENCES auth.users(id)
);

-- Indexes para buscas frequentes
CREATE INDEX idx_imoveis_legacy_id    ON public.imoveis (legacy_id);
CREATE INDEX idx_imoveis_ativo        ON public.imoveis (ativo);
CREATE INDEX idx_imoveis_destaque     ON public.imoveis (destaque);
CREATE INDEX idx_imoveis_transacao    ON public.imoveis (transacao);
CREATE INDEX idx_imoveis_tipo         ON public.imoveis (tipo);
CREATE INDEX idx_imoveis_cidade       ON public.imoveis (cidade);
CREATE INDEX idx_imoveis_estado       ON public.imoveis (estado);
CREATE INDEX idx_imoveis_bairro       ON public.imoveis (bairro);
CREATE INDEX idx_imoveis_preco        ON public.imoveis (preco);
CREATE INDEX idx_imoveis_corretor_id  ON public.imoveis (corretor_id);
CREATE INDEX idx_imoveis_condominio   ON public.imoveis (condominio_id);
CREATE INDEX idx_imoveis_lancamento   ON public.imoveis (lancamento);

-- Full-text search em português
CREATE INDEX idx_imoveis_fts ON public.imoveis
  USING gin(to_tsvector('portuguese', coalesce(titulo,'') || ' ' || coalesce(descricao,'') || ' ' || coalesce(bairro,'') || ' ' || coalesce(cidade,'')));

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

-- Leitura pública para imóveis ativos
CREATE POLICY "Public read imoveis ativos"
  ON public.imoveis FOR SELECT
  USING (ativo = true);

-- Autenticados veem todos (inclusive inativos)
CREATE POLICY "Authenticated read all imoveis"
  ON public.imoveis FOR SELECT TO authenticated
  USING (true);

-- Admin e gerente: acesso total
CREATE POLICY "Admin gerente manage imoveis"
  ON public.imoveis FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
  );

-- Corretor: edita apenas seus próprios imóveis
CREATE POLICY "Corretor manage own imoveis"
  ON public.imoveis FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'corretor')
    AND corretor_id = auth.uid()
  );


-- ============================================================
-- 4. IMOVEIS_IMAGENS
-- Origem: img_pasta_prod (galeria de fotos por imóvel)
-- ============================================================

CREATE TABLE public.imoveis_imagens (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id     INTEGER,
  imovel_id     UUID    REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imovel_legacy_id INTEGER,
  pasta         TEXT,   -- pasta no sistema legado (ex: '20140821101322')
  arquivo       TEXT,   -- filename legado (ex: '21082014101325.jpg')
  url           TEXT,   -- URL final (após migrar p/ Supabase Storage)
  posicao       INTEGER DEFAULT 0,
  legenda       TEXT,
  tipo          INTEGER DEFAULT 1,  -- 1=imóvel, 2=área_comum
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_imoveis_imagens_imovel   ON public.imoveis_imagens (imovel_id);
CREATE INDEX idx_imoveis_imagens_legacy   ON public.imoveis_imagens (imovel_legacy_id);
CREATE INDEX idx_imoveis_imagens_posicao  ON public.imoveis_imagens (posicao);

ALTER TABLE public.imoveis_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read imoveis_imagens"
  ON public.imoveis_imagens FOR SELECT USING (true);

CREATE POLICY "Admin manage imoveis_imagens"
  ON public.imoveis_imagens FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
    OR public.has_role(auth.uid(), 'corretor')
  );


-- ============================================================
-- 5. IMOVEIS_CARACTERISTICAS  (tabela junction N:N)
-- Origem: produtos_caract (produto_id, caract_id)
-- ============================================================

CREATE TABLE public.imoveis_caracteristicas (
  imovel_id                UUID REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imovel_legacy_id         INTEGER,
  caracteristica_id        UUID REFERENCES public.categorias(id) ON DELETE CASCADE,
  caracteristica_legacy_id INTEGER,
  PRIMARY KEY (imovel_id, caracteristica_id)
);

CREATE INDEX idx_imoveis_caract_imovel ON public.imoveis_caracteristicas (imovel_id);
CREATE INDEX idx_imoveis_caract_categ  ON public.imoveis_caracteristicas (caracteristica_id);

ALTER TABLE public.imoveis_caracteristicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read imoveis_caracteristicas"
  ON public.imoveis_caracteristicas FOR SELECT USING (true);

CREATE POLICY "Admin manage imoveis_caracteristicas"
  ON public.imoveis_caracteristicas FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
    OR public.has_role(auth.uid(), 'corretor')
  );


-- ============================================================
-- 6. IMOVEIS_HISTORICO
-- Origem: alteracoes (histórico de mudanças de valor/status)
-- ============================================================

CREATE TABLE public.imoveis_historico (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id        INTEGER     UNIQUE,
  imovel_id        UUID        REFERENCES public.imoveis(id) ON DELETE CASCADE,
  imovel_legacy_id INTEGER,
  campo            TEXT        NOT NULL DEFAULT 'preco',
  valor_anterior   TEXT,
  valor_novo       TEXT,
  observacao       TEXT,
  created_by       UUID        REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_imoveis_historico_imovel ON public.imoveis_historico (imovel_id);
CREATE INDEX idx_imoveis_historico_legacy ON public.imoveis_historico (imovel_legacy_id);

ALTER TABLE public.imoveis_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read imoveis_historico"
  ON public.imoveis_historico FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage imoveis_historico"
  ON public.imoveis_historico FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gerente')
  );


-- ============================================================
-- 7. TRIGGER: atualiza updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 8. VIEW: imoveis_completo (para queries simplificadas)
-- ============================================================

CREATE VIEW public.imoveis_completo AS
SELECT
  i.*,
  p.full_name  AS corretor_nome,
  p.phone      AS corretor_telefone,
  p.creci      AS corretor_creci,
  p.avatar_url AS corretor_avatar,
  c.nome       AS condominio_nome,
  (
    SELECT url FROM public.imoveis_imagens
    WHERE imovel_id = i.id AND posicao = 0
    ORDER BY posicao ASC LIMIT 1
  ) AS imagem_thumb
FROM public.imoveis i
LEFT JOIN public.profiles p ON p.id = i.corretor_id
LEFT JOIN public.condominios c ON c.id = i.condominio_id;


-- ============================================================
-- 9. FUNÇÃO: busca full-text de imóveis
-- ============================================================

CREATE OR REPLACE FUNCTION public.buscar_imoveis(
  _query      TEXT    DEFAULT NULL,
  _transacao  TEXT    DEFAULT NULL,
  _tipo       TEXT    DEFAULT NULL,
  _cidade     TEXT    DEFAULT NULL,
  _bairro     TEXT    DEFAULT NULL,
  _preco_min  NUMERIC DEFAULT NULL,
  _preco_max  NUMERIC DEFAULT NULL,
  _destaque   BOOLEAN DEFAULT NULL,
  _lancamento BOOLEAN DEFAULT NULL,
  _limit      INTEGER DEFAULT 20,
  _offset     INTEGER DEFAULT 0
)
RETURNS SETOF public.imoveis_completo
LANGUAGE sql STABLE AS $$
  SELECT * FROM public.imoveis_completo
  WHERE ativo = true
    AND (_transacao IS NULL  OR transacao  = _transacao)
    AND (_tipo      IS NULL  OR tipo       ILIKE _tipo)
    AND (_cidade    IS NULL  OR cidade     ILIKE _cidade)
    AND (_bairro    IS NULL  OR bairro     ILIKE _bairro)
    AND (_preco_min IS NULL  OR preco     >= _preco_min)
    AND (_preco_max IS NULL  OR preco     <= _preco_max)
    AND (_destaque  IS NULL  OR destaque   = _destaque)
    AND (_lancamento IS NULL OR lancamento = _lancamento)
    AND (
      _query IS NULL
      OR to_tsvector('portuguese', coalesce(titulo,'') || ' ' || coalesce(descricao,'') || ' ' || coalesce(bairro,'') || ' ' || coalesce(cidade,''))
         @@ plainto_tsquery('portuguese', _query)
    )
  ORDER BY destaque DESC, posicao ASC NULLS LAST, created_at DESC
  LIMIT _limit
  OFFSET _offset;
$$;
