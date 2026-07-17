-- ============================================================================
-- Migração: tabela `system_logs` — trilha de auditoria do sistema (cadastros,
-- edições, exclusões de imóveis, leads, alterações de corretores etc.).
-- Alimenta o sino de notificações do admin e a página /admin/logs.
--
-- Idempotente: CREATE TABLE IF NOT EXISTS. Seguro reaplicar.
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS system_logs (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  tipo        VARCHAR(30)  NOT NULL,             -- imovel | lead | usuario | sistema
  acao        VARCHAR(30)  NOT NULL,             -- criado | atualizado | excluido | login | ...
  entidade    VARCHAR(120) NULL,                 -- rótulo curto (ex.: cód/título do imóvel, nome do lead)
  entidade_id VARCHAR(64)  NULL,                 -- id/código para navegação
  descricao   VARCHAR(500) NOT NULL,             -- frase legível exibida na notificação/log
  usuario     VARCHAR(160) NULL,                 -- nome de quem fez
  role        VARCHAR(30)  NULL,
  dados       JSON         NULL,                 -- payload extra (campo alterado, valores etc.)
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_system_logs_created (created_at),
  KEY idx_system_logs_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
