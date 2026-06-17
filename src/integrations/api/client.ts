// ============================================================================
// sino-modern-vision — HTTP client (substitui o supabase-js no frontend).
// Auth real contra /api/auth/* (better-auth). Dados via /api/data/* (shim).
// ============================================================================

function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv !== undefined && fromEnv !== "") {
    const trimmed = fromEnv.trim().replace(/\/$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }
  // Mesma origem: em dev o Vite faz proxy de /api → backend local.
  return "";
}

const API_BASE = resolveApiBase();

/** URL absoluta para um path da API (útil para <img>/<video> e storage). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

type FetchOpts = RequestInit & { json?: unknown };

async function http<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { json, headers, ...rest } = opts;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: { "content-type": "application/json", ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const body = data as Record<string, unknown> | null;
    const message =
      (typeof body?.message === "string" ? body.message : null) ??
      (typeof body?.error === "string" ? body.error : null) ??
      `${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(public message: string, public status: number, public body: unknown) {
    super(message);
  }
}

export const api = {
  get: <T = unknown>(path: string, init?: RequestInit) => http<T>(path, { method: "GET", ...init }),
  post: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    http<T>(path, { method: "POST", json: body, ...init }),
  patch: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    http<T>(path, { method: "PATCH", json: body, ...init }),
  delete: <T = unknown>(path: string, init?: RequestInit) => http<T>(path, { method: "DELETE", ...init }),
  upload: async <T = unknown>(path: string, form: FormData): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", credentials: "include", body: form });
    const ct = res.headers.get("content-type") ?? "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const message =
        (typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : null) ??
        `${res.status} ${res.statusText}`;
      throw new ApiError(String(message), res.status, data);
    }
    return data as T;
  },
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export const authApi = {
  signInEmail: (email: string, password: string) =>
    api.post<{ user: AuthUser; session: { id: string } }>("/api/auth/sign-in/email", { email, password }),
  signUpEmail: (email: string, password: string, name: string) =>
    api.post<{ token?: string; user: AuthUser }>("/api/auth/sign-up/email", { email, password, name }),
  signOut: () => api.post<void>("/api/auth/sign-out"),
  getSession: () =>
    api.get<{ user: AuthUser; session: { id: string } } | null>("/api/auth/get-session").catch(() => null),
  requestPasswordReset: (email: string, redirectTo = "/reset-password") =>
    api.post<{ status: boolean }>("/api/auth/request-password-reset", { email, redirectTo }),
  resetPassword: (newPassword: string, token: string) =>
    api.post<{ status: boolean }>("/api/auth/reset-password", { newPassword, token }),
};
