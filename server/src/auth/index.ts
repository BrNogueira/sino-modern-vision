import { betterAuth, type BetterAuthOptions } from "better-auth";
import { env } from "../env.js";
import { pool } from "../db/client.js";

// Better-auth usa o mesmo pool MySQL (cria tabelas user/session/account/verification
// via `npm run auth:migrate`). RBAC (admin/gerente/corretor) fica em user_roles,
// resolvido no middleware — better-auth não popula role.
export const authOptions = {
  database: pool,
  secret: env.AUTH_SECRET,
  baseURL: env.APP_PUBLIC_URL,
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim()),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    cookiePrefix: "sino",
    // IDs em UUID (CHAR(36)) para casar com profiles.id / user_roles.user_id.
    database: { generateId: () => crypto.randomUUID() },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);
export type AuthInstance = typeof auth;
