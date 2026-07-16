-- ============================================================================
-- Corrige a matriz de permissões: equipe (corretor/gerente) passa a poder
-- visualizar e editar/cadastrar imóveis e condomínios. Idempotente: cria a
-- linha se faltar; se existir, só liga can_view/can_edit (can_delete intacto).
-- ============================================================================
INSERT INTO role_permissions (id, role, module, can_view, can_edit, can_delete) VALUES
  (UUID(), 'corretor', 'imoveis',     1, 1, 0),
  (UUID(), 'corretor', 'condominios', 1, 1, 0),
  (UUID(), 'gerente',  'imoveis',     1, 1, 1),
  (UUID(), 'gerente',  'condominios', 1, 1, 0),
  (UUID(), 'admin',    'imoveis',     1, 1, 1),
  (UUID(), 'admin',    'condominios', 1, 1, 1)
ON DUPLICATE KEY UPDATE can_view = 1, can_edit = 1;
