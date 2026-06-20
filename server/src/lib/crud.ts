// ============================================================================
// Factory de routers REST por recurso (MySQL), consumida pelo shim do front
// (supabase.from()). Adaptado do 4k-intelligence para MySQL + modelo de papéis
// (sem tenant). Substitui a RLS do Supabase por política de acesso por recurso.
//
// MySQL specifics vs Postgres:
//   • placeholders `?` (não $n)        • identificadores em backticks
//   • sem RETURNING → re-SELECT          • ILIKE → LIKE (collation ci)
//   • colunas via information_schema com table_schema = DATABASE()
//   • PK UUID gerada no app (CHAR(36)) p/ permitir re-SELECT pós-insert
// ============================================================================
import { Hono, type Context } from "hono";
import type { RowDataPacket } from "mysql2";
import { pool, DB_NAME } from "../db/client.js";
import { requireAuth, type Role, type AuthCtx } from "../middleware/auth.js";

export interface ResourceConfig {
  table: string;
  pk?: string;
  /** Leitura sem login (site público). */
  publicRead?: boolean;
  /** Insert sem login (ex.: formulário de contato → leads). */
  publicInsert?: boolean;
  /** Papéis que podem inserir/editar/excluir. Default: nenhum (só leitura). */
  writeRoles?: Role[];
  /** Filtro forçado para leitores anônimos (ex.: {col:'ativo',value:1}). */
  anonReadFilter?: { col: string; value: unknown };
  defaultOrder?: string;
  /** Colunas pesquisáveis via ?q=termo (LIKE %termo%) */
  searchColumns?: string[];
}

const _colCache = new Map<string, Set<string>>();
async function loadColumns(table: string): Promise<Set<string>> {
  const cached = _colCache.get(table);
  if (cached) return cached;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ?`,
    [DB_NAME, table],
  );
  const set = new Set<string>(rows.map((r) => r.column_name ?? r.COLUMN_NAME));
  _colCache.set(table, set);
  return set;
}

const IDENT = /^[a-z_][a-z0-9_]*$/i;
const OPS: Record<string, string> = {
  eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=",
  like: "LIKE", ilike: "LIKE", // MySQL é case-insensitive por collation
};

function qIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`identificador inválido: ${name}`);
  return `\`${name}\``;
}

type Filter = { col: string; op: string; value: unknown };

function buildWhere(filters: Filter[], allowed: Set<string>) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const f of filters) {
    if (!allowed.has(f.col)) throw new HttpError(400, `coluna não permitida: ${f.col}`);
    if (f.op === "in") {
      const arr = Array.isArray(f.value) ? f.value : String(f.value).split(",");
      if (arr.length === 0) { clauses.push("1=0"); continue; }
      clauses.push(`${qIdent(f.col)} IN (${arr.map(() => "?").join(",")})`);
      params.push(...arr);
    } else if (f.op === "is") {
      const v = f.value;
      if (v === null || v === "null") clauses.push(`${qIdent(f.col)} IS NULL`);
      else if (v === "not.null" || v === "not null" || v === "notnull")
        clauses.push(`${qIdent(f.col)} IS NOT NULL`);
      else { clauses.push(`${qIdent(f.col)} = ?`); params.push(v); }
    } else {
      const sqlOp = OPS[f.op];
      if (!sqlOp) throw new HttpError(400, `operador não suportado: ${f.op}`);
      clauses.push(`${qIdent(f.col)} ${sqlOp} ?`);
      params.push(f.value);
    }
  }
  return { clauses, params };
}

const RESERVED_PARAMS = new Set(["select", "order", "limit", "offset", "single", "count", "q"]);

// Aceita múltiplos valores por coluna (ex.: ?preco_venda=gte.100&preco_venda=lte.500),
// permitindo filtros de faixa. Cada valor vira um Filter (combinados via AND).
function parseQueryFilters(query: Record<string, string[]>, allowed: Set<string>): Filter[] {
  const out: Filter[] = [];
  for (const [key, vals] of Object.entries(query)) {
    if (RESERVED_PARAMS.has(key)) continue;
    if (!allowed.has(key)) continue;
    for (const raw of vals) {
      const m = /^(eq|neq|gt|gte|lt|lte|like|ilike|in|is)\.(.*)$/s.exec(raw);
      if (m) {
        const op = m[1]!;
        const rest = m[2] ?? "";
        const val = op === "in" ? rest.replace(/^\(|\)$/g, "").split(",") : rest;
        out.push({ col: key, op, value: val });
      } else {
        out.push({ col: key, op: "eq", value: raw });
      }
    }
  }
  return out;
}

function buildSelect(select: string | undefined, allowed: Set<string>): string {
  if (!select || select.trim() === "*") return "*";
  const cols = select.split(",").map((s) => s.trim()).filter(Boolean).filter((c) => allowed.has(c));
  return cols.length ? cols.map(qIdent).join(", ") : "*";
}

function buildOrder(order: string | undefined, allowed: Set<string>): string {
  if (!order) return "";
  const parts: string[] = [];
  for (const seg of order.split(",")) {
    const [col, dir] = seg.split(".");
    if (!col || !allowed.has(col)) continue;
    parts.push(`${qIdent(col)} ${dir?.toLowerCase() === "desc" ? "DESC" : "ASC"}`);
  }
  return parts.length ? ` ORDER BY ${parts.join(", ")}` : "";
}

/** Serializa objetos/arrays para colunas JSON do MySQL. */
function normalizeValue(v: unknown): unknown {
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return v;
}

export function makeCrudRouter(cfg: ResourceConfig): Hono {
  const router = new Hono();
  const pk = cfg.pk ?? "id";
  const writeRoles = cfg.writeRoles ?? [];

  function canWrite(ctx: AuthCtx | undefined): boolean {
    return !!ctx && ctx.roles.some((r) => writeRoles.includes(r));
  }

  // Leitura: pública (se publicRead) ou autenticada.
  async function readGuard(c: Context): Promise<{ anon: boolean }> {
    const ctx = c.get("auth");
    if (ctx) return { anon: false };
    if (cfg.publicRead) return { anon: true };
    throw new HttpError(401, "unauthorized");
  }

  // GET / — list
  router.get("/", async (c) => {
    try {
      const { anon } = await readGuard(c);
      const allowed = await loadColumns(cfg.table);
      const q = c.req.query();
      const filters = parseQueryFilters(c.req.queries(), allowed);
      if (anon && cfg.anonReadFilter && allowed.has(cfg.anonReadFilter.col))
        filters.push({ col: cfg.anonReadFilter.col, op: "eq", value: cfg.anonReadFilter.value });

      const { clauses, params } = buildWhere(filters, allowed);
      if (q.q?.trim() && cfg.searchColumns?.length) {
        const term = `%${q.q.trim()}%`;
        const parts = cfg.searchColumns.filter((c) => allowed.has(c)).map((c) => `${qIdent(c)} LIKE ?`);
        if (parts.length) {
          clauses.push(`(${parts.join(" OR ")})`);
          params.push(...parts.map(() => term));
        }
      }
      const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
      const sel = buildSelect(q.select, allowed);
      const order = buildOrder(q.order ?? cfg.defaultOrder, allowed);
      let total: number | undefined;
      if (q.count === "exact") {
        const [countRows] = await pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS cnt FROM ${qIdent(cfg.table)}${where}`,
          params,
        );
        total = Number((countRows[0] as RowDataPacket)?.cnt ?? 0);
      }

      let sql = `SELECT ${sel} FROM ${qIdent(cfg.table)}${where}${order}`;
      if (q.limit !== undefined) {
        const limit = Math.min(Math.max(parseInt(q.limit, 10) || 0, 0), 1000);
        const offset = q.offset ? parseInt(q.offset, 10) || 0 : 0;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }
      const [rows] = await pool.query<RowDataPacket[]>(sql, params);
      if (q.single === "true") return c.json(rows[0] ?? null);
      if (q.count === "exact") return c.json({ data: rows, total: total ?? rows.length });
      return c.json(rows);
    } catch (e) { return errJson(c, e); }
  });

  // GET /:id
  router.get("/:id", async (c) => {
    try {
      const { anon } = await readGuard(c);
      const allowed = await loadColumns(cfg.table);
      const filters: Filter[] = [{ col: pk, op: "eq", value: c.req.param("id") }];
      if (anon && cfg.anonReadFilter && allowed.has(cfg.anonReadFilter.col))
        filters.push({ col: cfg.anonReadFilter.col, op: "eq", value: cfg.anonReadFilter.value });
      const { clauses, params } = buildWhere(filters, allowed);
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM ${qIdent(cfg.table)} WHERE ${clauses.join(" AND ")} LIMIT 1`, params,
      );
      return c.json(rows[0] ?? null);
    } catch (e) { return errJson(c, e); }
  });

  // POST / — insert (objeto ou array). Pública só se publicInsert.
  router.post("/", async (c) => {
    try {
      const ctx = c.get("auth");
      if (!canWrite(ctx) && !cfg.publicInsert) throw new HttpError(ctx ? 403 : 401, ctx ? "forbidden" : "unauthorized");
      const allowed = await loadColumns(cfg.table);
      const body = await c.req.json();
      const rows: Record<string, unknown>[] = Array.isArray(body) ? body : [body];
      const out: unknown[] = [];
      for (const row of rows) {
        const data: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (allowed.has(k)) data[k] = normalizeValue(v);
        }
        // Gera PK UUID no app (permite re-SELECT, já que MySQL não tem RETURNING).
        if (allowed.has(pk) && (data[pk] === undefined || data[pk] === null))
          data[pk] = crypto.randomUUID();
        const keys = Object.keys(data);
        if (keys.length === 0) throw new HttpError(400, "sem_colunas_validas");
        await pool.query(
          `INSERT INTO ${qIdent(cfg.table)} (${keys.map(qIdent).join(", ")})
           VALUES (${keys.map(() => "?").join(", ")})`,
          keys.map((k) => data[k]),
        );
        const [sel] = await pool.query<RowDataPacket[]>(
          `SELECT * FROM ${qIdent(cfg.table)} WHERE ${qIdent(pk)} = ? LIMIT 1`, [data[pk]],
        );
        out.push(sel[0] ?? null);
      }
      return c.json(Array.isArray(body) ? out : out[0]);
    } catch (e) { return errJson(c, e); }
  });

  // PATCH /:id
  router.patch("/:id", async (c) => {
    try {
      if (!canWrite(c.get("auth"))) throw new HttpError(c.get("auth") ? 403 : 401, "forbidden");
      const allowed = await loadColumns(cfg.table);
      const body = (await c.req.json()) as Record<string, unknown>;
      const set: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body)) if (allowed.has(k) && k !== pk) set[k] = normalizeValue(v);
      const setKeys = Object.keys(set);
      if (setKeys.length === 0) throw new HttpError(400, "sem_colunas_validas");
      const params: unknown[] = setKeys.map((k) => set[k]);
      params.push(c.req.param("id"));
      await pool.query(
        `UPDATE ${qIdent(cfg.table)} SET ${setKeys.map((k) => `${qIdent(k)} = ?`).join(", ")}
         WHERE ${qIdent(pk)} = ?`, params,
      );
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM ${qIdent(cfg.table)} WHERE ${qIdent(pk)} = ? LIMIT 1`, [c.req.param("id")],
      );
      return c.json(rows[0] ?? null);
    } catch (e) { return errJson(c, e); }
  });

  // DELETE /:id
  router.delete("/:id", async (c) => {
    try {
      if (!canWrite(c.get("auth"))) throw new HttpError(c.get("auth") ? 403 : 401, "forbidden");
      await pool.query(`DELETE FROM ${qIdent(cfg.table)} WHERE ${qIdent(pk)} = ?`, [c.req.param("id")]);
      return c.json({ ok: true });
    } catch (e) { return errJson(c, e); }
  });

  return router;
}

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function errJson(c: Context, e: unknown) {
  if (e instanceof HttpError) return c.json({ error: e.message }, e.status as any);
  const msg = e instanceof Error ? e.message : String(e);
  return c.json({ error: msg }, 400);
}

void requireAuth; // reservado para recursos que exijam login em toda operação
