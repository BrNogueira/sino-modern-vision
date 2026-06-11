import type { Property } from "@/data/properties";
import type { ZapImovel } from "@/types/zapImoveis";
import propertyPlaceholder from "@/assets/property-casa.jpg";

const formatBRL = (n?: number) =>
  typeof n === "number" && !isNaN(n)
    ? `R$ ${n.toLocaleString("pt-BR")}`
    : "Sob consulta";

const transactionTypeFromOferta = (
  oferta: number,
  precoVenda?: number,
  precoAluguel?: number,
  modalidade?: string[],
): Property["transactionType"] => {
  // A modalidade marcada no admin é a intenção explícita do usuário e tem
  // prioridade sobre o tipoOferta/preços ao definir venda × aluguel.
  const m = Array.isArray(modalidade) ? modalidade : [];
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

export const zapToProperty = (z: ZapImovel): Property => {
  const fotosUrls = (Array.isArray(z.fotos) ? z.fotos : [])
    .map((f: any) => (typeof f === "string" ? f : f?.url))
    .filter(Boolean) as string[];

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
    latitude: z.latitude ? Number(z.latitude) : undefined,
    longitude: z.longitude ? Number(z.longitude) : undefined,
  };
};
