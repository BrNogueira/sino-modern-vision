// ============================================================================
// Camada de dados REST por recurso (/api/data/<tabela>) consumida pelo shim
// supabase.from(). Política de acesso por recurso substitui a RLS do Supabase.
// ============================================================================
import { Hono } from "hono";
import { makeCrudRouter, type ResourceConfig } from "../lib/crud.js";

const STAFF: ResourceConfig["writeRoles"] = ["admin", "gerente", "corretor"];

const RESOURCES: ResourceConfig[] = [
  // Site público lê imóveis ativos; equipe gerencia.
  {
    table: "imoveis",
    publicRead: true,
    anonReadFilter: { col: "ativo", value: 1 },
    writeRoles: STAFF,
    defaultOrder: "created_at.desc",
    searchColumns: ["titulo_imovel", "codigo_imovel", "cidade", "bairro"],
  },
  // Read-models de compatibilidade (Model A) — VIEWS read-only sobre `imoveis`
  // (ver db/views.sql). O site público lê por aqui; escrita vai em `imoveis`.
  {
    table: "imoveis_completo",
    publicRead: true,
    anonReadFilter: { col: "ativo", value: 1 },
    defaultOrder: "created_at.desc",
  },
  { table: "imoveis_imagens", publicRead: true, anonReadFilter: { col: "ativo", value: 1 } },

  { table: "categorias", publicRead: true, writeRoles: ["admin", "gerente"], defaultOrder: "ordem.asc" },
  { table: "condominios", publicRead: true, writeRoles: ["admin", "gerente"] },
  { table: "site_settings", pk: "key", publicRead: true, writeRoles: ["admin"] },

  // Leads: criados pelo formulário público; geridos pela equipe (leitura autenticada).
  {
    table: "leads",
    publicInsert: true,
    writeRoles: STAFF,
    defaultOrder: "created_at.desc",
    searchColumns: ["nome", "email", "telefone"],
  },

  // Clientes/proprietários (CRM interno; leitura autenticada).
  {
    table: "clientes",
    writeRoles: STAFF,
    defaultOrder: "nome.asc",
    searchColumns: ["nome", "email", "telefone"],
  },

  // Agenda/calendário de visitas e compromissos (leitura autenticada).
  {
    table: "agenda_eventos",
    writeRoles: STAFF,
    defaultOrder: "data_inicio.asc",
    searchColumns: ["titulo", "local", "contato_nome", "imovel_label"],
  },

  // Internos (exigem login; escrita restrita).
  { table: "profiles", writeRoles: ["admin"] },
  { table: "user_roles", writeRoles: ["admin"] },
  { table: "role_permissions", writeRoles: ["admin"] },
];

export const dataRouter = new Hono();
for (const r of RESOURCES) dataRouter.route(`/${r.table}`, makeCrudRouter(r));

export const DATA_RESOURCES = RESOURCES.map((r) => r.table);
