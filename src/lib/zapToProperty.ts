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
): Property["transactionType"] => {
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
    z.precoVenda,
    z.precoAluguel,
  );

  const price = z.precoVenda ?? z.precoAluguel ?? 0;
  const location = [z.bairro, z.cidade].filter(Boolean).join(", ") || z.cidade;

  return {
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
