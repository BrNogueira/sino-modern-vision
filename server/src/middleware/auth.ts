import { createMiddleware } from "hono/factory";
import { auth } from "../auth/index.js";
import { queryMany } from "../lib/db-helpers.js";

export type Role = "admin" | "gerente" | "corretor" | "financeiro";

export interface AuthCtx {
  user: { id: string; email: string };
  roles: Role[];
}

declare module "hono" {
  interface ContextVariableMap {
    auth?: AuthCtx;
  }
}

/** Popula c.auth se houver sessão válida (não bloqueia). Resolve roles de user_roles. */
export const attachSession = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
  if (session?.user) {
    const rows = await queryMany<{ role: Role }>(
      "SELECT role FROM user_roles WHERE user_id = ?",
      [session.user.id],
    );
    c.set("auth", {
      user: { id: session.user.id, email: session.user.email },
      roles: rows.map((r) => r.role),
    });
  }
  await next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  if (!c.get("auth")) return c.json({ error: "unauthorized" }, 401);
  await next();
});

/** Exige pelo menos um dos papéis informados. */
export const requireRole = (...roles: Role[]) =>
  createMiddleware(async (c, next) => {
    const ctx = c.get("auth");
    if (!ctx) return c.json({ error: "unauthorized" }, 401);
    if (!ctx.roles.some((r) => roles.includes(r)))
      return c.json({ error: "forbidden" }, 403);
    await next();
  });

export const hasRole = (ctx: AuthCtx | undefined, ...roles: Role[]) =>
  !!ctx && ctx.roles.some((r) => roles.includes(r));
