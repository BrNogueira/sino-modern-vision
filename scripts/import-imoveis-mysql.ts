/**
 * ETL: MySQL legado (sinos7596_maya) → novo MySQL (Model B / imoveis)
 *
 * Lê sinos7596_maya.sql, transforma `produtos` (+ cidades, categorias_subcat,
 * img_pasta_prod) e insere na tabela `imoveis` do novo schema (Model B).
 *
 * Idempotente por `codigo_imovel` (INSERT ... ON DUPLICATE KEY UPDATE).
 *
 * Uso:
 *   npx tsx scripts/import-imoveis-mysql.ts            # importa
 *   npx tsx scripts/import-imoveis-mysql.ts --dry-run  # só conta, não escreve
 *
 * Env (.env):
 *   DATABASE_URL=mysql://user:pass@host:port/db   (ou as MYSQL_* abaixo)
 *   MYSQL_HOST / MYSQL_PORT / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE
 *   LEGACY_IMG_BASE   base das imagens do site antigo (ex.: https://sinos.com.br/uploads)
 *                     URL final = `${LEGACY_IMG_BASE}/<pasta>/<arquivo>`
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
const BATCH = 100;
const LEGACY_IMG_BASE = (process.env.LEGACY_IMG_BASE ?? "").replace(/\/+$/, "");

// ──────────────────────────────────────────────────────────────
// Helpers de parse do dump (reaproveitados do migrate-legacy-db.ts)
// ──────────────────────────────────────────────────────────────
function readSqlFile(): string {
  console.log(`📂 Lendo ${SQL_FILE} ...`);
  // O dump é UTF-8 (CHARSET=utf8); ler como latin1 causa mojibake (Ó→Ã).
  return fs.readFileSync(SQL_FILE, { encoding: "utf8" });
}

/**
 * Extrai a região de tuplas de TODOS os INSERTs de uma tabela, de forma robusta:
 *  - itera cada statement `INSERT INTO \`table\`` (fatia até o próximo marcador)
 *  - descarta a lista de colunas pegando só o que vem após o primeiro `VALUES`
 *  - concatena as regiões; o scanner (parseInsertValues) ignora `;`/`,` entre tuplas
 * Robusto contra `;` dentro de strings (descrições/HTML do legado).
 */
function extractInserts(sql: string, table: string): string {
  const tableMarker = "INSERT INTO `" + table + "`";
  // Fronteiras = todo INSERT de QUALQUER tabela (bound do statement no próximo
  // INSERT, evitando varrer até EOF quando a tabela tem 1 INSERT multi-linha).
  const anyMarker = /INSERT INTO `[A-Za-z0-9_]+`/g;
  const positions: { idx: number; name: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = anyMarker.exec(sql))) positions.push({ idx: m.index, name: m[0] });

  const out: string[] = [];
  for (let k = 0; k < positions.length; k++) {
    if (positions[k].name !== tableMarker) continue;
    const start = positions[k].idx;
    const end = k + 1 < positions.length ? positions[k + 1].idx : sql.length;
    const stmt = sql.slice(start, end);
    const v = stmt.search(/\bVALUES\b/i);
    if (v !== -1) out.push(stmt.slice(v + "VALUES".length));
  }
  return out.join("\n");
}

function fixDate(val: string | null): string | null {
  if (!val) return null;
  if (val.startsWith("0000-00-00")) return null;
  return val;
}

function toBool(val: string | null): boolean {
  return val === "1";
}

/** Scanner de tuplas (...),(...) respeitando strings/escapes → array de rows.
 *  Recebe a região já posicionada após o `VALUES` (ver extractInserts). */
function parseInsertValues(insertSql: string): string[][] {
  const cur = insertSql;
  const rows: string[][] = [];
  let i = 0;
  while (i < cur.length) {
    if (cur[i] !== "(") { i++; continue; }
    i++;
    const row: string[] = [];
    let field = "";
    let inStr = false;
    let strChar = "";
    while (i < cur.length) {
      const c = cur[i];
      if (!inStr && (c === "'" || c === '"')) { inStr = true; strChar = c; i++; continue; }
      if (inStr) {
        if (c === "\\" && i + 1 < cur.length) {
          const n = cur[i + 1];
          if (n === "n") { field += "\n"; i += 2; continue; }
          if (n === "r") { field += "\r"; i += 2; continue; }
          if (n === "t") { field += "\t"; i += 2; continue; }
          if (n === "'" || n === '"' || n === "\\") { field += n; i += 2; continue; }
          field += c; i++; continue;
        }
        if (c === strChar) {
          if (i + 1 < cur.length && cur[i + 1] === strChar) { field += c; i += 2; continue; }
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

/** Decodifica célula raw: NULL/'' → null */
function cell(raw: string | undefined): string | null {
  if (raw === undefined || raw === "NULL" || raw === "") return null;
  return raw;
}

function toNum(raw: string | undefined): number | null {
  const v = cell(raw);
  if (v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function toInt(raw: string | undefined): number | null {
  const v = cell(raw);
  if (v == null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

// código_legado do estado → sigla → nome (Model B usa nome por extenso)
const UF: Record<number, string> = {
  1:"AC",2:"AL",3:"AP",4:"AM",5:"BA",6:"CE",7:"DF",8:"ES",9:"GO",10:"MA",
  11:"MT",12:"MS",13:"MG",14:"PA",15:"PB",16:"PR",17:"PE",18:"PI",19:"RJ",
  20:"RN",21:"RS",22:"RO",23:"RR",24:"SC",25:"SP",26:"SE",27:"TO",
};
const UF_NOME: Record<string, string> = {
  AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",
  DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",
  MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",
  PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",
  RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",
  SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins",
};

// ──────────────────────────────────────────────────────────────
// Lookups
// ──────────────────────────────────────────────────────────────
function buildCidadeNomes(sql: string): Record<number, string> {
  // cidades: id_cidade, dsc_cidade, cod_estado
  const map: Record<number, string> = {};
  parseInsertValues(extractInserts(sql, "cidades")).forEach((r) => {
    const id = parseInt(r[0], 10);
    if (!isNaN(id)) map[id] = cell(r[1]) ?? "";
  });
  return map;
}

/**
 * Classifica o tipo do imóvel a partir do título/descrição.
 * O dump legado NÃO tem vínculo limpo produto→tipo (produtos_caract vazio,
 * categoria_id NULL, produtos.tipo aponta para faixa_valor). Inferimos pelos
 * 11 tipos canônicos do legado (categorias_subcat grupo=tipo_imovel).
 */
const TIPO_KEYWORDS: [RegExp, string][] = [
  [/apartament|\bapto\b|\bap\b|cobertura|loft|studio|kitnet|kitchenette/i, "Apartamentos"],
  [/lan[çc]amento/i, "Lançamentos"],
  [/condom[íi]nio/i, "Condomínios"],
  [/pavilh[ãa]o|galp[ãa]o|dep[óo]sito|armaz[ée]m|ind[úu]stria/i, "Pavilhões"],
  [/sala comercial|conjunto comercial|\bsala\b|\bloja\b|sal[ãa]o|escrit[óo]rio/i, "Sala comercial"],
  [/comercial|comérci|ponto comercial/i, "Comerciais"],
  [/s[íi]tio|ch[áa]cara|fazenda|haras/i, "Sítios"],
  [/terreno de esquina|esquina/i, "Terrenos de Esquina"],
  [/terreno|lote|loteamento/i, "Terrenos"],
  [/permuta/i, "Permutas"],
  [/casa|sobrado|resid[êe]ncia/i, "Casas"],
];

function classifyOne(texto: string | null): string | null {
  if (!texto) return null;
  for (const [re, nome] of TIPO_KEYWORDS) if (re.test(texto)) return nome;
  return null;
}

/** Classifica priorizando o título (sinal mais forte); cai pro corpo se preciso. */
function classifyTipo(titulo: string | null, ...fallback: (string | null)[]): string {
  return (
    classifyOne(titulo) ??
    classifyOne(fallback.filter(Boolean).join(" ")) ??
    "Imóvel"
  );
}

function buildImagens(sql: string): Record<number, { url: string; principal: boolean }[]> {
  // img_pasta_prod: id, produto_id, pasta, src, posicao, legenda, width, height, tipo
  const byProduto: Record<number, { url: string; pos: number }[]> = {};
  parseInsertValues(extractInserts(sql, "img_pasta_prod")).forEach((r) => {
    const prod = parseInt(r[1], 10);
    const pasta = cell(r[2]) ?? "";
    const arquivo = cell(r[3]);
    if (isNaN(prod) || prod <= 0 || !arquivo) return;
    const rel = [pasta, arquivo].filter(Boolean).join("/");
    const url = LEGACY_IMG_BASE ? `${LEGACY_IMG_BASE}/${rel}` : rel;
    (byProduto[prod] ??= []).push({ url, pos: parseInt(r[4], 10) || 0 });
  });
  const out: Record<number, { url: string; principal: boolean }[]> = {};
  for (const [prod, arr] of Object.entries(byProduto)) {
    arr.sort((a, b) => a.pos - b.pos);
    out[Number(prod)] = arr.map((x, idx) => ({ url: x.url, principal: idx === 0 }));
  }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Mapeamento produtos → imoveis (Model B)
// ──────────────────────────────────────────────────────────────
// produtos: 0:id 2:corretor 3:empreendimento 5:titulo 6:title 9:descricao
// 10:conteudo 11:imagem 12:imagem2 13:lancamento 14:destaque 15:status
// 16:posicao 17:created 18:modified 21:valor 22:cidade 23:estado 24:tipo
// 25:dimensoes 26:dormitorios 27:status_obra 28:cod 29:categoria_id
// 30:dados_proprietario 34:informacoes 36:latitude 37:longitude 39:cep
// 40:video 46:iptu 50:ano_construcao

function mapImovel(
  r: string[],
  cidadeNomes: Record<number, string>,
  imagens: Record<number, { url: string; principal: boolean }[]>,
  codigoSeen: Set<string>,
) {
  const legacyId = parseInt(r[0], 10);
  const valor = toNum(r[21]);
  // produtos.tipo (r[24]) é faixa_valor no legado, não transação; sem sinal
  // confiável de aluguel → tratamos tudo como venda por padrão.
  const isAluguel = false;

  // codigo_imovel: preferir o `cod` legado, garantindo unicidade
  let codigo = (cell(r[28]) ?? "").trim() || `IMV-${legacyId}`;
  if (codigoSeen.has(codigo)) codigo = `${codigo}-${legacyId}`;
  codigoSeen.add(codigo);

  const tipoNome = classifyTipo(cell(r[5]), cell(r[9]), cell(r[10]));
  const uf = UF[parseInt(r[23], 10) || 0] ?? "RS";
  const fotos = imagens[legacyId] ?? [];
  const mainFromField = cell(r[11]);
  if (fotos.length === 0 && mainFromField) {
    const url = LEGACY_IMG_BASE ? `${LEGACY_IMG_BASE}/${mainFromField}` : mainFromField;
    fotos.push({ url, principal: true });
  }

  return {
    codigo_imovel: codigo,
    titulo_imovel: cell(r[5]) ?? `Imóvel ${legacyId}`,
    tipo_imovel: tipoNome,
    sub_tipo_imovel: tipoNome,
    categoria_imovel: "Padrão",
    tipo_oferta: isAluguel ? 2 : 1,
    modalidade: JSON.stringify(isAluguel ? ["aluguel"] : ["venda"]),

    cep: cell(r[39]) ?? "",
    estado: UF_NOME[uf] ?? "Rio Grande do Sul",
    cidade: cidadeNomes[parseInt(r[22], 10) || 0] ?? "",
    bairro: null,
    latitude: cell(r[36]),
    longitude: cell(r[37]),

    preco_venda: isAluguel ? null : valor,
    preco_aluguel: isAluguel ? valor : null,
    iptu: toNum(r[46]),

    area_dimensions: cell(r[25]),
    qtd_dormitorios: toInt(r[26]),
    ano_construcao: toInt(r[50]),

    observacao: cell(r[34]),
    descricao_curta: cell(r[9]),
    fotos: JSON.stringify(fotos),
    video_url: cell(r[40]),
    features: JSON.stringify({}),
    garantias: JSON.stringify({}),

    ativo: toBool(cell(r[15])) ? 1 : 0,
    destaque: toBool(cell(r[14])) ? 1 : 0,
    exclusivo: 0,

    created_at: fixDate(cell(r[17])),
    updated_at: fixDate(cell(r[18])),
  };
}

// ──────────────────────────────────────────────────────────────
// Conexão MySQL
// ──────────────────────────────────────────────────────────────
function connConfig(): mysql.ConnectionOptions {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL as any;
  return {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT ?? "3306", 10),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "sino",
    charset: "utf8mb4",
  };
}

const COLS = [
  "codigo_imovel","titulo_imovel","tipo_imovel","sub_tipo_imovel","categoria_imovel",
  "tipo_oferta","modalidade","cep","estado","cidade","bairro","latitude","longitude",
  "preco_venda","preco_aluguel","iptu","area_dimensions","qtd_dormitorios","ano_construcao",
  "observacao","descricao_curta","fotos","video_url","features","garantias",
  "ativo","destaque","exclusivo","created_at","updated_at",
] as const;

async function main() {
  console.log(`\n▶ Import imóveis legado → MySQL ${DRY_RUN ? "(DRY-RUN)" : ""}`);
  if (!LEGACY_IMG_BASE) {
    console.log("⚠ LEGACY_IMG_BASE não definido — URLs de fotos ficarão relativas (pasta/arquivo).");
  }

  const sql = readSqlFile();
  const cidadeNomes = buildCidadeNomes(sql);
  const imagens = buildImagens(sql);
  console.log(`  lookups: ${Object.keys(cidadeNomes).length} cidades, ${Object.keys(imagens).length} imóveis com fotos`);

  const produtos = parseInsertValues(extractInserts(sql, "produtos"));
  const codigoSeen = new Set<string>();
  const mapped = produtos
    .filter((r) => r.length === 57 && !isNaN(parseInt(r[0], 10)))
    .map((r) => mapImovel(r, cidadeNomes, imagens, codigoSeen));

  const totalFotos = mapped.reduce((s, m) => s + (JSON.parse(m.fotos) as []).length, 0);
  const ativos = mapped.filter((m) => m.ativo === 1).length;
  console.log(`  → ${mapped.length} imóveis mapeados (${ativos} ativos · ${totalFotos} fotos)`);
  const tipoDist: Record<string, number> = {};
  mapped.forEach((m) => { tipoDist[m.tipo_imovel] = (tipoDist[m.tipo_imovel] ?? 0) + 1; });
  console.log("  tipos inferidos:", Object.entries(tipoDist).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`).join("  "));

  if (DRY_RUN) {
    console.log("  [dry-run] amostra:", JSON.stringify(mapped[0], null, 2).slice(0, 800));
    console.log("\n✓ dry-run concluído (nada gravado)");
    return;
  }

  const conn = await mysql.createConnection(connConfig());
  const placeholders = `(${COLS.map(() => "?").join(",")})`;
  const updateClause = COLS.filter((c) => c !== "codigo_imovel")
    .map((c) => `${c}=VALUES(${c})`).join(",");

  let done = 0;
  for (let i = 0; i < mapped.length; i += BATCH) {
    const batch = mapped.slice(i, i + BATCH);
    const sqlIns =
      `INSERT INTO imoveis (${COLS.join(",")}) VALUES ${batch.map(() => placeholders).join(",")} ` +
      `ON DUPLICATE KEY UPDATE ${updateClause}`;
    const params = batch.flatMap((m) => COLS.map((c) => (m as any)[c]));
    await conn.execute(sqlIns, params);
    done += batch.length;
    process.stdout.write(`  ✔ ${done}/${mapped.length}\r`);
  }
  console.log(`  ✔ ${done} imóveis gravados em imoveis            `);
  await conn.end();
  console.log("\n✓ import concluído");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
