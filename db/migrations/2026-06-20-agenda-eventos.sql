-- ============================================================================
-- Migração: tabela `agenda_eventos` — agenda/calendário de visitas e
-- compromissos dos corretores. Vincula a imóvel, lead/cliente e corretor.
--
-- Os vínculos guardam FK + um snapshot denormalizado (label/nome/telefone) para
-- a grade do calendário carregar em 1 query, sem joins (mesma estratégia de
-- imoveis.proprietario_nome). O módulo de permissão 'agenda' já existe em
-- role_permissions (schema.sql).
--
-- Idempotente: CREATE TABLE IF NOT EXISTS. Seguro reaplicar.
--
-- Uso (produção, MariaDB via socket):
--   set -a; . server/.env; set +a
--   mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -S "$MYSQL_SOCKET" "$MYSQL_DATABASE" \
--     < db/migrations/2026-06-20-agenda-eventos.sql
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS agenda_eventos (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  tipo            ENUM('visita','reuniao','ligacao','avaliacao') NOT NULL DEFAULT 'visita',
  titulo          VARCHAR(200) NOT NULL,
  descricao       TEXT         NULL,
  data_inicio     DATETIME     NOT NULL,
  data_fim        DATETIME     NULL,
  status          ENUM('agendado','confirmado','realizado','cancelado','nao_compareceu')
                               NOT NULL DEFAULT 'agendado',
  local           VARCHAR(255) NULL,

  -- vínculo imóvel (FK + snapshot)
  imovel_id       CHAR(36)     NULL,
  imovel_label    VARCHAR(255) NULL,

  -- vínculo contato (lead OU cliente — polimórfico + snapshot)
  contato_tipo    ENUM('lead','cliente') NULL,
  contato_id      CHAR(36)     NULL,
  contato_nome    VARCHAR(200) NULL,
  contato_telefone VARCHAR(120) NULL,

  -- corretor responsável (FK profiles/user + snapshot)
  corretor_id     CHAR(36)     NULL,
  corretor_nome   VARCHAR(200) NULL,

  created_by      CHAR(36)     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_agenda_data (data_inicio),
  KEY idx_agenda_corretor (corretor_id),
  KEY idx_agenda_imovel (imovel_id),
  KEY idx_agenda_status (status),
  KEY idx_agenda_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
