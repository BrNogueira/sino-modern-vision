// ============================================================================
// Admin — criação de usuários (porta da edge function create-user).
// POST /api/admin/users  (admin apenas): cria no Better-auth + profile + papel.
// ============================================================================
import { Hono } from "hono";
import { auth } from "../auth/index.js";
import { queryOne, exec } from "../lib/db-helpers.js";
import { requireRole, type Role } from "../middleware/auth.js";

export const adminRouter = new Hono();

const VALID_ROLES: Role[] = ["admin", "gerente", "corretor", "financeiro"];

adminRouter.post("/users", requireRole("admin"), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    email?: string; password?: string; full_name?: string; name?: string;
    role?: Role; phone?: string; creci?: string;
  };
  const email = body.email?.trim();
  const password = body.password ?? "";
  const fullName = body.full_name ?? body.name ?? email?.split("@")[0] ?? "Usuário";
  const role: Role = VALID_ROLES.includes(body.role as Role) ? (body.role as Role) : "corretor";

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
  await exec(
    "INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, ?) ON DUPLICATE KEY UPDATE role=role",
    [userId, role],
  );

  return c.json({ user: { id: userId, email, full_name: fullName, role } });
});
