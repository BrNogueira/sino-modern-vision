-- ============================================================================
-- Migração: tabela `clientes` (proprietários + clientes/fornecedores) e coluna
-- imoveis.proprietario_id. Aplicar em bancos JÁ existentes (o db/schema.sql só
-- roda no 1º boot do container).
--
-- Idempotente: CREATE TABLE IF NOT EXISTS + ADD COLUMN guardado por
-- information_schema. Seguro reaplicar.
--
-- Uso:
--   docker exec -i sino-mysql mysql -uroot -psino_root sino < db/migrations/2026-06-19-clientes-proprietarios.sql
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS clientes (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  legacy_id    INT          NULL,
  nome         VARCHAR(200) NOT NULL,
  email        VARCHAR(160) NULL,
  telefone     VARCHAR(120) NULL,
  telefone_obs TEXT         NULL,
  endereco     VARCHAR(255) NULL,
  cidade       VARCHAR(160) NULL,
  estado       VARCHAR(60)  NULL DEFAULT 'Rio Grande do Sul',
  cep          VARCHAR(20)  NULL,
  tipo         ENUM('proprietario','cliente','fornecedor') NOT NULL DEFAULT 'cliente',
  corretor_id  CHAR(36)     NULL,
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

-- imoveis.proprietario_id (ADD COLUMN guardado — MySQL 8 não tem IF NOT EXISTS)
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'imoveis'
    AND COLUMN_NAME = 'proprietario_id');
SET @sql := IF(@col = 0,
  'ALTER TABLE imoveis ADD COLUMN proprietario_id CHAR(36) NULL AFTER proprietario_documento,
     ADD KEY idx_imoveis_proprietario (proprietario_id)',
  'SELECT "proprietario_id já existe" AS noop');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- leads.legacy_id (idempotência do import de contatos)
SET @lcol := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads'
    AND COLUMN_NAME = 'legacy_id');
SET @lsql := IF(@lcol = 0,
  'ALTER TABLE leads ADD COLUMN legacy_id INT NULL AFTER id,
     ADD UNIQUE KEY uq_leads_legacy (legacy_id)',
  'SELECT "leads.legacy_id já existe" AS noop');
PREPARE lstmt FROM @lsql; EXECUTE lstmt; DEALLOCATE PREPARE lstmt;
