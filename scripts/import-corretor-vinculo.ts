/**
 * ETL: vínculo imóvel → corretor do legado (sinos7596_maya) → novo MySQL
 *
 *   produtos.corretor (cor_id) → corretores.cor_email → profiles.email → imoveis.corretor_id
 *   Regra do codigo_imovel idêntica ao import de imóveis (cod || IMV-<id>, dedup -<id>).
 *
 * Pré-requisitos:
 *   • db/migrations/2026-07-16-imoveis-corretor.sql aplicado (coluna corretor_id)
 *   • usuários importados (profiles com e-mails do legado)
 *
 * Idempotente: só preenche onde corretor_id IS NULL.
 *
 * Uso:
 *   npx tsx scripts/import-corretor-vinculo.ts --dry-run
 *   npx tsx scripts/import-corretor-vinculo.ts
 *
 * Env (.env): DATABASE_URL  ou  MYSQL_HOST/PORT/USER/PASSWORD/DATABASE[/MYSQL_SOCKET]
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_FILE = path.resolve(__dirname, "../sinos7596_maya.sql");
const DRY_RUN = process.argv.includes("--dry-run");

// ── parser do dump (mesmo de import-pessoas-mysql.ts) ───────────────────────
function extractInserts(sql: string, table: string): string {
  const marker = "INSERT INTO `" + table + "`";
  const any = /INSERT INTO `[A-Za-z0-9_]+`/g;
  const pos: { idx: number; name: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = any.exec(sql))) pos.push({ idx: m.index, name: m[0] });
  const out: string[] = [];
  for (let k = 0; k < pos.length; k++) {
    if (pos[k].name !== marker) continue;
    const stmt = sql.slice(pos[k].idx, k + 1 < pos.length ? pos[k + 1].idx : sql.length);
    const v = stmt.search(/\bVALUES\b/i);
    if (v !== -1) out.push(stmt.slice(v + "VALUES".length));
  }
  return out.join("\n");
}
function parseRows(region: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  while (i < region.length) {
    if (region[i] !== "(") { i++; continue; }
    i++;
    const row: string[] = [];
    let field = "", inStr = false, q = "";
    while (i < region.length) {
      const c = region[i];
      if (!inStr && (c === "'" || c === '"')) { inStr = true; q = c; i++; continue; }
      if (inStr) {
        if (c === "\\" && i + 1 < region.length) {
          const n = region[i + 1];
          field += n === "n" ? "\n" : n === "r" ? "\r" : n === "t" ? "\t" : n;
          i += 2; continue;
        }
        if (c === q) {
          if (region[i + 1] === q) { field += c; i += 2; continue; }
          inStr = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === ",") { row.push(field.trim()); field = ""; i++; continue; }
      if (c === ")") { row.push(field.trim()); rows.push(row); i++; break; }
      field += c; i++;
    }
  }
  return rows;
}
const cell = (r?: string) => (r === undefined || r === "NULL" || r === "" ? null : r);
const toInt = (r?: string) => { const v = cell(r); const n = v == null ? NaN : parseInt(v, 10); return isNaN(n) ? null : n; };

function connConfig(): mysql.ConnectionOptions {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL as any;
  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT ?? "3306", 10),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "sino",
    ...(process.env.MYSQL_SOCKET ? { socketPath: process.env.MYSQL_SOCKET } : {}),
    charset: "utf8mb4",
  };
}

// corretor legado cor_id → e-mail
function buildCorretorEmails(sql: string): Record<number, string> {
  const map: Record<number, string> = {};
  parseRows(extractInserts(sql, "corretores")).forEach((r) => {
    const id = toInt(r[0]); const email = (cell(r[2]) ?? "").trim().toLowerCase();
    if (id != null && email) map[id] = email;
  });
  return map;
}

// produtos: r[0]=id  r[2]=corretor  r[28]=cod
function buildImovelCorretor(sql: string): { codigo: string; corretorLegacy: number }[] {
  const seen = new Set<string>();
  const out: { codigo: string; corretorLegacy: number }[] = [];
  for (const r of parseRows(extractInserts(sql, "produtos"))) {
    if (r.length !== 57) continue;
    const legacyId = toInt(r[0]); if (legacyId == null) continue;
    let codigo = (cell(r[28]) ?? "").trim() || `IMV-${legacyId}`;
    if (seen.has(codigo)) codigo = `${codigo}-${legacyId}`;
    seen.add(codigo);
    const cor = toInt(r[2]);
    if (cor && cor > 0) out.push({ codigo, corretorLegacy: cor });
  }
  return out;
}

async function main() {
  console.log(`\n▶ Vínculo imóvel→corretor do legado ${DRY_RUN ? "(DRY-RUN)" : ""}`);
  const sql = fs.readFileSync(SQL_FILE, { encoding: "utf8" });
  const corretorEmails = buildCorretorEmails(sql);
  const vinculos = buildImovelCorretor(sql);
  console.log(`  ${Object.keys(corretorEmails).length} corretores no dump · ${vinculos.length} imóveis com corretor`);

  const conn = await mysql.createConnection(connConfig());
  const [profs] = await conn.execute<any[]>("SELECT id, email FROM profiles");
  const emailToProfile: Record<string, string> = {};
  for (const p of profs) if (p.email) emailToProfile[String(p.email).trim().toLowerCase()] = p.id;
  console.log(`  ${profs.length} profiles no banco`);

  let updated = 0, semPerfil = 0, semImovel = 0;
  const semPerfilEmails = new Set<string>();
  for (const v of vinculos) {
    const email = corretorEmails[v.corretorLegacy];
    const profileId = email ? emailToProfile[email] : undefined;
    if (!profileId) { semPerfil++; if (email) semPerfilEmails.add(email); continue; }
    if (DRY_RUN) { updated++; continue; }
    const [res] = await conn.execute<any>(
      "UPDATE imoveis SET corretor_id = ? WHERE codigo_imovel = ? AND corretor_id IS NULL",
      [profileId, v.codigo],
    );
    if (res.affectedRows > 0) updated++; else semImovel++;
  }
  await conn.end();

  console.log(`  ✔ vinculados: ${updated} · sem perfil p/ corretor: ${semPerfil} · codigo não encontrado/já vinculado: ${semImovel}`);
  if (semPerfilEmails.size) console.log(`  e-mails sem profile: ${[...semPerfilEmails].join(", ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
