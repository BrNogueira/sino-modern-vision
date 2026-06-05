// ============================================================================
// RPC compat — funções que o front chamava via supabase.rpc().
// ============================================================================
import { Hono } from "hono";
import { queryMany } from "../lib/db-helpers.js";
import { requireAuth } from "../middleware/auth.js";

export const rpcRouter = new Hono();

// get_user_roles(_user_id) → string[] de papéis. Usado pelo AdminAuthContext.
rpcRouter.post("/get_user_roles", requireAuth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { _user_id?: string };
  const ctx = c.get("auth")!;
  // Usuário só consulta os próprios papéis (admin pode consultar qualquer um).
  const target = ctx.roles.includes("admin") && body._user_id ? body._user_id : ctx.user.id;
  const rows = await queryMany<{ role: string }>(
    "SELECT role FROM user_roles WHERE user_id = ?", [target],
  );
  return c.json(rows.map((r) => r.role));
});

// is_admin(_user_id) → boolean
rpcRouter.post("/is_admin", requireAuth, async (c) => {
  const ctx = c.get("auth")!;
  return c.json(ctx.roles.includes("admin"));
});
