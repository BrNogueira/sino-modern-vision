// ============================================================================
// Storage em disco — substitui o Supabase Storage. Uploads vão para UPLOADS_DIR
// (montar volume persistente em produção). Servido em /api/storage/<bucket>/<path>.
// ============================================================================
import { Hono } from "hono";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "../env.js";
import { requireRole } from "../middleware/auth.js";

const ROOT = path.resolve(env.UPLOADS_DIR);

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".mp4": "video/mp4",
};

/** Garante que o caminho resolvido fica dentro de ROOT (anti path-traversal). */
function safeJoin(...parts: string[]): string {
  const p = path.resolve(ROOT, ...parts);
  if (p !== ROOT && !p.startsWith(ROOT + path.sep)) throw new Error("caminho inválido");
  return p;
}

export const storageRouter = new Hono();

// Upload (multipart: file + path opcional). Staff apenas.
storageRouter.post("/:bucket", requireRole("admin", "gerente", "corretor"), async (c) => {
  const bucket = c.req.param("bucket");
  const form = await c.req.parseBody();
  const file = form["file"];
  if (!(file instanceof File)) return c.json({ error: "arquivo ausente" }, 400);
  const rel = (typeof form["path"] === "string" && form["path"]) || `${Date.now()}-${file.name}`;
  const dest = safeJoin(bucket, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return c.json({ path: rel });
});

// Servir arquivo (público).
storageRouter.get("/:bucket/*", async (c) => {
  const bucket = c.req.param("bucket");
  const rel = c.req.path.split(`/api/storage/${bucket}/`)[1] ?? "";
  try {
    const file = safeJoin(bucket, decodeURIComponent(rel));
    const buf = await fs.readFile(file);
    const ct = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    return c.body(buf, 200, { "Content-Type": ct, "Cache-Control": "public, max-age=86400" });
  } catch {
    return c.json({ error: "not_found" }, 404);
  }
});

// Remover (staff).
storageRouter.delete("/:bucket/*", requireRole("admin", "gerente", "corretor"), async (c) => {
  const bucket = c.req.param("bucket");
  const rel = c.req.path.split(`/api/storage/${bucket}/`)[1] ?? "";
  try {
    await fs.unlink(safeJoin(bucket, decodeURIComponent(rel)));
  } catch { /* idempotente */ }
  return c.json({ ok: true });
});
