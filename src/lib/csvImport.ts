// ============================================================================
// Importador de CSV de imóveis → linhas da tabela `imoveis` (Model B).
//
// Responsável por: ler o texto bruto do CSV (detecção de delimitador + parser
// RFC4180 com aspas), normalizar cabeçalhos e mapear cada registro para um
// objeto snake_case pronto para INSERT em /api/data/imoveis.
//
// Colunas esperadas no CSV:
//   codigo | categoria | titulo | cidade | bairro | preco | area_terreno |
//   area_construida | condicoes_pagamento | descricao | imagem_principal |
//   todas_imagens | total_fotos | url
// ============================================================================
import type { ZapImovelPhoto } from "@/types/zapImoveis";

// ── Parsing bruto ───────────────────────────────────────────────────────────

export interface ParsedCsv {
  headers: string[];
  records: Record<string, string>[];
  delimiter: string;
}

/** Detecta o delimitador a partir da 1ª linha (`;` `,` tab ou `|`). */
export function detectDelimiter(headerLine: string): string {
  const cands = [";", ",", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const d of cands) {
    const count = headerLine.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

/** Parser RFC4180: respeita aspas, delimitadores e quebras dentro de aspas. */
function tokenize(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else if (c === "\r") {
      // ignora; o \n seguinte fecha a linha
    } else {
      field += c;
    }
  }
  // último campo/linha (se houver conteúdo pendente)
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

/** Remove acentos, espaços e baixa caixa — para casar cabeçalhos com tolerância. */
export function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function parseCsv(text: string): ParsedCsv {
  const clean = text.replace(/^\uFEFF/, ""); // remove BOM
  const firstLine = clean.slice(0, clean.search(/\r?\n/) >= 0 ? clean.search(/\r?\n/) : clean.length);
  const delimiter = detectDelimiter(firstLine);
  const matrix = tokenize(clean, delimiter).filter((r) => r.some((c) => c.trim() !== ""));
  if (matrix.length === 0) return { headers: [], records: [], delimiter };

  const headers = matrix[0].map((h) => h.trim());
  const normHeaders = headers.map(normalizeHeader);
  const records = matrix.slice(1).map((cells) => {
    const rec: Record<string, string> = {};
    normHeaders.forEach((key, idx) => {
      if (key) rec[key] = (cells[idx] ?? "").trim();
    });
    return rec;
  });
  return { headers, records, delimiter };
}

// ── Mapeamento CSV → imóvel ───────────────────────────────────────────────────

/** Aceita aliases comuns de cabeçalho para cada campo lógico. */
const FIELD_ALIASES: Record<string, string[]> = {
  codigo: ["codigo", "cod", "codigo_imovel", "referencia", "ref"],
  categoria: ["categoria", "tipo", "tipo_imovel"],
  titulo: ["titulo", "title", "nome"],
  cidade: ["cidade", "municipio"],
  bairro: ["bairro"],
  preco: ["preco", "valor", "preco_venda", "price"],
  area_terreno: ["area_terreno", "area_total", "terreno", "area_do_terreno"],
  area_construida: ["area_construida", "area_util", "construida", "area_construcao"],
  condicoes_pagamento: ["condicoes_pagamento", "condicoes", "pagamento", "condicao_pagamento"],
  descricao: ["descricao", "description", "observacao", "obs"],
  imagem_principal: ["imagem_principal", "foto_principal", "imagem", "capa"],
  todas_imagens: ["todas_imagens", "imagens", "fotos", "galeria", "all_images"],
  total_fotos: ["total_fotos", "qtd_fotos", "num_fotos"],
  url: ["url", "link", "fonte", "origem"],
};

export type LogicalField = keyof typeof FIELD_ALIASES;

/** Resolve qual coluna do CSV (já normalizada) corresponde a cada campo lógico. */
export function resolveColumnMap(normHeaders: string[]): Partial<Record<LogicalField, string>> {
  const map: Partial<Record<LogicalField, string>> = {};
  for (const field of Object.keys(FIELD_ALIASES) as LogicalField[]) {
    const hit = FIELD_ALIASES[field].find((a) => normHeaders.includes(a));
    if (hit) map[field] = hit;
  }
  return map;
}

/** Converte número em formatos BR ("R$ 350.000,00") ou US ("350000.50") → number. */
export function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  let t = raw.replace(/[^\d.,-]/g, "").trim();
  if (!t) return null;
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && hasDot) {
    // formato BR: ponto de milhar, vírgula decimal
    t = t.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    t = t.replace(",", ".");
  } else if (hasDot) {
    const parts = t.split(".");
    // múltiplos pontos ou grupo de 3 dígitos → milhar, não decimal
    if (parts.length > 2 || (parts[1] && parts[1].length === 3)) t = t.replace(/\./g, "");
  }
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** Quebra a lista de imagens (separadores | ; , ou quebra de linha) em URLs. */
export function splitImages(all: string | undefined, main: string | undefined): ZapImovelPhoto[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const push = (u: string) => {
    const url = u.trim();
    if (url && !seen.has(url)) { seen.add(url); urls.push(url); }
  };
  if (main) push(main);
  (all ?? "").split(/[|;,\n\r\t]+|\s{2,}/).forEach(push);
  return urls.map((url, i) => ({ url, principal: i === 0 }));
}

/** Mapeia o texto livre de categoria para o par tipo/sub-tipo do Model B. */
export function classifyTipo(categoria: string | undefined): { tipo: string; sub: string } {
  const c = (categoria ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/terreno|lote/.test(c)) return { tipo: "Terreno", sub: "Terreno Padrão" };
  if (/apart|apto|cobertura|flat|kitnet|studio|loft/.test(c)) return { tipo: "Apartamento", sub: "Apartamento Padrão" };
  if (/casa|sobrado|geminad/.test(c)) return { tipo: "Casa", sub: "Casa Padrão" };
  if (/sitio|chacara|fazenda|rural|haras/.test(c)) return { tipo: "Rural", sub: "Chácara" };
  if (/sala|loja|galpao|comercial|industri|predio|deposito|pavilhao/.test(c)) return { tipo: "Comercial/Industrial", sub: "Loja/Salão" };
  return { tipo: "Casa", sub: "Casa Padrão" }; // fallback seguro
}

export interface MappedImovel {
  /** Linha snake_case pronta para INSERT em `imoveis`. */
  row: Record<string, unknown>;
  /** Avisos não-bloqueantes (ex.: sem preço, contagem de fotos divergente). */
  warnings: string[];
  /** Erros bloqueantes (linha será pulada). */
  errors: string[];
}

/** Constrói a linha do imóvel + valida a partir de um registro de CSV. */
export function mapRecordToImovel(
  rec: Record<string, string>,
  cols: Partial<Record<LogicalField, string>>,
): MappedImovel {
  const get = (f: LogicalField) => (cols[f] ? rec[cols[f]!] : undefined);
  const warnings: string[] = [];
  const errors: string[] = [];

  const codigo = (get("codigo") ?? "").trim();
  const titulo = (get("titulo") ?? "").trim();
  if (!codigo) errors.push("código ausente");
  if (!titulo) errors.push("título ausente");

  const { tipo, sub } = classifyTipo(get("categoria"));
  const preco = parseNumber(get("preco"));
  if (preco == null) warnings.push("sem preço de venda");

  const fotos = splitImages(get("todas_imagens"), get("imagem_principal"));
  const totalDeclared = parseNumber(get("total_fotos"));
  if (totalDeclared != null && fotos.length !== totalDeclared)
    warnings.push(`total_fotos=${totalDeclared} mas ${fotos.length} URL(s) lidas`);
  if (fotos.length === 0) warnings.push("sem imagens");

  const descricao = (get("descricao") ?? "").trim();
  const condicoes = (get("condicoes_pagamento") ?? "").trim();
  const url = (get("url") ?? "").trim();
  const observacaoParts = [descricao];
  if (condicoes) observacaoParts.push(`Condições de pagamento: ${condicoes}`);
  if (url) observacaoParts.push(`Fonte: ${url}`);
  const observacao = observacaoParts.filter(Boolean).join("\n\n");

  const row: Record<string, unknown> = {
    codigo_imovel: codigo,
    titulo_imovel: titulo,
    tipo_imovel: tipo,
    sub_tipo_imovel: sub,
    categoria_imovel: "Padrão",
    tipo_oferta: 1,
    modalidade: ["venda"],
    estado: "Rio Grande do Sul",
    cidade: (get("cidade") ?? "").trim(),
    bairro: (get("bairro") ?? "").trim(),
    preco_venda: preco,
    area_total: parseNumber(get("area_terreno")),
    area_util: parseNumber(get("area_construida")),
    descricao_curta: descricao.slice(0, 250),
    observacao,
    fotos,
    link_tour_virtual: url,
    ativo: 1,
  };

  return { row, warnings, errors };
}

export interface CsvImportPreview {
  delimiter: string;
  headers: string[];
  columnMap: Partial<Record<LogicalField, string>>;
  /** Campos lógicos esperados que não foram encontrados no CSV. */
  missingFields: LogicalField[];
  mapped: MappedImovel[];
  validCount: number;
  errorCount: number;
}

const REQUIRED_FIELDS: LogicalField[] = ["codigo", "titulo"];

/** Pipeline completo: texto → preview com linhas mapeadas e validação. */
export function buildImportPreview(text: string): CsvImportPreview {
  const { headers, records, delimiter } = parseCsv(text);
  const normHeaders = headers.map(normalizeHeader);
  const columnMap = resolveColumnMap(normHeaders);
  const missingFields = REQUIRED_FIELDS.filter((f) => !columnMap[f]);
  const mapped = records.map((rec) => mapRecordToImovel(rec, columnMap));
  const errorCount = mapped.filter((m) => m.errors.length > 0).length;
  return {
    delimiter,
    headers,
    columnMap,
    missingFields,
    mapped,
    validCount: mapped.length - errorCount,
    errorCount,
  };
}
