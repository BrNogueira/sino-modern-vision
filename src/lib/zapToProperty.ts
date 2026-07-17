import type { Property } from "@/data/properties";
import type { ZapImovel } from "@/types/zapImoveis";
import { ensureStringArray } from "@/lib/imovelNormalize";
import { featureCategories, garantiasLabels, type GarantiasAluguel } from "@/types/zapImoveis";
import { propertyPlaceholder, resolvePhotoUrl } from "@/lib/resolvePhotoUrl";

const buildGarantias = (g?: GarantiasAluguel): string[] =>
  g ? (Object.keys(garantiasLabels) as (keyof GarantiasAluguel)[]).filter((k) => g[k]).map((k) => garantiasLabels[k]) : [];

// Agrupa as features marcadas (true) por categoria, com emoji + label, para exibição.
const buildCaracteristicas = (flags?: Record<string, boolean>) => {
  if (!flags) return [];
  return featureCategories
    .map((cat) => ({
      title: cat.title,
      items: cat.items.filter((it) => flags[it.key]).map((it) => `${it.emoji} ${it.label}`),
    }))
    .filter((g) => g.items.length > 0);
};

const formatBRL = (n?: number) =>
  typeof n === "number" && !isNaN(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "Sob consulta";

const transactionTypeFromOferta = (
  oferta: number,
  precoVenda?: number,
  precoAluguel?: number,
  modalidade?: string[],
): Property["transactionType"] => {
  // A modalidade marcada no admin é a intenção explícita do usuário e tem
  // prioridade sobre o tipoOferta/preços ao definir venda × aluguel.
  const m = ensureStringArray(modalidade);
  const hasVenda = m.includes("venda");
  const hasAluguel = m.includes("aluguel");
  if (hasVenda && hasAluguel) return "venda/aluguel";
  if (hasAluguel) return "aluguel";
  if (hasVenda) return "venda";
  // Sem modalidade definida → deriva de tipoOferta/preços.
  // tipoOferta: 1=Venda, 2=Aluguel, 3=Venda e Aluguel
  if (oferta === 3 || (precoVenda && precoAluguel)) return "venda/aluguel";
  if (oferta === 2 || (!precoVenda && precoAluguel)) return "aluguel";
  return "venda";
};

// Imóvel disponível para locação (modalidade explícita ou derivada de oferta/preços).
export const isImovelAluguel = (z: ZapImovel): boolean =>
  transactionTypeFromOferta(z.tipoOferta, z.precoVenda ?? undefined, z.precoAluguel ?? undefined, z.modalidade) !== "venda";

export const zapToProperty = (z: ZapImovel): Property => {
  const fotosUrls = (Array.isArray(z.fotos) ? z.fotos : [])
    .map((f: any) => (typeof f === "string" ? f : f?.url))
    .filter(Boolean)
    .map((u: string) => resolvePhotoUrl(u));

  const cover = fotosUrls[0] || propertyPlaceholder;
  const gallery = fotosUrls.slice(1);

  const transactionType = transactionTypeFromOferta(
    z.tipoOferta,
    z.precoVenda ?? undefined,
    z.precoAluguel ?? undefined,
    z.modalidade,
  );

  const price = z.precoVenda ?? z.precoAluguel ?? 0;
  const location = [z.bairro, z.cidade].filter(Boolean).join(", ") || z.cidade;

  return {
    id: z.id,
    code: z.codigoImovel || z.id,
    image: cover,
    title: z.tituloImovel,
    type: z.tipoImovel,
    transactionType,
    location,
    city: z.cidade,
    state: z.estado,
    neighborhood: z.bairro || "",
    price,
    precoVenda: z.precoVenda ?? undefined,
    priceFormatted: z.precoVenda ? formatBRL(z.precoVenda) : formatBRL(z.precoAluguel),
    valorAluguel: z.precoAluguel,
    valorAluguelFormatted: z.precoAluguel ? `${formatBRL(z.precoAluguel)}/mês` : undefined,
    bedrooms: z.qtdDormitorios,
    suites: z.qtdSuites,
    bathrooms: z.qtdBanheiros,
    parking: z.qtdVagas,
    area: z.areaUtil ?? z.areaTotal,
    areaDimensions: z.areaDimensions,
    hasPool: !!z.features?.piscina,
    featured: !!z.destaque,
    exclusive: !!z.exclusivo,
    gallery,
    description: z.descricaoCurta,
    descricaoCompleta: z.observacao || z.descricaoCurta || "",
    caracteristicas: buildCaracteristicas(z.features),
    aceitaFinanciamento: !!z.features?.apta_financiamento,
    iptu: z.iptu ?? undefined,
    anoConstrucao: z.anoConstrucao ?? undefined,
    subTipo: z.subTipoImovel || undefined,
    categoriaImovel: z.categoriaImovel || undefined,
    areaTotal: z.areaTotal ?? undefined,
    areaUtil: z.areaUtil ?? undefined,
    valorCondominio: z.valorCondominio ?? undefined,
    valorCondominioFormatted: z.valorCondominio ? formatBRL(z.valorCondominio) : undefined,
    enderecoCompleto: [z.endereco, z.numero].filter(Boolean).join(", ") +
      (z.complemento ? ` — ${z.complemento}` : ""),
    cep: z.cep || undefined,
    zona: z.zona || undefined,
    videoUrl: z.videoUrl || undefined,
    linkTourVirtual: z.linkTourVirtual || undefined,
    garantias: buildGarantias(z.garantias),
    proprietario: {
      nome: z.proprietarioNome || undefined,
      telefone: z.proprietarioTelefone || undefined,
      email: z.proprietarioEmail || undefined,
      documento: z.proprietarioDocumento || undefined,
    },
    latitude: z.latitude ? Number(z.latitude) : undefined,
    longitude: z.longitude ? Number(z.longitude) : undefined,
    condominioId: z.condominioId ?? null,
  };
};
