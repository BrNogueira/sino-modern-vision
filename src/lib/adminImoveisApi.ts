import { api } from "@/integrations/api/client";
import { fromRow } from "@/lib/imovelMapper";
import type { ZapImovel } from "@/types/zapImoveis";

export const ADMIN_IMOVEIS_PAGE_SIZE = 20;

export const ADMIN_IMOVEIS_LIST_SELECT =
  "id,codigo_imovel,titulo_imovel,tipo_imovel,cidade,estado,bairro,preco_venda,preco_aluguel,ativo,created_at";

type PagedResponse = { data: Record<string, unknown>[]; total: number };

/** Tipos canônicos do imóvel (mesma taxonomia do import — classifyOne). */
export const ADMIN_IMOVEIS_TIPOS = [
  "Apartamentos", "Casas", "Terrenos", "Terrenos de Esquina", "Sítios",
  "Sala comercial", "Comerciais", "Pavilhões", "Condomínios",
  "Lançamentos", "Permutas", "Imóvel",
] as const;

/** Colunas ordenáveis pelos cabeçalhos da tabela de imóveis. */
export type ImovelSortCol =
  | "codigo_imovel" | "titulo_imovel" | "tipo_imovel" | "cidade"
  | "preco_venda" | "ativo" | "created_at";

export interface ImovelSort {
  col: ImovelSortCol;
  dir: "asc" | "desc";
}

export interface ImovelFilters {
  status?: "ativo" | "inativo"; // undefined = todos
  tipo?: string;                // tipo_imovel exato
  cidade?: string;              // LIKE %cidade%
  precoMin?: number;
  precoMax?: number;
}

export const DEFAULT_IMOVEL_SORT: ImovelSort = { col: "created_at", dir: "desc" };

export function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

function buildQuery(params: {
  page: number;
  search?: string;
  select?: string;
  sort?: ImovelSort;
  filters?: ImovelFilters;
}): URLSearchParams {
  const offset = (params.page - 1) * ADMIN_IMOVEIS_PAGE_SIZE;
  const sort = params.sort ?? DEFAULT_IMOVEL_SORT;
  const qs = new URLSearchParams({
    select: params.select ?? ADMIN_IMOVEIS_LIST_SELECT,
    order: `${sort.col}.${sort.dir}`,
    limit: String(ADMIN_IMOVEIS_PAGE_SIZE),
    offset: String(offset),
    count: "exact",
  });
  const term = params.search?.trim();
  if (term) qs.set("q", term);

  const f = params.filters;
  if (f?.status === "ativo") qs.set("ativo", "eq.1");
  else if (f?.status === "inativo") qs.set("ativo", "eq.0");
  if (f?.tipo) qs.set("tipo_imovel", `eq.${f.tipo}`);
  if (f?.cidade?.trim()) qs.set("cidade", `like.%${f.cidade.trim()}%`);
  // faixa de preço: append (não set) p/ permitir gte + lte na mesma coluna
  if (f?.precoMin != null && !Number.isNaN(f.precoMin))
    qs.append("preco_venda", `gte.${f.precoMin}`);
  if (f?.precoMax != null && !Number.isNaN(f.precoMax))
    qs.append("preco_venda", `lte.${f.precoMax}`);
  return qs;
}

export async function fetchAdminImoveisPage(
  page: number,
  search?: string,
  opts?: { sort?: ImovelSort; filters?: ImovelFilters; select?: string },
): Promise<{ items: ZapImovel[]; total: number }> {
  const qs = buildQuery({ page, search, ...opts });
  const res = await api.get<PagedResponse>(`/api/data/imoveis?${qs}`);
  return {
    items: (res.data ?? []).map(fromRow),
    total: res.total ?? 0,
  };
}

export async function fetchAdminImoveisCount(ativo?: boolean): Promise<number> {
  const qs = new URLSearchParams({
    count: "exact",
    limit: "0",
    select: "id",
  });
  if (ativo === true) qs.set("ativo", "eq.1");
  if (ativo === false) qs.set("ativo", "eq.0");
  const res = await api.get<PagedResponse>(`/api/data/imoveis?${qs}`);
  return res.total ?? 0;
}
