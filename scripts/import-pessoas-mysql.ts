/**
 * ETL: pessoas do legado (sinos7596_maya) → novo MySQL
 *
 *   1) clientes  → tabela `clientes` (proprietários + clientes/fornecedores)
 *   2) vínculo   → imoveis.proprietario_id (via produtos.dados_proprietario + cod)
 *   3) contatos  → tabela `leads`
 *
 * Pré-requisitos:
 *   • db/migrations/2026-06-19-clientes-proprietarios.sql aplicado
 *   • imóveis já importados (scripts/import-imoveis-mysql.ts)
 *   • usuários já importados (server/.../import-usuarios.ts) — p/ resolver corretor_id
 *
 * Idempotente: clientes por `legacy_id`, leads por `legacy_id` (ON DUPLICATE KEY).
 *
 * Uso:
 *   npx tsx scripts/import-pessoas-mysql.ts --dry-run
 *   npx tsx scripts/import-pessoas-mysql.ts
 *
 * Env (.env): DATABASE_URL  ou  MYSQL_HOST/PORT/USER/PASSWORD/DATABASE
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
const BATCH = 200;

// ── parser do dump ──────────────────────────────────────────────────────────
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
const fixDate = (v: string | null) => (!v || v.startsWith("0000-00-00") ? null : v);

// entidades HTML comuns no legado + tags soltas
function clean(v: string | null): string | null {
  if (v == null) return null;
  let s = v
    .replace(/<[^>]+>/g, " ")
    .replace(/&Oacute;/g, "Ó").replace(/&oacute;/g, "ó")
    .replace(/&Aacute;/g, "Á").replace(/&aacute;/g, "á")
    .replace(/&Eacute;/g, "É").replace(/&eacute;/g, "é")
    .replace(/&Iacute;/g, "Í").replace(/&iacute;/g, "í")
    .replace(/&Uacute;/g, "Ú").replace(/&uacute;/g, "ú")
    .replace(/&atilde;/g, "ã").replace(/&Atilde;/g, "Ã")
    .replace(/&otilde;/g, "õ").replace(/&Otilde;/g, "Õ")
    .replace(/&ccedil;/g, "ç").replace(/&Ccedil;/g, "Ç")
    .replace(/&ecirc;/g, "ê").replace(/&ocirc;/g, "ô").replace(/&acirc;/g, "â")
    .replace(/&agrave;/g, "à").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
  return s || null;
}
// 1º telefone "limpo" de um campo com vários números / texto
function firstPhone(...vals: (string | null)[]): string | null {
  for (const v of vals) {
    if (!v) continue;
    const line = v.split(/[\r\n;]+/).map((s) => s.trim()).find((s) => /\d/.test(s));
    if (line) return line.slice(0, 120);
  }
  return null;
}
// heurística de spam (o dump tem injeções antigas em `clientes`)
function isSpam(...vals: (string | null)[]): boolean {
  const blob = vals.filter(Boolean).join(" ").toLowerCase();
  return /https?:\/\/|\[url|<a |cialis|viagra|tadalafil|\.html|payday|porn/i.test(blob)
    || blob.length > 600;
}

const UF: Record<number, string> = {
  1:"AC",2:"AL",3:"AP",4:"AM",5:"BA",6:"CE",7:"DF",8:"ES",9:"GO",10:"MA",
  11:"MT",12:"MS",13:"MG",14:"PA",15:"PB",16:"PR",17:"PE",18:"PI",19:"RJ",
  20:"RN",21:"RS",22:"RO",23:"RR",24:"SC",25:"SP",26:"SE",27:"TO",
};
const UF_NOME: Record<string, string> = {
  RS:"Rio Grande do Sul",SC:"Santa Catarina",PR:"Paraná",SP:"São Paulo",
  RJ:"Rio de Janeiro",MG:"Minas Gerais",
};
const estadoNome = (raw: string | null) => {
  const n = raw == null ? NaN : parseInt(raw, 10);
  const uf = UF[n] ?? "RS";
  return UF_NOME[uf] ?? "Rio Grande do Sul";
};

const INTERESSE: Record<number, string> = {
  1:"compra",2:"venda",3:"permuta",4:"agenciamento",5:"aluguel",
};

function connConfig(): mysql.ConnectionOptions {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL as any;
  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT ?? "3306", 10),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "sino",
    // MySQL/MariaDB socket-only (sem TCP 3306) — usado em produção
    ...(process.env.MYSQL_SOCKET ? { socketPath: process.env.MYSQL_SOCKET } : {}),
    charset: "utf8mb4",
  };
}

// ── lookups ─────────────────────────────────────────────────────────────────
function buildCidadeNomes(sql: string): Record<number, string> {
  const map: Record<number, string> = {};
  parseRows(extractInserts(sql, "cidades")).forEach((r) => {
    const id = toInt(r[0]); if (id != null) map[id] = cell(r[1]) ?? "";
  });
  return map;
}
// corretor legado cor_id → e-mail (p/ resolver corretor_id novo via `user`)
function buildCorretorEmails(sql: string): Record<number, string> {
  const map: Record<number, string> = {};
  parseRows(extractInserts(sql, "corretores")).forEach((r) => {
    const id = toInt(r[0]); const email = (cell(r[2]) ?? "").trim().toLowerCase();
    if (id != null && email) map[id] = email;
  });
  return map;
}
// produtos: codigo_imovel (mesma regra do import de imóveis) + dados_proprietario
//   r[0]=id  r[5]=titulo  r[28]=cod  r[30]=dados_proprietario
function buildImovelProprietario(sql: string): { codigo: string; propLegacy: number }[] {
  const seen = new Set<string>();
  const out: { codigo: string; propLegacy: number }[] = [];
  for (const r of parseRows(extractInserts(sql, "produtos"))) {
    if (r.length !== 57) continue;
    const legacyId = toInt(r[0]); if (legacyId == null) continue;
    let codigo = (cell(r[28]) ?? "").trim() || `IMV-${legacyId}`;
    if (seen.has(codigo)) codigo = `${codigo}-${legacyId}`;
    seen.add(codigo);
    const prop = toInt(r[30]);
    if (prop && prop > 0) out.push({ codigo, propLegacy: prop });
  }
  return out;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n▶ Import pessoas legado → MySQL ${DRY_RUN ? "(DRY-RUN)" : ""}`);
  const sql = fs.readFileSync(SQL_FILE, { encoding: "utf8" });
  const cidades = buildCidadeNomes(sql);
  const corretorEmails = buildCorretorEmails(sql);
  const imovelProp = buildImovelProprietario(sql);
  const propLegacyIds = new Set(imovelProp.map((x) => x.propLegacy));
  console.log(`  lookups: ${Object.keys(cidades).length} cidades · ` +
    `${imovelProp.length} imóveis c/ proprietário (${propLegacyIds.size} donos distintos)`);

  // ── mapear clientes ──
  const cliRows = parseRows(extractInserts(sql, "clientes"));
  const clientes = cliRows
    .filter((r) => r.length === 29 && toInt(r[0]) != null)
    .filter((r) => clean(r[2]) && !isSpam(r[2], r[3], r[4], r[5], r[6]))
    .map((r) => {
      const legacy = toInt(r[0])!;
      const tipoLegado = toInt(r[18]) ?? 0; // 0 cliente, 1 fornecedor
      const tipo = propLegacyIds.has(legacy) ? "proprietario"
        : tipoLegado === 1 ? "fornecedor" : "cliente";
      const tel = firstPhone(cell(r[12]), cell(r[4])); // celular, depois fone
      const raw = [cell(r[4]), cell(r[12])].filter(Boolean).join(" / ");
      const cidadeId = toInt(r[7]);
      return {
        legacy_id: legacy,
        nome: clean(r[2])!.slice(0, 200),
        email: (cell(r[5]) ?? "").trim().toLowerCase().slice(0, 160) || null,
        telefone: tel,
        telefone_obs: raw && raw !== tel ? raw.slice(0, 2000) : null,
        endereco: clean(r[6])?.slice(0, 255) ?? null,
        cidade: (cidadeId != null ? cidades[cidadeId] : null) ?? clean(r[19]) ?? null,
        estado: estadoNome(cell(r[16])),
        cep: clean(r[26])?.slice(0, 20) ?? null,
        tipo,
        corretor_legado: toInt(r[1]) ?? 0,
        ativo: cell(r[10]) === "0" ? 0 : 1,
      };
    });
  const dist = clientes.reduce<Record<string, number>>((a, c) => (a[c.tipo] = (a[c.tipo] ?? 0) + 1, a), {});
  console.log(`  → ${clientes.length}/${cliRows.length} clientes válidos`,
    Object.entries(dist).map(([k, v]) => `${k}:${v}`).join("  "));

  // ── mapear contatos → leads ──
  const conRows = parseRows(extractInserts(sql, "contatos"));
  const leads = conRows
    .filter((r) => r.length === 16 && toInt(r[0]) != null)
    .filter((r) => clean(r[5]) && !isSpam(r[5], r[6], r[8], r[11]))
    .map((r) => ({
      legacy_id: toInt(r[0])!,
      nome: clean(r[5])!.slice(0, 200),
      email: (cell(r[6]) ?? "").trim().toLowerCase().slice(0, 160) || null,
      telefone: firstPhone(cell(r[8])),
      // con_origem é um código numérico do legado sem tabela de-para no dump → 'legado'
      origem: "legado",
      tipo_interesse: INTERESSE[toInt(r[3]) ?? 0] ?? "compra",
      observacoes: clean(r[11]),
      corretor_legado: toInt(r[2]) ?? 0,
      imovel_interesse_id: clean(r[12])?.slice(0, 64) ?? null,
      created_at: fixDate(cell(r[14])) ?? null,
    }));
  console.log(`  → ${leads.length}/${conRows.length} leads válidos`);

  if (DRY_RUN) {
    console.log("  [dry-run] cliente:", JSON.stringify(clientes[0], null, 2));
    console.log("  [dry-run] lead:", JSON.stringify(leads[0], null, 2));
    console.log("\n✓ dry-run concluído (nada gravado)");
    return;
  }

  const conn = await mysql.createConnection(connConfig());

  // resolver corretor legado (cor_id) → user.id novo (via e-mail em profiles/user)
  const corretorId: Record<number, string | null> = {};
  async function resolveCorretor(legId: number): Promise<string | null> {
    if (!legId) return null;
    if (legId in corretorId) return corretorId[legId];
    const email = corretorEmails[legId];
    let id: string | null = null;
    if (email) {
      const [rows] = await conn.query<any[]>(
        "SELECT id FROM `user` WHERE lower(email)=lower(?) LIMIT 1", [email]);
      id = rows[0]?.id ?? null;
    }
    corretorId[legId] = id;
    return id;
  }

  // 1) clientes
  const CLI_COLS = ["legacy_id","nome","email","telefone","telefone_obs","endereco",
    "cidade","estado","cep","tipo","corretor_id","ativo"] as const;
  const ph = `(${CLI_COLS.map(() => "?").join(",")})`;
  const upd = CLI_COLS.filter((c) => c !== "legacy_id").map((c) => `${c}=VALUES(${c})`).join(",");
  let done = 0;
  for (let i = 0; i < clientes.length; i += BATCH) {
    const batch = clientes.slice(i, i + BATCH);
    const params: unknown[] = [];
    for (const c of batch) {
      const cor = await resolveCorretor(c.corretor_legado);
      params.push(c.legacy_id, c.nome, c.email, c.telefone, c.telefone_obs, c.endereco,
        c.cidade, c.estado, c.cep, c.tipo, cor, c.ativo);
    }
    await conn.query(
      `INSERT INTO clientes (${CLI_COLS.join(",")}) VALUES ${batch.map(() => ph).join(",")} ` +
      `ON DUPLICATE KEY UPDATE ${upd}`, params);
    done += batch.length;
    process.stdout.write(`  ✔ clientes ${done}/${clientes.length}\r`);
  }
  console.log(`  ✔ ${done} clientes gravados                       `);

  // 2) vínculo imoveis.proprietario_id + colunas inline (legacy_id → clientes → codigo_imovel)
  //    O admin (AdminPropertiesContext/PropertyForm) lê/edita os campos DENORMALIZADOS
  //    proprietario_nome/telefone/email — não o FK. Por isso espelhamos os dados do
  //    cliente nessas colunas (só onde o nome inline está vazio, p/ não sobrescrever
  //    edição manual). proprietario_documento não tem origem no legado.
  const [cliIdRows] = await conn.query<any[]>(
    "SELECT id, legacy_id, nome, telefone, email FROM clientes WHERE legacy_id IS NOT NULL");
  const cliByLegacy: Record<number, { id: string; nome: string; telefone: string | null; email: string | null }> = {};
  for (const row of cliIdRows) cliByLegacy[row.legacy_id] = row;
  let vinc = 0;
  for (let i = 0; i < imovelProp.length; i += BATCH) {
    const batch = imovelProp.slice(i, i + BATCH);
    for (const x of batch) {
      const c = cliByLegacy[x.propLegacy];
      if (!c) continue;
      const [res]: any = await conn.query(
        `UPDATE imoveis SET
           proprietario_id = ?,
           proprietario_nome = ?,
           proprietario_telefone = COALESCE(NULLIF(?, ''), proprietario_telefone),
           proprietario_email = COALESCE(NULLIF(?, ''), proprietario_email)
         WHERE codigo_imovel = ?
           AND (proprietario_nome IS NULL OR proprietario_nome = '' OR proprietario_id = ?)`,
        [c.id, c.nome, c.telefone ?? "", c.email ?? "", x.codigo, c.id]);
      vinc += res.affectedRows ? 1 : 0;
    }
    process.stdout.write(`  ✔ vínculos ${Math.min(i + BATCH, imovelProp.length)}/${imovelProp.length}\r`);
  }
  console.log(`  ✔ ${vinc} imóveis vinculados ao proprietário        `);

  // 3) leads
  const LEAD_COLS = ["legacy_id","nome","email","telefone","origem","tipo_interesse",
    "observacoes","corretor_id","imovel_interesse_id","created_at"] as const;
  const lph = `(${LEAD_COLS.map(() => "?").join(",")})`;
  const lupd = LEAD_COLS.filter((c) => c !== "legacy_id").map((c) => `${c}=VALUES(${c})`).join(",");
  done = 0;
  for (let i = 0; i < leads.length; i += BATCH) {
    const batch = leads.slice(i, i + BATCH);
    const params: unknown[] = [];
    for (const l of batch) {
      const cor = await resolveCorretor(l.corretor_legado);
      params.push(l.legacy_id, l.nome, l.email, l.telefone, l.origem, l.tipo_interesse,
        l.observacoes, cor, l.imovel_interesse_id, l.created_at);
    }
    await conn.query(
      `INSERT INTO leads (${LEAD_COLS.join(",")}) VALUES ${batch.map(() => lph).join(",")} ` +
      `ON DUPLICATE KEY UPDATE ${lupd}`, params);
    done += batch.length;
    process.stdout.write(`  ✔ leads ${done}/${leads.length}\r`);
  }
  console.log(`  ✔ ${done} leads gravados                          `);

  await conn.end();
  console.log("\n✓ import concluído");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
