// ============================================================================
// ETL: usuários do legado (sinos7596_maya) → Better-auth + profiles + user_roles
//
//   • corretores (cor_status = 1)  → role 'corretor'
//   • usuarios   (nivel = 1)       → role 'admin'  (demais → 'corretor')
//
// Cada usuário é criado no Better-auth com SENHA ALEATÓRIA (os hashes SHA1 do
// legado não são reaproveitáveis pelo scrypt do Better-auth). Dispare o reset de
// senha na plataforma depois — a lista de e-mails sai em /tmp/usuarios-import.csv.
//
// Idempotente: usuário existente (mesmo e-mail) é reutilizado; profile/role usam
// upsert. Dedup por e-mail entre corretores e usuarios.
//
// Uso (na pasta server/):
//   tsx --env-file=.env src/scripts/import-usuarios.ts --dry-run
//   tsx --env-file=.env src/scripts/import-usuarios.ts
// ============================================================================
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { auth } from "../auth/index.js";
import { queryOne, exec } from "../lib/db-helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_FILE = path.resolve(__dirname, "../../../sinos7596_maya.sql");
const DRY_RUN = process.argv.includes("--dry-run");
const DEFAULT_DOMAIN = "sinosimoveis.com.br";

type Role = "admin" | "corretor";
interface NewUser { nome: string; email: string; role: Role; legacy: string; }

// ── parser do dump (tuplas (...),(...) respeitando strings/escapes) ──────────
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
        if (c === "\\" && i + 1 < region.length) { field += region[i + 1]; i += 2; continue; }
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
const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

function buildUsers(sql: string): NewUser[] {
  const out: NewUser[] = [];
  const seen = new Set<string>();
  const add = (u: NewUser) => {
    const key = u.email.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key); out.push(u);
  };

  // corretores: 0 cor_id, 1 cor_nome, 2 cor_email, 3 cor_senha, 4 cor_status
  for (const r of parseRows(extractInserts(sql, "corretores"))) {
    if (cell(r[4]) !== "1") continue; // só ativos
    const nome = (cell(r[1]) ?? "").trim();
    const email = (cell(r[2]) ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
    add({ nome: nome || email, email, role: "corretor", legacy: `corretor:${r[0]}` });
  }
  // usuarios: 0 id, 1 nome, 2 login, 3 senha, 4 nivel
  for (const r of parseRows(extractInserts(sql, "usuarios"))) {
    const nome = (cell(r[1]) ?? "").trim();
    const login = (cell(r[2]) ?? "").trim();
    if (!login) continue;
    const email = `${slug(login) || slug(nome)}@${DEFAULT_DOMAIN}`;
    const role: Role = cell(r[4]) === "1" ? "admin" : "corretor";
    add({ nome: nome || login, email, role, legacy: `usuario:${r[0]}` });
  }
  return out;
}

function randomPassword(): string {
  return "Sino!" + Buffer.from(crypto.randomUUID()).toString("base64").slice(0, 18) + "9z";
}

async function ensureUser(u: NewUser): Promise<string | null> {
  let userId: string | null = null;
  try {
    const res = (await auth.api.signUpEmail({
      body: { email: u.email, password: randomPassword(), name: u.nome },
    })) as { user?: { id?: string } };
    userId = res?.user?.id ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/exist|already|unique|duplicate/i.test(msg)) {
      console.error(`  ✗ ${u.email}:`, msg);
      return null;
    }
  }
  if (!userId) {
    const row = await queryOne<{ id: string }>(
      "SELECT id FROM `user` WHERE lower(email) = lower(?) LIMIT 1", [u.email],
    );
    userId = row?.id ?? null;
  }
  if (!userId) return null;

  await exec(
    `INSERT INTO profiles (id, full_name, email, active)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email)`,
    [userId, u.nome, u.email],
  );
  await exec(
    `INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, ?)
     ON DUPLICATE KEY UPDATE role = role`,
    [userId, u.role],
  );
  return userId;
}

async function main() {
  console.log(`\n▶ Import usuários legado → Better-auth ${DRY_RUN ? "(DRY-RUN)" : ""}`);
  const sql = fs.readFileSync(SQL_FILE, { encoding: "utf8" });
  const users = buildUsers(sql);
  const admins = users.filter((u) => u.role === "admin").length;
  console.log(`  → ${users.length} usuários (${admins} admin · ${users.length - admins} corretor)`);

  if (DRY_RUN) {
    users.forEach((u) => console.log(`    [${u.role}] ${u.nome} <${u.email}>  (${u.legacy})`));
    console.log("\n✓ dry-run concluído (nada gravado)");
    return;
  }

  const lines = ["email,nome,role"];
  let ok = 0;
  for (const u of users) {
    const id = await ensureUser(u);
    if (id) { ok++; lines.push(`${u.email},"${u.nome}",${u.role}`); }
    process.stdout.write(`  ✔ ${ok}/${users.length}\r`);
  }
  fs.writeFileSync("/tmp/usuarios-import.csv", lines.join("\n"));
  console.log(`\n  ✔ ${ok} usuários prontos · lista p/ reset de senha em /tmp/usuarios-import.csv`);
  console.log("\n✓ import concluído");
  process.exit(0);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
