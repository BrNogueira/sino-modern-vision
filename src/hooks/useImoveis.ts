import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/data/properties";

const supabaseAny = supabase as any;

// ──────────────────────────────────────────────────────────────
// Tipos do banco de dados
// ──────────────────────────────────────────────────────────────

export interface ImovelDB {
  id: string;
  legacy_id: number | null;
  cod_referencia: string | null;
  titulo: string | null;
  descricao: string | null;
  conteudo: string | null;
  informacoes: string | null;
  tipo: string | null;
  tipo_legacy_id: number | null;
  transacao: string;
  preco: number;
  valor_aluguel: number | null;
  iptu: number | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  dimensoes: string | null;
  dormitorios: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas_garagem: number | null;
  salas: number | null;
  lavabos: number | null;
  ano_construcao: string | null;
  status_obra: string | null;
  apto_financiamento: string | null;
  acabamentos: string | null;
  ativo: boolean;
  destaque: boolean;
  lancamento: boolean;
  exclusivo: boolean;
  tem_piscina: boolean;
  imagem_principal: string | null;
  imagem_secundaria: string | null;
  video_url: string | null;
  pdf_src: string | null;
  corretor_id: string | null;
  condominio_id: string | null;
  created_at: string;
  updated_at: string;
  // Campos da view imoveis_completo
  corretor_nome: string | null;
  corretor_telefone: string | null;
  corretor_creci: string | null;
  corretor_avatar: string | null;
  condominio_nome: string | null;
  imagem_thumb: string | null;
}

export interface ImovelImagem {
  id: string;
  imovel_id: string;
  arquivo: string;
  url: string | null;
  pasta: string | null;
  posicao: number;
  legenda: string | null;
  tipo: number;
}

// ──────────────────────────────────────────────────────────────
// Mapeador: ImovelDB → Property (interface legada do frontend)
// ──────────────────────────────────────────────────────────────

export function toProperty(imovel: ImovelDB, imagens?: ImovelImagem[]): Property {
  const gallery = imagens?.map((img) => img.url ?? img.arquivo) ?? [];
  const mainImage = gallery[0] ?? imovel.imagem_principal ?? "";

  // Formata preço BRL
  const formatBRL = (val: number | null) =>
    val != null
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "";

  // Extrai número de dormitórios do campo texto legado
  const dormitoriosNum = imovel.quartos
    ?? (imovel.dormitorios ? parseInt(imovel.dormitorios) || undefined : undefined);

  return {
    code:               String(imovel.legacy_id ?? imovel.id),
    image:              mainImage,
    title:              imovel.titulo ?? "",
    type:               imovel.tipo ?? "",
    transactionType:    (imovel.transacao as Property["transactionType"]) ?? "venda",
    location:           [imovel.bairro, imovel.cidade].filter(Boolean).join(" - ").toUpperCase(),
    city:               imovel.cidade ?? "",
    state:              imovel.estado ?? "RS",
    neighborhood:       imovel.bairro ?? "",
    price:              imovel.preco ?? 0,
    priceFormatted:     formatBRL(imovel.preco),
    valorAluguel:       imovel.valor_aluguel ?? undefined,
    valorAluguelFormatted: imovel.valor_aluguel ? formatBRL(imovel.valor_aluguel) : undefined,
    bedrooms:           dormitoriosNum,
    suites:             imovel.suites ?? undefined,
    bathrooms:          imovel.banheiros ?? undefined,
    parking:            imovel.vagas_garagem ?? undefined,
    area:               undefined, // calculado de dimensoes se necessário
    areaDimensions:     imovel.dimensoes ?? undefined,
    hasPool:            imovel.tem_piscina,
    featured:           imovel.destaque,
    exclusive:          imovel.exclusivo,
    salas:              imovel.salas ?? undefined,
    lavabos:            imovel.lavabos ?? undefined,
    gallery:            gallery.length > 0 ? gallery : undefined,
    acabamentos:        imovel.acabamentos
                          ? imovel.acabamentos.split(";").map((s) => s.trim()).filter(Boolean)
                          : undefined,
    amenidades:         [],
    aceitaFinanciamento: imovel.apto_financiamento
                          ? imovel.apto_financiamento.toLowerCase().startsWith("sim")
                          : undefined,
    description:        imovel.descricao ?? undefined,
    latitude:           imovel.latitude ?? undefined,
    longitude:          imovel.longitude ?? undefined,
    corretor: imovel.corretor_nome
      ? {
          nome:     imovel.corretor_nome,
          creci:    imovel.corretor_creci ?? "",
          telefone: imovel.corretor_telefone ?? "",
        }
      : undefined,
  };
}

// ──────────────────────────────────────────────────────────────
// Filtros de busca
// ──────────────────────────────────────────────────────────────

export interface ImoveisFilter {
  transacao?: string;
  tipo?:      string;
  cidade?:    string;
  bairro?:    string;
  estado?:    string;
  precoMin?:  number;
  precoMax?:  number;
  destaque?:  boolean;
  lancamento?: boolean;
  codigo?:    string;
  q?:         string;
  limit?:     number;
  offset?:    number;
}

// ──────────────────────────────────────────────────────────────
// Hook: useImoveis — lista com filtros
// ──────────────────────────────────────────────────────────────

export function useImoveis(filter: ImoveisFilter = {}) {
  return useQuery({
    queryKey: ["imoveis", filter],
    queryFn: async () => {
      let query = supabaseAny
        .from("imoveis_completo")
        .select("*")
        .eq("ativo", true);

      if (filter.transacao)       query = query.eq("transacao", filter.transacao);
      if (filter.tipo)            query = query.ilike("tipo", filter.tipo);
      if (filter.cidade)          query = query.ilike("cidade", filter.cidade);
      if (filter.bairro)          query = query.ilike("bairro", `%${filter.bairro}%`);
      if (filter.estado)          query = query.eq("estado", filter.estado);
      if (filter.precoMin != null) query = query.gte("preco", filter.precoMin);
      if (filter.precoMax != null) query = query.lte("preco", filter.precoMax);
      if (filter.destaque != null) query = query.eq("destaque", filter.destaque);
      if (filter.lancamento != null) query = query.eq("lancamento", filter.lancamento);
      if (filter.codigo)          query = query.eq("legacy_id", parseInt(filter.codigo));

      if (filter.q) {
        query = query.or(
          `titulo.ilike.%${filter.q}%,descricao.ilike.%${filter.q}%,bairro.ilike.%${filter.q}%,cidade.ilike.%${filter.q}%`
        );
      }

      query = query.order("destaque", { ascending: false });
      query = query.order("created_at", { ascending: false });

      if (filter.limit)  query = query.limit(filter.limit);
      if (filter.offset) query = query.range(filter.offset, filter.offset + (filter.limit ?? 20) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as any as ImovelDB[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// ──────────────────────────────────────────────────────────────
// Hook: useImovel — detalhe por legacy_id ou id UUID
// ──────────────────────────────────────────────────────────────

export function useImovel(idOrLegacy: string | number | undefined) {
  return useQuery({
    queryKey: ["imovel", idOrLegacy],
    enabled:  !!idOrLegacy,
    queryFn: async () => {
      const isUUID = typeof idOrLegacy === "string" && idOrLegacy.includes("-");

      let query = supabaseAny.from("imoveis_completo").select("*");
      if (isUUID) {
        query = query.eq("id", idOrLegacy);
      } else {
        query = query.eq("legacy_id", Number(idOrLegacy));
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as any as ImovelDB | null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ──────────────────────────────────────────────────────────────
// Hook: useImovelImagens — galeria de um imóvel
// ──────────────────────────────────────────────────────────────

export function useImovelImagens(imovelId: string | undefined) {
  return useQuery({
    queryKey: ["imovel-imagens", imovelId],
    enabled:  !!imovelId,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("imoveis_imagens")
        .select("*")
        .eq("imovel_id", imovelId!)
        .order("posicao", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any as ImovelImagem[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ──────────────────────────────────────────────────────────────
// Hook: useDestaques — imóveis em destaque para o carousel
// ──────────────────────────────────────────────────────────────

export function useDestaques(limit = 8) {
  return useImoveis({ destaque: true, limit });
}

// ──────────────────────────────────────────────────────────────
// Utilitário: gera slug de título (espelho do frontend legado)
// ──────────────────────────────────────────────────────────────

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ──────────────────────────────────────────────────────────────
// Hook: useImovelBySlug — resolve slug de URL para imóvel
// Suporta:
//   - slug numérico → busca por legacy_id
//   - slug textual  → busca por similiaridade de título
// ──────────────────────────────────────────────────────────────

export function useImovelBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["imovel-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;

      // Tenta como legacy_id numérico
      const numeric = parseInt(slug);
      if (!isNaN(numeric) && String(numeric) === slug) {
        const { data } = await supabaseAny
          .from("imoveis_completo")
          .select("*")
          .eq("legacy_id", numeric)
          .maybeSingle();
        if (data) return data as any as ImovelDB;
      }

      // Tenta busca por título (todas as palavras do slug devem estar no título)
      const terms = slug.replace(/-/g, " ");
      const { data } = await supabaseAny
        .from("imoveis_completo")
        .select("*")
        .ilike("titulo", `%${terms.split(" ")[0]}%`)
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return null;

      // Compara slug gerado para encontrar o mais próximo
      const match = (data as any as ImovelDB[]).find(
        (i) => i.titulo && generateSlug(i.titulo) === slug
      );
      return match ?? (data[0] as any as ImovelDB);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ──────────────────────────────────────────────────────────────
// Hook: useCategorias — tipos de imóvel do banco
// ──────────────────────────────────────────────────────────────

export function useCategorias(grupo?: string) {
  return useQuery({
    queryKey: ["categorias", grupo],
    queryFn: async () => {
      let query = supabaseAny
        .from("categorias")
        .select("id, legacy_id, titulo, grupo, posicao")
        .eq("ativo", true)
        .order("posicao", { ascending: true });

      if (grupo) query = query.eq("grupo", grupo);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos — raramente muda
  });
}
