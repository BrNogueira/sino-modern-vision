import type { TipoImovel, SubTipoImovel } from "@/types/zapImoveis";
import { subTipoByTipo, tipoImovelOptions } from "@/types/zapImoveis";

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function ensureStringArray(value: unknown): string[] {
  const parsed = parseJsonField<unknown>(value, []);
  return Array.isArray(parsed) ? parsed.map(String) : [];
}

const TIPO_ALIASES: Record<string, TipoImovel> = {
  casa: "Casa",
  casas: "Casa",
  apartamento: "Apartamento",
  apartamentos: "Apartamento",
  terreno: "Terreno",
  terrenos: "Terreno",
  "terrenos de esquina": "Terreno",
  sitio: "Rural",
  sitios: "Rural",
  sítio: "Rural",
  sítios: "Rural",
  rural: "Rural",
  comercial: "Comercial/Industrial",
  comerciais: "Comercial/Industrial",
  "sala comercial": "Comercial/Industrial",
  pavilhao: "Comercial/Industrial",
  pavilhões: "Comercial/Industrial",
  condominio: "Casa",
  condomínios: "Casa",
  condominios: "Casa",
  lançamentos: "Apartamento",
  lancamentos: "Apartamento",
  imóvel: "Casa",
  imovel: "Casa",
};

export function normalizeTipoImovel(raw: unknown): TipoImovel {
  const s = String(raw ?? "").trim();
  if (!s) return "Casa";
  if ((tipoImovelOptions as string[]).includes(s)) return s as TipoImovel;
  const key = s.toLowerCase();
  if (TIPO_ALIASES[key]) return TIPO_ALIASES[key];
  for (const opt of tipoImovelOptions) {
    if (key.startsWith(opt.toLowerCase())) return opt;
  }
  return "Casa";
}

export function normalizeSubTipoImovel(tipo: TipoImovel, raw: unknown): SubTipoImovel {
  const s = String(raw ?? "").trim();
  const options = subTipoByTipo[tipo] ?? [];
  if (s && (options as string[]).includes(s)) return s as SubTipoImovel;
  return options[0] ?? "Casa Padrão";
}

export function safeSelectValue<T extends string>(value: T, options: readonly T[]): T | undefined {
  return options.includes(value) ? value : undefined;
}
