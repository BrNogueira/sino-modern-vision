/**
 * Script de migração: MySQL legado → Supabase PostgreSQL
 *
 * Lê o arquivo sinos7596_maya.sql, extrai e transforma os dados
 * das tabelas relevantes e insere via Supabase Admin API.
 *
 * Uso:
 *   npx tsx scripts/migrate-legacy-db.ts
 *
 * Variáveis de ambiente necessárias (.env):
 *   VITE_SUPABASE_URL     - URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (não usar anon key!)
 *
 * Flags:
 *   --dry-run   Apenas mostra o que seria feito, sem inserir
 *   --table=X   Migra apenas a tabela especificada
 *               (categorias | cidades | corretores | empreendimentos |
 *                imoveis | imagens | historico | caracteristicas)
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// ──────────────────────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────────────────────

const SQL_FILE = path.resolve(__dirname, "../sinos7596_maya.sql");
const BATCH_SIZE = 100; // INSERT por batch

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const TABLE_FILTER = args.find((a) => a.startsWith("--table="))?.split("=")[1];

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

/** Lê o SQL completo em memória */
function readSqlFile(): string {
  console.log(`📂 Lendo ${SQL_FILE} ...`);
  return fs.readFileSync(SQL_FILE, { encoding: "latin1" });
}

/** Extrai bloco INSERT de uma tabela */
function extractInserts(sql: string, tableName: string): string {
  const regex = new RegExp(
    `INSERT INTO \`${tableName}\`[^;]+;`,
    "gis"
  );
  const matches = sql.match(regex) || [];
  return matches.join("\n");
}

/** Converte datetime MySQL '0000-00-00 00:00:00' para null */
function fixDate(val: string | null): string | null {
  if (!val) return null;
  if (val.startsWith("0000-00-00")) return null;
  return val;
}

/** Converta tinyint 1/0 para boolean */
function toBool(val: string | number | null): boolean {
  return val === 1 || val === "1";
}

/** Converte texto de valor legado "1.500.000,00" → número */
function parseBRL(val: string | null): number | null {
  if (!val) return null;
  const cleaned = val.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Parse simples de VALUES MySQL para array de rows */
function parseInsertValues(insertSql: string): string[][] {
  // Remove o INSERT INTO `table` (...) VALUES
  const valuesMatch = insertSql.match(/VALUES\s*([\s\S]+?);?\s*$/i);
  if (!valuesMatch) return [];

  const rows: string[][] = [];
  let current = valuesMatch[1].trim();

  // Remove trailing semicolon
  if (current.endsWith(";")) current = current.slice(0, -1);

  // Tokenize respeitando strings com escapes
  let i = 0;
  while (i < current.length) {
    if (current[i] !== "(") { i++; continue; }

    // Lê uma row completa
    i++; // skip '('
    const row: string[] = [];
    let field = "";
    let inStr = false;
    let strChar = "";

    while (i < current.length) {
      const c = current[i];

      if (!inStr && (c === "'" || c === '"')) {
        inStr = true;
        strChar = c;
        i++;
        continue;
      }

      if (inStr) {
        if (c === "\\" && i + 1 < current.length) {
          // escape sequence
          const next = current[i + 1];
          if (next === "n") { field += "\n"; i += 2; continue; }
          if (next === "r") { field += "\r"; i += 2; continue; }
          if (next === "t") { field += "\t"; i += 2; continue; }
          if (next === "'" || next === '"' || next === "\\") {
            field += next; i += 2; continue;
          }
          field += c; i++; continue;
        }
        if (c === strChar) {
          // Checar se é '' (escape de aspas em SQL)
          if (i + 1 < current.length && current[i + 1] === strChar) {
            field += c; i += 2; continue;
          }
          inStr = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }

      // Fora de string
      if (c === ",") {
        row.push(field.trim());
        field = "";
        i++;
        continue;
      }
      if (c === ")") {
        row.push(field.trim());
        rows.push(row);
        i++; // skip ')'
        break;
      }
      field += c;
      i++;
    }
  }

  return rows;
}

/** Decodifica uma célula raw (NULL | 'string' | número) */
function cell(raw: string): string | null {
  if (raw === "NULL" || raw === "") return null;
  return raw;
}

/** Insere em batch no Supabase com retry simples */
async function upsertBatch(table: string, rows: object[], conflict?: string) {
  if (DRY_RUN) {
    console.log(`  [dry-run] ${rows.length} rows → ${table}`);
    return;
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const query = conflict
      ? supabase.from(table).upsert(batch, { onConflict: conflict })
      : supabase.from(table).upsert(batch);

    const { error } = await query;
    if (error) {
      console.error(`  ❌ Erro em ${table} (batch ${i}):`, error.message);
      throw error;
    }
    process.stdout.write(`  ✔ ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ✔ ${rows.length} rows inseridas em ${table}             `);
}

// ──────────────────────────────────────────────────────────────
// MAPEAMENTO ESTADOS (código_legado → sigla)
// ──────────────────────────────────────────────────────────────
const ESTADOS: Record<number, string> = {
  1:"AC",2:"AL",3:"AP",4:"AM",5:"BA",6:"CE",7:"DF",8:"ES",9:"GO",
  10:"MA",11:"MT",12:"MS",13:"MG",14:"PA",15:"PB",16:"PR",17:"PE",
  18:"PI",19:"RJ",20:"RN",21:"RS",22:"RO",23:"RR",24:"SC",25:"SP",
  26:"SE",27:"TO"
};

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: CATEGORIAS (categorias_subcat)
// ──────────────────────────────────────────────────────────────
async function migrarCategorias(sql: string) {
  console.log("\n📦 Migrando categorias...");
  const raw = extractInserts(sql, "categorias_subcat");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return {}; }

  // Colunas: id, imagem, posicao, status, conteudo, titulo, created, modified, grupo
  const rows = parseInsertValues(raw);
  const legacyMap: Record<number, string> = {}; // legacy_id → UUID

  const mapped = rows.map((r) => ({
    legacy_id: parseInt(r[0]),
    titulo:    cell(r[5]) ?? "(sem título)",
    grupo:     cell(r[8]),
    posicao:   parseInt(r[2]) || 0,
    ativo:     toBool(cell(r[3])),
  }));

  await upsertBatch("categorias", mapped, "legacy_id");

  // Busca UUIDs gerados para montar o mapa
  if (!DRY_RUN) {
    const { data } = await supabase
      .from("categorias")
      .select("id, legacy_id")
      .not("legacy_id", "is", null);
    data?.forEach((d) => { legacyMap[d.legacy_id] = d.id; });
  }

  console.log(`  → ${mapped.length} categorias`);
  return legacyMap;
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: CIDADES
// ──────────────────────────────────────────────────────────────
async function migrarCidades(sql: string) {
  console.log("\n📦 Migrando cidades...");
  const raw = extractInserts(sql, "cidades");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return {}; }

  // Colunas: id_cidade, dsc_cidade, cod_estado
  const rows = parseInsertValues(raw);
  const legacyMap: Record<number, string> = {};

  const mapped = rows.map((r) => ({
    legacy_id:     parseInt(r[0]),
    nome:          cell(r[1]) ?? "",
    estado_codigo: parseInt(r[2]) || 0,
    estado_sigla:  ESTADOS[parseInt(r[2])] ?? "",
  }));

  await upsertBatch("cidades", mapped, "legacy_id");

  if (!DRY_RUN) {
    const { data } = await supabase
      .from("cidades")
      .select("id, legacy_id")
      .not("legacy_id", "is", null);
    data?.forEach((d) => { legacyMap[d.legacy_id] = d.id; });
  }

  console.log(`  → ${mapped.length} cidades`);
  return legacyMap;
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: CORRETORES (profiles)
// ──────────────────────────────────────────────────────────────
async function migrarCorretores(sql: string) {
  console.log("\n📦 Migrando corretores (profiles)...");
  const raw = extractInserts(sql, "corretores");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return {}; }

  // Colunas: cor_id, cor_nome, cor_email, cor_senha, cor_status, cor_created, cor_modified
  const rows = parseInsertValues(raw);
  const legacyMap: Record<number, string> = {};

  // Para corretores: precisamos criar users no Supabase Auth OU
  // inserir em profiles sem FK de auth.users quando não há usuário.
  // Usamos uma tabela auxiliar corretor_legacy para mapeamento.
  // Por ora, inserimos apenas o perfil com legacy_id para referência.

  // Verificar se já existe tabela corretor_legacy no schema
  const mapped = rows
    .filter((r) => toBool(cell(r[4]))) // apenas ativos
    .map((r) => ({
      legacy_corretor_id: parseInt(r[0]),
      full_name: (cell(r[1]) ?? "").trim(),
      email:     (cell(r[2]) ?? "").toLowerCase().trim(),
      active:    true,
      phone:     "",
      creci:     "",
      avatar_url:"",
    }));

  // Inserir na tabela corretor_legado (sem FK auth.users)
  // Esta tabela é criada separadamente para mapeamento
  const { data: existing } = await supabase
    .from("corretores_legado")
    .select("id, legacy_corretor_id");

  if (existing === null) {
    console.log(
      "  ⚠ Tabela corretores_legado não existe.\n" +
      "    Execute primeiro a migration: 20260405120001_corretores_legado.sql"
    );
    return {};
  }

  await upsertBatch("corretores_legado", mapped, "legacy_corretor_id");

  if (!DRY_RUN) {
    const { data } = await supabase
      .from("corretores_legado")
      .select("id, legacy_corretor_id");
    data?.forEach((d) => { legacyMap[d.legacy_corretor_id] = d.id; });
  }

  console.log(`  → ${mapped.length} corretores`);
  return legacyMap;
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: EMPREENDIMENTOS (condominios)
// ──────────────────────────────────────────────────────────────
async function migrarEmpreendimentos(sql: string) {
  console.log("\n📦 Migrando empreendimentos (condominios)...");
  const raw = extractInserts(sql, "empreendimentos");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return {}; }

  // Colunas: emp_id, emp_nome, emp_nome_sindico, emp_nome_zelador, emp_ano_construcao, emp_caracteristicas
  const rows = parseInsertValues(raw);
  const legacyMap: Record<number, string> = {};

  const mapped = rows.map((r) => {
    let caract: Record<string, string> = {};
    try { caract = JSON.parse(cell(r[5]) ?? "{}"); } catch {}

    return {
      nome:             (cell(r[1]) ?? "").trim(),
      sindico:          cell(r[2]) ?? "",
      estado:           "RS",
      cidade:           "",
      bairro:           "",
      endereco:         "",
      cep:              "",
      administradora:   "",
      observacoes:      `Zelador: ${cell(r[3]) ?? ""} | Ano: ${cell(r[4]) ?? ""}`.trim(),
      qtd_unidades:     parseInt(caract["81"]) || 0,
      qtd_blocos:       parseInt(caract["83"]) || 0,
      ativo:            true,
      // legacy_id inserido em campo extra (adicionado via migration)
      legacy_emp_id:    parseInt(r[0]),
    };
  });

  await upsertBatch("condominios", mapped, "legacy_emp_id");

  if (!DRY_RUN) {
    const { data } = await supabase
      .from("condominios")
      .select("id, legacy_emp_id")
      .not("legacy_emp_id", "is", null);
    data?.forEach((d) => { legacyMap[d.legacy_emp_id] = d.id; });
  }

  console.log(`  → ${mapped.length} empreendimentos`);
  return legacyMap;
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: IMOVEIS (produtos)
// ──────────────────────────────────────────────────────────────
async function migrarImoveis(
  sql: string,
  cidadesMap: Record<number, string>,
  corretoresMap: Record<number, string>,
  condominiosMap: Record<number, string>
) {
  console.log("\n📦 Migrando imóveis (produtos)...");
  const raw = extractInserts(sql, "produtos");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return {}; }

  const cidadeNomes = await buildCidadeNomes(sql);

  // Colunas produtos (ordem do INSERT):
  // 0:id 1:pre_cadastro 2:corretor 3:empreendimento 4:codigo_pre_cadastro
  // 5:titulo 6:title 7:metad 8:metak 9:descricao 10:conteudo
  // 11:imagem 12:imagem2 13:lancamento 14:destaque 15:status
  // 16:posicao 17:created 18:modified 19:quantidade 20:pdf_src
  // 21:valor 22:cidade 23:estado 24:tipo 25:dimensoes 26:dormitorios
  // 27:status_obra 28:cod 29:categoria_id 30:dados_proprietario
  // 31:placa 32:chave 33:mapa 34:informacoes 35:ordena_admin
  // 36:latitude 37:longitude 38:viva_real 39:cep 40:video
  // 41:caracteristicas 42:como_achou 43:tempo_venda
  // 44:matricula 45:matricula_observacao 46:iptu 47:dick
  // 48:proprietario_dick 49:links 50:ano_construcao
  // 51:apto_financiamento 52:apto_financiamento_observacao
  // 53:acabamentos 54:valor_corretor 55:caracteristicas_observacao
  // 56:acabamentos_observacao

  const rows = parseInsertValues(raw);
  const legacyMap: Record<number, string> = {};

  const mapped = rows.map((r) => {
    const legacyId = parseInt(r[0]);
    const cidadeLegacy = parseInt(r[22]) || 0;
    const estadoLegacy = parseInt(r[23]) || 0;
    const corretorLegacy = parseInt(r[2]) || 0;
    const empLegacy = parseInt(r[3]) || 0;
    const lat = parseFloat(cell(r[36]) ?? "") || null;
    const lng = parseFloat(cell(r[37]) ?? "") || null;

    // Detectar tipo de transação a partir do tipo legado
    // (37=Aluguéis, 38=Vendas → usamos default venda)
    const tipoLegacy = parseInt(r[24]) || 0;
    let transacao = "venda";
    if (tipoLegacy === 37) transacao = "aluguel";

    return {
      legacy_id:                  legacyId,
      cod_referencia:             cell(r[28]),
      titulo:                     cell(r[5]),
      titulo_ingles:              cell(r[6]),
      descricao:                  cell(r[9]),
      conteudo:                   cell(r[10]),
      meta_descricao:             cell(r[7]),
      meta_keywords:              cell(r[8]),
      informacoes:                cell(r[34]),
      tipo:                       null, // preenchido na fase de categorias
      tipo_legacy_id:             tipoLegacy || null,
      categoria_legacy_id:        parseInt(r[29]) || null,
      transacao,
      preco:                      parseFloat(cell(r[21]) ?? "") || 0,
      valor_corretor:             parseFloat(cell(r[54]) ?? "") || null,
      iptu:                       parseFloat(cell(r[46]) ?? "") || 0,
      cep:                        cell(r[39]),
      cidade:                     cidadeNomes[cidadeLegacy] ?? null,
      cidade_legacy_id:           cidadeLegacy || null,
      estado:                     ESTADOS[estadoLegacy] ?? "RS",
      latitude:                   lat,
      longitude:                  lng,
      dimensoes:                  cell(r[25]),
      dormitorios:                cell(r[26]),
      ano_construcao:             cell(r[50]),
      status_obra:                cell(r[27]),
      apto_financiamento:         cell(r[51]),
      apto_financiamento_obs:     cell(r[52]),
      acabamentos:                cell(r[53]),
      acabamentos_obs:            cell(r[56]),
      caracteristicas_obs:        cell(r[55]),
      ativo:                      toBool(cell(r[15])),
      destaque:                   toBool(cell(r[14])),
      lancamento:                 toBool(cell(r[13])),
      viva_real:                  toBool(cell(r[38])),
      imagem_principal:           cell(r[11]),
      imagem_secundaria:          cell(r[12]),
      video_url:                  cell(r[40]),
      pdf_src:                    cell(r[20]),
      posicao:                    parseInt(r[16]) || null,
      quantidade:                 parseInt(r[19]) || null,
      placa:                      parseInt(r[31]) || null,
      chave:                      parseInt(r[32]) || null,
      tempo_venda:                cell(r[43]),
      como_achou:                 parseInt(r[42]) || 0,
      matricula:                  cell(r[44]),
      matricula_obs:              cell(r[45]),
      dados_proprietario:         cell(r[30]),
      links:                      cell(r[49]),
      dick:                       cell(r[47]),
      proprietario_dick:          cell(r[48]),
      corretor_legacy_id:         corretorLegacy || null,
      corretor_id:                corretoresMap[corretorLegacy] ?? null,
      empreendimento_legacy_id:   empLegacy || null,
      condominio_id:              condominiosMap[empLegacy] ?? null,
      created_at:                 fixDate(cell(r[17])) ?? undefined,
      updated_at:                 fixDate(cell(r[18])) ?? undefined,
    };
  });

  await upsertBatch("imoveis", mapped, "legacy_id");

  if (!DRY_RUN) {
    // Busca por partes para não ultrapassar limites
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("imoveis")
        .select("id, legacy_id")
        .not("legacy_id", "is", null)
        .range(from, from + pageSize - 1);
      if (!data || data.length === 0) break;
      data.forEach((d) => { legacyMap[d.legacy_id] = d.id; });
      if (data.length < pageSize) break;
      from += pageSize;
    }
  }

  // Atualizar nome do tipo (join com categorias)
  await preencherTipoNome();

  console.log(`  → ${mapped.length} imóveis`);
  return legacyMap;
}

/** Constrói mapa id_cidade → nome para denormalização */
async function buildCidadeNomes(sql: string): Promise<Record<number, string>> {
  const raw = extractInserts(sql, "cidades");
  const rows = parseInsertValues(raw);
  const map: Record<number, string> = {};
  rows.forEach((r) => { map[parseInt(r[0])] = cell(r[1]) ?? ""; });
  return map;
}

/** Preenche campo tipo com nome da categoria */
async function preencherTipoNome() {
  if (DRY_RUN) return;
  const { data: cats } = await supabase
    .from("categorias")
    .select("legacy_id, titulo")
    .eq("grupo", "tipo_imovel");
  if (!cats) return;

  for (const cat of cats) {
    await supabase
      .from("imoveis")
      .update({ tipo: cat.titulo })
      .eq("tipo_legacy_id", cat.legacy_id);
  }
  console.log("  ✔ Tipos de imóvel preenchidos");
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: IMOVEIS_IMAGENS (img_pasta_prod)
// ──────────────────────────────────────────────────────────────
async function migrarImagens(
  sql: string,
  imoveisMap: Record<number, string>
) {
  console.log("\n📦 Migrando imagens (img_pasta_prod)...");
  const raw = extractInserts(sql, "img_pasta_prod");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return; }

  // Colunas: id, produto_id, pasta, src, posicao, legenda, width, height, tipo
  const rows = parseInsertValues(raw);

  const mapped = rows
    .filter((r) => {
      const legacyImovelId = parseInt(r[1]);
      return legacyImovelId > 0 && cell(r[3]);
    })
    .map((r) => {
      const legacyImovelId = parseInt(r[1]);
      const pasta = cell(r[2]) ?? "";
      const arquivo = cell(r[3]) ?? "";

      return {
        legacy_id:       parseInt(r[0]),
        imovel_id:       imoveisMap[legacyImovelId] ?? null,
        imovel_legacy_id: legacyImovelId,
        pasta,
        arquivo,
        // URL legada (pode ser reconstruída se o domínio for conhecido)
        url:             null,
        posicao:         parseInt(r[4]) || 0,
        legenda:         cell(r[5]),
        width:           parseInt(r[6]) || null,
        height:          parseInt(r[7]) || null,
        tipo:            parseInt(r[8]) || 1,
      };
    });

  await upsertBatch("imoveis_imagens", mapped, "legacy_id");
  console.log(`  → ${mapped.length} imagens`);
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: IMOVEIS_HISTORICO (alteracoes)
// ──────────────────────────────────────────────────────────────
async function migrarHistorico(
  sql: string,
  imoveisMap: Record<number, string>
) {
  console.log("\n📦 Migrando histórico de alterações...");
  const raw = extractInserts(sql, "alteracoes");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return; }

  // Colunas: id, produto, valorA, valorD, created
  const rows = parseInsertValues(raw);

  const mapped = rows
    .filter((r) => parseInt(r[1]) > 0)
    .map((r) => ({
      legacy_id:       parseInt(r[0]),
      imovel_id:       imoveisMap[parseInt(r[1])] ?? null,
      imovel_legacy_id: parseInt(r[1]),
      campo:           "preco",
      valor_anterior:  cell(r[2]),
      valor_novo:      cell(r[3]),
      created_at:      fixDate(cell(r[4])) ?? undefined,
    }));

  await upsertBatch("imoveis_historico", mapped, "legacy_id");
  console.log(`  → ${mapped.length} registros de histórico`);
}

// ──────────────────────────────────────────────────────────────
// MIGRAÇÃO: IMOVEIS_CARACTERISTICAS (produtos_caract)
// ──────────────────────────────────────────────────────────────
async function migrarCaracteristicas(
  sql: string,
  imoveisMap: Record<number, string>,
  categoriasMap: Record<number, string>
) {
  console.log("\n📦 Migrando características de imóveis...");
  const raw = extractInserts(sql, "produtos_caract");
  if (!raw) { console.log("  ⚠ Nenhum dado encontrado"); return; }

  // Colunas: produto_id, caract_id
  const rows = parseInsertValues(raw);

  const mapped = rows
    .filter((r) => {
      const imovelId = imoveisMap[parseInt(r[0])];
      const caractId = categoriasMap[parseInt(r[1])];
      return imovelId && caractId;
    })
    .map((r) => ({
      imovel_id:                imoveisMap[parseInt(r[0])],
      imovel_legacy_id:         parseInt(r[0]),
      caracteristica_id:        categoriasMap[parseInt(r[1])],
      caracteristica_legacy_id: parseInt(r[1]),
    }));

  // Junction table não tem legacy_id único — usar upsert por PK composta
  if (!DRY_RUN) {
    for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
      const batch = mapped.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from("imoveis_caracteristicas")
        .upsert(batch, { onConflict: "imovel_id,caracteristica_id", ignoreDuplicates: true });
      if (error) console.error("  ❌", error.message);
      process.stdout.write(`  ✔ ${Math.min(i + BATCH_SIZE, mapped.length)}/${mapped.length}\r`);
    }
    console.log(`  ✔ ${mapped.length} relações características             `);
  } else {
    console.log(`  [dry-run] ${mapped.length} relações → imoveis_caracteristicas`);
  }
}

// ──────────────────────────────────────────────────────────────
// RUNNER PRINCIPAL
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("  MIGRAÇÃO LEGADO → SUPABASE");
  console.log(`  ${DRY_RUN ? "🔍 DRY RUN (sem inserções)" : "🚀 MODO LIVE (inserindo dados)"}`);
  if (TABLE_FILTER) console.log(`  Tabela alvo: ${TABLE_FILTER}`);
  console.log("=".repeat(60));

  const sql = readSqlFile();
  console.log("  ✔ SQL carregado em memória\n");

  const only = TABLE_FILTER;

  let categoriasMap: Record<number, string> = {};
  let cidadesMap:    Record<number, string> = {};
  let corretoresMap: Record<number, string> = {};
  let condominiosMap:Record<number, string> = {};
  let imoveisMap:    Record<number, string> = {};

  if (!only || only === "categorias") {
    categoriasMap = await migrarCategorias(sql);
  }

  if (!only || only === "cidades") {
    cidadesMap = await migrarCidades(sql);
  }

  if (!only || only === "corretores") {
    corretoresMap = await migrarCorretores(sql);
  }

  if (!only || only === "empreendimentos") {
    condominiosMap = await migrarEmpreendimentos(sql);
  }

  if (!only || only === "imoveis") {
    imoveisMap = await migrarImoveis(sql, cidadesMap, corretoresMap, condominiosMap);
  }

  if (!only || only === "imagens") {
    // Se --table=imagens, recarrega mapa de imóveis
    if (only === "imagens" && !DRY_RUN) {
      let from = 0;
      while (true) {
        const { data } = await supabase.from("imoveis").select("id, legacy_id").range(from, from + 999);
        if (!data || data.length === 0) break;
        data.forEach((d) => { imoveisMap[d.legacy_id] = d.id; });
        if (data.length < 1000) break;
        from += 1000;
      }
    }
    await migrarImagens(sql, imoveisMap);
  }

  if (!only || only === "historico") {
    if (only === "historico" && !DRY_RUN) {
      let from = 0;
      while (true) {
        const { data } = await supabase.from("imoveis").select("id, legacy_id").range(from, from + 999);
        if (!data || data.length === 0) break;
        data.forEach((d) => { imoveisMap[d.legacy_id] = d.id; });
        if (data.length < 1000) break;
        from += 1000;
      }
    }
    await migrarHistorico(sql, imoveisMap);
  }

  if (!only || only === "caracteristicas") {
    if (only === "caracteristicas" && !DRY_RUN) {
      let from = 0;
      while (true) {
        const { data } = await supabase.from("imoveis").select("id, legacy_id").range(from, from + 999);
        if (!data || data.length === 0) break;
        data.forEach((d) => { imoveisMap[d.legacy_id] = d.id; });
        if (data.length < 1000) break;
        from += 1000;
      }
      const { data: cats } = await supabase.from("categorias").select("id, legacy_id").not("legacy_id", "is", null);
      cats?.forEach((d) => { categoriasMap[d.legacy_id] = d.id; });
    }
    await migrarCaracteristicas(sql, imoveisMap, categoriasMap);
  }

  console.log("\n" + "=".repeat(60));
  console.log("  ✅ Migração concluída!");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n❌ Erro fatal:", err);
  process.exit(1);
});
