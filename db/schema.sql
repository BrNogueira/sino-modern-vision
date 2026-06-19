-- ============================================================================
-- sino-modern-vision — Schema MySQL (TurboCloud)
--
-- Fonte da verdade: schema VIVO do Supabase (src/integrations/supabase/types.ts),
-- "Model B" (lovable-new) — o que o app realmente usa. O "Model A" legacy-mapped
-- (imoveis_completo / imoveis_imagens / cidades / corretores_legado) era código
-- morto nunca aplicado e foi descartado.
--
-- Diferenças vs Postgres/Supabase:
--   • RLS removida → enforcement no backend (middleware Hono).
--   • UUID gen_random_uuid()  → CHAR(36) DEFAULT (UUID())
--   • TIMESTAMPTZ             → DATETIME (UTC na aplicação)
--   • NUMERIC                 → DECIMAL
--   • BOOLEAN                 → TINYINT(1)
--   • jsonb / text[]          → JSON
--   • enum app_role           → ENUM(...)
--   • busca to_tsvector/GIN   → índice FULLTEXT + MATCH ... AGAINST
--
-- Tabelas do Better-auth (user/session/account/verification) NÃO estão aqui —
-- são criadas por `server` via `npm run auth:migrate`. Por isso created_by /
-- user_id / corretor_id são CHAR(36) sem FK rígida (enforce na aplicação),
-- evitando dependência de ordem de criação.
--
-- Requer MySQL 8.0+ (JSON defaults, DEFAULT (UUID()), FULLTEXT InnoDB).
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ── categorias (tipos/segmentos exibidos no site e admin) ───────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  nome        VARCHAR(160) NOT NULL,
  slug        VARCHAR(180) NOT NULL,
  descricao   TEXT         NULL,
  foto_url    TEXT         NULL,
  ordem       INT          NOT NULL DEFAULT 0,
  ativo       TINYINT(1)   NOT NULL DEFAULT 1,
  created_by  CHAR(36)     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_slug (slug),
  KEY idx_categorias_ativo (ativo),
  KEY idx_categorias_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── condominios ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS condominios (
  id                CHAR(36)     NOT NULL DEFAULT (UUID()),
  nome              VARCHAR(200) NOT NULL,
  endereco          VARCHAR(255) NULL,
  bairro            VARCHAR(160) NULL,
  cidade            VARCHAR(160) NULL,
  estado            VARCHAR(60)  NULL DEFAULT 'RS',
  cep               VARCHAR(12)  NULL,
  sindico           VARCHAR(160) NULL,
  telefone_sindico  VARCHAR(40)  NULL,
  administradora    VARCHAR(160) NULL,
  valor_condominio  DECIMAL(10,2) NULL DEFAULT 0.00,
  qtd_unidades      INT          NULL DEFAULT 0,
  qtd_blocos        INT          NULL DEFAULT 0,
  tem_portaria      TINYINT(1)   NULL DEFAULT 0,
  tem_elevador      TINYINT(1)   NULL DEFAULT 0,
  tem_piscina       TINYINT(1)   NULL DEFAULT 0,
  tem_salao_festas  TINYINT(1)   NULL DEFAULT 0,
  tem_churrasqueira TINYINT(1)   NULL DEFAULT 0,
  tem_academia      TINYINT(1)   NULL DEFAULT 0,
  observacoes       TEXT         NULL,
  fotos             JSON         NOT NULL DEFAULT (JSON_ARRAY()),
  ativo             TINYINT(1)   NOT NULL DEFAULT 1,
  created_by        CHAR(36)     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_condominios_ativo (ativo),
  KEY idx_condominios_cidade (cidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── imoveis (tabela principal — Model B) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS imoveis (
  id                     CHAR(36)      NOT NULL DEFAULT (UUID()),
  codigo_imovel          VARCHAR(64)   NOT NULL,
  titulo_imovel          VARCHAR(255)  NOT NULL,
  tipo_imovel            VARCHAR(120)  NOT NULL,
  sub_tipo_imovel        VARCHAR(120)  NOT NULL,
  categoria_imovel       VARCHAR(120)  NOT NULL DEFAULT 'Padrão',
  categoria_id           CHAR(36)      NULL,
  tipo_oferta            INT           NOT NULL DEFAULT 1,
  modalidade             JSON          NOT NULL DEFAULT (JSON_ARRAY()),

  -- Localização
  cep            VARCHAR(12)  NOT NULL DEFAULT '',
  estado         VARCHAR(60)  NOT NULL DEFAULT 'Rio Grande do Sul',
  cidade         VARCHAR(160) NOT NULL DEFAULT '',
  zona           VARCHAR(120) NULL,
  bairro         VARCHAR(160) NULL,
  endereco       VARCHAR(255) NULL,
  numero         VARCHAR(30)  NULL,
  complemento    VARCHAR(160) NULL,
  latitude       VARCHAR(64)  NULL,
  longitude      VARCHAR(64)  NULL,

  -- Valores
  preco_venda      DECIMAL(15,2) NULL,
  preco_aluguel    DECIMAL(15,2) NULL,
  iptu             DECIMAL(10,2) NULL,
  valor_condominio DECIMAL(10,2) NULL,

  -- Características
  area_total       DECIMAL(12,2) NULL,
  area_util        DECIMAL(12,2) NULL,
  area_dimensions  TEXT          NULL,
  qtd_dormitorios  INT           NULL,
  qtd_suites       INT           NULL,
  qtd_banheiros    INT           NULL,
  qtd_vagas        INT           NULL,
  ano_construcao   INT           NULL,

  -- Conteúdo / mídia
  observacao       TEXT NULL,
  descricao_curta  TEXT NULL,
  fotos            JSON NOT NULL DEFAULT (JSON_ARRAY()),
  video_url        TEXT NULL,
  link_tour_virtual TEXT NULL,
  features         JSON NOT NULL DEFAULT (JSON_OBJECT()),
  garantias        JSON NOT NULL DEFAULT (JSON_OBJECT()),

  -- Proprietário (interno)
  proprietario_nome      VARCHAR(200) NULL,
  proprietario_telefone  VARCHAR(40)  NULL,
  proprietario_email     VARCHAR(160) NULL,
  proprietario_documento VARCHAR(40)  NULL,
  proprietario_id        CHAR(36)     NULL,  -- → clientes.id (sem FK rígida; enforce no app)

  -- Flags
  ativo      TINYINT(1) NOT NULL DEFAULT 1,
  destaque   TINYINT(1) NOT NULL DEFAULT 0,
  exclusivo  TINYINT(1) NOT NULL DEFAULT 0,

  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_imoveis_codigo (codigo_imovel),
  KEY idx_imoveis_ativo (ativo),
  KEY idx_imoveis_destaque (destaque),
  KEY idx_imoveis_cidade_bairro (cidade, bairro),
  KEY idx_imoveis_tipo (tipo_imovel),
  KEY idx_imoveis_categoria (categoria_id),
  KEY idx_imoveis_preco_venda (preco_venda),
  KEY idx_imoveis_proprietario (proprietario_id),
  CONSTRAINT fk_imoveis_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (id) ON DELETE SET NULL,
  FULLTEXT KEY ft_imoveis (titulo_imovel, descricao_curta, bairro, cidade, observacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── leads ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  legacy_id           INT          NULL,
  nome                VARCHAR(200) NOT NULL,
  email               VARCHAR(160) NULL,
  telefone            VARCHAR(40)  NULL,
  origem              VARCHAR(60)  NULL DEFAULT 'site',
  interesse           TEXT         NULL,
  tipo_interesse      VARCHAR(40)  NULL DEFAULT 'compra',
  faixa_preco_min     DECIMAL(15,2) NULL DEFAULT 0.00,
  faixa_preco_max     DECIMAL(15,2) NULL DEFAULT 0.00,
  bairros_interesse   TEXT         NULL,
  observacoes         TEXT         NULL,
  status              VARCHAR(40)  NOT NULL DEFAULT 'novo',
  corretor_id         CHAR(36)     NULL,
  imovel_interesse_id VARCHAR(64)  NULL,
  created_by          CHAR(36)     NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_leads_legacy (legacy_id),
  KEY idx_leads_status (status),
  KEY idx_leads_corretor (corretor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── clientes (proprietários de imóveis + clientes/fornecedores do legado) ───
--   Migrados de `clientes` do dump ArtWeb. `legacy_id` = id antigo (de-para p/
--   vincular imoveis.proprietario_id). `tipo` derivado: quem é referenciado por
--   algum produto.dados_proprietario vira 'proprietario'; tipo=1 → 'fornecedor'.
CREATE TABLE IF NOT EXISTS clientes (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  legacy_id    INT          NULL,
  nome         VARCHAR(200) NOT NULL,
  email        VARCHAR(160) NULL,
  telefone     VARCHAR(120) NULL,                       -- 1º número normalizado
  telefone_obs TEXT         NULL,                       -- texto bruto original (ex.: "ligar à tarde")
  endereco     VARCHAR(255) NULL,
  cidade       VARCHAR(160) NULL,
  estado       VARCHAR(60)  NULL DEFAULT 'Rio Grande do Sul',
  cep          VARCHAR(20)  NULL,
  tipo         ENUM('proprietario','cliente','fornecedor') NOT NULL DEFAULT 'cliente',
  corretor_id  CHAR(36)     NULL,                       -- responsável (de-para corretor legado)
  observacoes  TEXT         NULL,
  ativo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_legacy (legacy_id),
  KEY idx_clientes_nome (nome),
  KEY idx_clientes_email (email),
  KEY idx_clientes_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── profiles (espelho do usuário Better-auth; id = user.id) ─────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          CHAR(36)     NOT NULL,
  full_name   VARCHAR(200) NOT NULL DEFAULT '',
  email       VARCHAR(160) NOT NULL DEFAULT '',
  phone       VARCHAR(40)  NULL DEFAULT '',
  creci       VARCHAR(60)  NULL DEFAULT '',
  avatar_url  TEXT         NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_profiles_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── user_roles (RBAC; substitui RLS — enforcement no backend) ───────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36) NOT NULL,
  role       ENUM('admin','corretor','financeiro','gerente') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_roles (user_id, role),
  KEY idx_user_roles_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── role_permissions (matriz de acesso por módulo) ──────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  role       ENUM('admin','corretor','financeiro','gerente') NOT NULL,
  module     VARCHAR(60) NOT NULL,
  can_view   TINYINT(1) NOT NULL DEFAULT 0,
  can_edit   TINYINT(1) NOT NULL DEFAULT 0,
  can_delete TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_role_module (role, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── site_settings (chave/valor de configuração do site) ─────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  `key`       VARCHAR(191) NOT NULL,
  value       TEXT NULL,
  description TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: matriz de permissões por papel (reference data lida pelo app) ─────
INSERT INTO role_permissions (id, role, module, can_view, can_edit, can_delete) VALUES
  (UUID(),'admin','dashboard',1,1,1),(UUID(),'admin','imoveis',1,1,1),
  (UUID(),'admin','usuarios',1,1,1),(UUID(),'admin','condominios',1,1,1),
  (UUID(),'admin','leads',1,1,1),(UUID(),'admin','agenda',1,1,1),
  (UUID(),'admin','relatorios',1,1,1),(UUID(),'admin','configuracoes',1,1,1),
  (UUID(),'admin','canal_pro',1,1,1),(UUID(),'admin','corretores',1,1,1),
  (UUID(),'admin','financeiro',1,1,1),
  (UUID(),'gerente','dashboard',1,1,0),(UUID(),'gerente','imoveis',1,1,1),
  (UUID(),'gerente','usuarios',1,0,0),(UUID(),'gerente','condominios',1,1,0),
  (UUID(),'gerente','leads',1,1,1),(UUID(),'gerente','agenda',1,1,1),
  (UUID(),'gerente','relatorios',1,1,0),(UUID(),'gerente','configuracoes',0,0,0),
  (UUID(),'gerente','canal_pro',1,1,0),(UUID(),'gerente','corretores',1,1,0),
  (UUID(),'gerente','financeiro',1,0,0),
  (UUID(),'corretor','dashboard',1,0,0),(UUID(),'corretor','imoveis',1,1,0),
  (UUID(),'corretor','usuarios',0,0,0),(UUID(),'corretor','condominios',0,0,0),
  (UUID(),'corretor','leads',1,1,0),(UUID(),'corretor','agenda',1,1,1),
  (UUID(),'corretor','relatorios',0,0,0),(UUID(),'corretor','configuracoes',0,0,0),
  (UUID(),'corretor','canal_pro',0,0,0),(UUID(),'corretor','corretores',0,0,0),
  (UUID(),'corretor','financeiro',0,0,0),
  (UUID(),'financeiro','dashboard',1,0,0),(UUID(),'financeiro','imoveis',1,0,0),
  (UUID(),'financeiro','usuarios',0,0,0),(UUID(),'financeiro','condominios',1,0,0),
  (UUID(),'financeiro','leads',0,0,0),(UUID(),'financeiro','agenda',1,1,0),
  (UUID(),'financeiro','relatorios',1,1,0),(UUID(),'financeiro','configuracoes',0,0,0),
  (UUID(),'financeiro','canal_pro',0,0,0),(UUID(),'financeiro','corretores',0,0,0),
  (UUID(),'financeiro','financeiro',1,1,1)
ON DUPLICATE KEY UPDATE
  can_view=VALUES(can_view), can_edit=VALUES(can_edit), can_delete=VALUES(can_delete);
