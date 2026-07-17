// ============================================================================
// Admin — criação de usuários (porta da edge function create-user).
// POST /api/admin/users  (admin apenas): cria no Better-auth + profile + papel.
// ============================================================================
import { Hono } from "hono";
import { auth } from "../auth/index.js";
import { queryOne, queryMany, exec } from "../lib/db-helpers.js";
import { requireAuth, requireRole, type Role } from "../middleware/auth.js";

export const adminRouter = new Hono();

const VALID_ROLES: Role[] = ["admin", "gerente", "corretor", "financeiro"];

adminRouter.post("/users", requireRole("admin"), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string; password?: string; full_name?: string; name?: string;
    role?: Role; roles?: Role[]; phone?: string; creci?: string;
  };
  const email = body.email?.trim();
  const password = body.password ?? "";
  const fullName = body.full_name ?? body.name ?? email?.split("@")[0] ?? "Usuário";
  // O front envia `roles: Role[]` (checkboxes); aceitamos também `role` singular.
  const requested = Array.isArray(body.roles) ? body.roles : body.role ? [body.role] : [];
  const roles = [...new Set(requested.filter((r): r is Role => VALID_ROLES.includes(r as Role)))];
  if (roles.length === 0) roles.push("corretor");

  if (!email || password.length < 8)
    return c.json({ error: "email e senha (mín. 8 chars) obrigatórios" }, 400);

  let userId: string | null = null;
  try {
    const res = (await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    })) as { user?: { id?: string } };
    userId = res?.user?.id ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/exist|already|unique|duplicate/i.test(msg)) return c.json({ error: "usuário já existe" }, 409);
    return c.json({ error: msg }, 400);
  }
  if (!userId) {
    const row = await queryOne<{ id: string }>("SELECT id FROM `user` WHERE lower(email)=lower(?) LIMIT 1", [email]);
    userId = row?.id ?? null;
  }
  if (!userId) return c.json({ error: "falha ao resolver user_id" }, 500);

  await exec(
    `INSERT INTO profiles (id, full_name, email, phone, creci, active)
     VALUES (?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email)`,
    [userId, fullName, email, body.phone ?? "", body.creci ?? ""],
  );
  for (const role of roles) {
    await exec(
      "INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, ?) ON DUPLICATE KEY UPDATE role=role",
      [userId, role],
    );
  }

  return c.json({ user: { id: userId, email, full_name: fullName, roles } });
});

// ============================================================================
// Dashboard — agregados leves (contagens + variação mês a mês por created_at).
// Substitui o carregamento de TODOS os imóveis (com fotos, ~5MB) só p/ contar.
// GET /api/admin/dashboard-stats
// ============================================================================
type StatAgg = {
  total: number; ativos: number; venda: number; aluguel: number; destaque: number;
  total_cur: number; ativos_cur: number; venda_cur: number; aluguel_cur: number; destaque_cur: number;
  total_prev: number; ativos_prev: number; venda_prev: number; aluguel_prev: number; destaque_prev: number;
};

type RecentRow = {
  id: string; codigo_imovel: string | null; titulo_imovel: string | null;
  cidade: string | null; estado: string | null; ativo: number;
  preco_venda: number | null; preco_aluguel: number | null; created_at: string;
};

const pctChange = (cur: number, prev: number): number => {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

adminRouter.get("/dashboard-stats", requireAuth, async (c) => {
  // Limites do mês (fuso do servidor). CUR = 1º dia do mês atual; PREV = 1º dia do anterior.
  const CUR = "DATE_FORMAT(NOW(), '%Y-%m-01')";
  const PREV = "DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01')";
  const inCur = `created_at >= ${CUR}`;
  const inPrev = `created_at >= ${PREV} AND created_at < ${CUR}`;
  const agg = await queryOne<StatAgg>(
    `SELECT
       COUNT(*)                                                     AS total,
       SUM(ativo = 1)                                               AS ativos,
       SUM(preco_venda IS NOT NULL)                                 AS venda,
       SUM(preco_aluguel IS NOT NULL)                               AS aluguel,
       SUM(destaque = 1)                                            AS destaque,
       SUM(${inCur})                                                AS total_cur,
       SUM(ativo = 1 AND ${inCur})                                  AS ativos_cur,
       SUM(preco_venda IS NOT NULL AND ${inCur})                    AS venda_cur,
       SUM(preco_aluguel IS NOT NULL AND ${inCur})                  AS aluguel_cur,
       SUM(destaque = 1 AND ${inCur})                               AS destaque_cur,
       SUM(${inPrev})                                               AS total_prev,
       SUM(ativo = 1 AND ${inPrev})                                 AS ativos_prev,
       SUM(preco_venda IS NOT NULL AND ${inPrev})                   AS venda_prev,
       SUM(preco_aluguel IS NOT NULL AND ${inPrev})                 AS aluguel_prev,
       SUM(destaque = 1 AND ${inPrev})                              AS destaque_prev
     FROM imoveis`,
  );

  const recent = await queryMany<RecentRow>(
    `SELECT id, codigo_imovel, titulo_imovel, cidade, estado, ativo, preco_venda, preco_aluguel, created_at
     FROM imoveis ORDER BY created_at DESC LIMIT 5`,
  );

  const n = (v: unknown) => Number(v ?? 0);
  const a = agg ?? ({} as StatAgg);
  const build = (totalKey: keyof StatAgg, curKey: keyof StatAgg, prevKey: keyof StatAgg) => {
    const cur = n(a[curKey]);
    const prev = n(a[prevKey]);
    return { value: n(a[totalKey]), current: cur, previous: prev, pct: pctChange(cur, prev) };
  };

  return c.json({
    totals: {
      total: build("total", "total_cur", "total_prev"),
      ativos: build("ativos", "ativos_cur", "ativos_prev"),
      venda: build("venda", "venda_cur", "venda_prev"),
      aluguel: build("aluguel", "aluguel_cur", "aluguel_prev"),
      destaque: build("destaque", "destaque_cur", "destaque_prev"),
    },
    recent,
  });
});
