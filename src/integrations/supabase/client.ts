// ============================================================================
// SHIM de compatibilidade — substitui @supabase/supabase-js.
// Mantém o nome `supabase` para os call sites compilarem sem refactor.
//   .auth      → /api/auth/* (better-auth)
//   .from()    → /api/data/<tabela> (via query-builder)
//   .rpc()     → /api/rpc/<fn>
//   .functions → mapeia edge functions antigas para rotas do backend Node
//   .storage   → /api/storage/<bucket>
// ============================================================================
import { api, apiUrl, authApi, type AuthUser } from "../api/client";
import { SupaQuery } from "./query-builder";

type AuthChangeHandler = (
  event: "INITIAL_SESSION" | "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED",
  session: { user: AuthUser } | null,
) => void;

const listeners = new Set<AuthChangeHandler>();
let cachedSession: { user: AuthUser } | null = null;

async function refreshSession() {
  const data = await authApi.getSession();
  cachedSession = data?.user ? { user: data.user } : null;
  return cachedSession;
}

refreshSession().then((s) => listeners.forEach((l) => l("INITIAL_SESSION", s)));

function notImplemented(method: string): never {
  throw new Error(`[supabase shim] ${method} não suportado. Migre para @/integrations/api/client.`);
}

export const supabase = {
  auth: {
    async getSession() {
      const s = await refreshSession();
      return { data: { session: s }, error: null };
    },
    async getUser() {
      const s = await refreshSession();
      return { data: { user: s?.user ?? null }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const out = await authApi.signInEmail(email, password);
        cachedSession = { user: out.user };
        listeners.forEach((l) => l("SIGNED_IN", cachedSession));
        return { data: { user: out.user, session: cachedSession }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: err as Error };
      }
    },
    async signUp({ email, password, options }: {
      email: string; password: string;
      options?: { data?: { name?: string; full_name?: string } };
    }) {
      try {
        const displayName =
          options?.data?.name ?? options?.data?.full_name ?? email.split("@")[0] ?? "Usuário";
        const out = await authApi.signUpEmail(email, password, displayName);
        return { data: { user: out.user, session: null }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: err as Error };
      }
    },
    async signOut() {
      await authApi.signOut().catch(() => {});
      cachedSession = null;
      listeners.forEach((l) => l("SIGNED_OUT", null));
      return { error: null };
    },
    onAuthStateChange(handler: AuthChangeHandler) {
      listeners.add(handler);
      queueMicrotask(() => handler("INITIAL_SESSION", cachedSession));
      return { data: { subscription: { unsubscribe: () => listeners.delete(handler) } } };
    },
    resetPasswordForEmail: async (email: string, opts?: { redirectTo?: string }) => {
      try {
        const path = opts?.redirectTo
          ? new URL(opts.redirectTo, window.location.origin).pathname
          : "/reset-password";
        await authApi.requestPasswordReset(email, path);
        return { data: {}, error: null };
      } catch (e) {
        return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
    updateUser: async () => notImplemented("auth.updateUser"),
  },

  from(table: string) {
    return new SupaQuery(table);
  },

  rpc(fn: string, args?: unknown) {
    return api
      .post(`/api/rpc/${fn}`, args ?? {})
      .then((data) => ({ data, error: null }))
      .catch((err) => ({ data: null, error: err }));
  },

  functions: {
    async invoke<T = unknown>(name: string, opts?: { body?: unknown }) {
      const PATH_MAP: Record<string, { method: string; path: string }> = {
        "canal-pro-feed": { method: "GET", path: "/api/feed/canal-pro" },
        "create-user": { method: "POST", path: "/api/admin/users" },
      };
      const route = PATH_MAP[name];
      if (!route) return { data: null, error: new Error(`[shim] functions.invoke('${name}') sem mapeamento`) };
      try {
        const data =
          route.method === "GET" ? await api.get<T>(route.path) : await api.post<T>(route.path, opts?.body);
        return { data, error: null };
      } catch (err) {
        return { data: null as T | null, error: err as Error };
      }
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: File | Blob, _opts?: { contentType?: string; upsert?: boolean }) {
          try {
            const form = new FormData();
            form.append("path", path);
            form.append("file", file);
            const out = await api.upload<{ path: string }>(`/api/storage/${bucket}`, form);
            return { data: { path: out.path ?? path }, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
          }
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: apiUrl(`/api/storage/${bucket}/${path}`) } };
        },
        async remove(paths: string[]) {
          try {
            await Promise.all(paths.map((p) => api.delete(`/api/storage/${bucket}/${p}`)));
            return { data: {}, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
          }
        },
      };
    },
  },

  channel: () => notImplemented("channel"),
  removeChannel: () => notImplemented("removeChannel"),
};

export const auth = supabase.auth;
export const rpc = supabase.rpc.bind(supabase);
export const functions = supabase.functions;
export const storage = supabase.storage;
export type { AuthUser as User } from "../api/client";
