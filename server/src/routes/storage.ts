// ============================================================================
// Storage em disco — substitui o Supabase Storage. Uploads vão para UPLOADS_DIR
// (montar volume persistente em produção). Servido em /api/storage/<bucket>/<path>.
// ============================================================================
import { Hono } from "hono";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { env } from "../env.js";
import { requireRole } from "../middleware/auth.js";

const ROOT = path.resolve(env.UPLOADS_DIR);

// Marca d'água Sinos: aplicada nas fotos de imóvel no momento do upload.
const WATERMARK_PATH = fileURLToPath(new URL("../../assets/watermark.webp", import.meta.url));
const WATERMARK_BUCKETS = new Set(["imoveis-fotos"]);
const WATERMARKABLE = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Compõe a marca d'água no canto inferior direito da imagem.
 * Nunca lança: se der qualquer erro (formato exótico, imagem minúscula, etc.),
 * devolve o buffer original para não quebrar o upload.
 */
async function withWatermark(buf: Buffer, filename: string): Promise<Buffer> {
  try {
    if (!WATERMARKABLE.has(path.extname(filename).toLowerCase())) return buf;

    // Aplica orientação EXIF primeiro, para medir/posicionar sobre a imagem final.
    const oriented = await sharp(buf, { failOn: "none" }).rotate().toBuffer();
    const base = sharp(oriented);
    const { width = 0, height = 0 } = await base.metadata();
    if (width < 200 || height < 200) return buf; // pequena demais para marcar

    const wmWidth = Math.round(width * 0.22);
    const margin = Math.round(width * 0.025);
    const logo = await sharp(WATERMARK_PATH)
      .resize({ width: wmWidth })
      // reduz a opacidade da marca (~85%) multiplicando o canal alpha
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(255 * 0.85)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      }])
      .png()
      .toBuffer();
    const { height: wmHeight = 0 } = await sharp(logo).metadata();

    return await base
      .composite([{
        input: logo,
        top: Math.max(0, height - wmHeight - margin),
        left: Math.max(0, width - wmWidth - margin),
      }])
      .toBuffer();
  } catch {
    return buf;
  }
}

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
  let data = Buffer.from(await file.arrayBuffer());
  if (WATERMARK_BUCKETS.has(bucket)) data = await withWatermark(data, rel);
  await fs.writeFile(dest, data);
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
