import { api } from "@/integrations/api/client";
import { fromRow } from "@/lib/imovelMapper";
import type { ZapImovel } from "@/types/zapImoveis";

export const ADMIN_IMOVEIS_PAGE_SIZE = 20;

export const ADMIN_IMOVEIS_LIST_SELECT =
  "id,codigo_imovel,titulo_imovel,tipo_imovel,cidade,estado,bairro,preco_venda,preco_aluguel,ativo,created_at";

type PagedResponse = { data: Record<string, unknown>[]; total: number };

export function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

function buildQuery(params: {
  page: number;
  search?: string;
  select?: string;
}): URLSearchParams {
  const offset = (params.page - 1) * ADMIN_IMOVEIS_PAGE_SIZE;
  const qs = new URLSearchParams({
    select: params.select ?? ADMIN_IMOVEIS_LIST_SELECT,
    order: "created_at.desc",
    limit: String(ADMIN_IMOVEIS_PAGE_SIZE),
    offset: String(offset),
    count: "exact",
  });
  const term = params.search?.trim();
  if (term) qs.set("q", term);
  return qs;
}

export async function fetchAdminImoveisPage(
  page: number,
  search?: string,
  select?: string,
): Promise<{ items: ZapImovel[]; total: number }> {
  const qs = buildQuery({ page, search, select });
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
