// Estrutura de dados conforme API Zap Imóveis + Sistema de ícones por categorias

// ====== CLASSIFICAÇÃO ZAP IMÓVEIS ======

export type TipoImovel =
  | "Apartamento"
  | "Casa"
  | "Terreno"
  | "Rural"
  | "Flat/Aparthotel"
  | "Comercial/Industrial";

export type SubTipoImovel =
  | "Apartamento Padrão"
  | "Loft"
  | "Kitchenette/Conjugados"
  | "Casa Padrão"
  | "Casa de Condomínio"
  | "Casa de Vila"
  | "Terreno Padrão"
  | "Loteamento/Condomínio"
  | "Chácara"
  | "Sítio"
  | "Fazenda"
  | "Haras"
  | "Flat"
  | "Galpão/Depósito/Armazém"
  | "Indústria"
  | "Loja/Salão"
  | "Loja de Shopping/Centro Comercial"
  | "Box/Garagem"
  | "Conjunto Comercial/Sala"
  | "Casa Comercial"
  | "Studio"
  | "Hotel"
  | "Motel"
  | "Pousada/Chalé"
  | "Prédio Inteiro";

export type CategoriaImovel =
  | "Padrão"
  | "Sobrado/Duplex"
  | "Sobrado/Triplex"
  | "Térrea"
  | "Cobertura"
  | "Cobertura Duplex"
  | "Cobertura Triplex"
  | "Duplex"
  | "Triplex"
  | "Sem Decoração"
  | "Decoração não Padronizada"
  | "Decoração Padrão"
  | "Dentro do Pool";

export type TipoOferta = 1 | 2 | 3 | 5 | 6;

export const tipoImovelOptions: TipoImovel[] = [
  "Apartamento",
  "Casa",
  "Terreno",
  "Rural",
  "Flat/Aparthotel",
  "Comercial/Industrial",
];

export const subTipoByTipo: Record<TipoImovel, SubTipoImovel[]> = {
  Apartamento: ["Apartamento Padrão", "Loft", "Kitchenette/Conjugados"],
  Casa: ["Casa Padrão", "Casa de Condomínio", "Casa de Vila"],
  Terreno: ["Terreno Padrão", "Loteamento/Condomínio"],
  Rural: ["Chácara", "Sítio", "Fazenda", "Haras"],
  "Flat/Aparthotel": ["Flat"],
  "Comercial/Industrial": [
    "Galpão/Depósito/Armazém",
    "Indústria",
    "Loja/Salão",
    "Loja de Shopping/Centro Comercial",
    "Box/Garagem",
    "Conjunto Comercial/Sala",
    "Casa Comercial",
    "Studio",
    "Hotel",
    "Motel",
    "Pousada/Chalé",
    "Prédio Inteiro",
  ],
};

// ====== SISTEMA DE CADASTRO POR ÍCONES ======

export interface FeatureItem {
  key: string;
  label: string;
  emoji: string;
}

export interface FeatureCategory {
  key: string;
  title: string;
  emoji: string;
  items: FeatureItem[];
}

export const featureCategories: FeatureCategory[] = [
  {
    key: "ambientes_internos",
    title: "Ambientes Internos",
    emoji: "🛋️",
    items: [
      { key: "sala_estar", label: "Sala de estar", emoji: "🛋️" },
      { key: "sala_tv", label: "Sala de TV", emoji: "📺" },
      { key: "sala_jantar", label: "Sala de jantar", emoji: "🍽️" },
      { key: "cozinha", label: "Cozinha", emoji: "🍳" },
      { key: "lavanderia", label: "Lavanderia", emoji: "🧺" },
      { key: "dormitorios", label: "Dormitórios", emoji: "🛏️" },
      { key: "banheiro_social", label: "Banheiro social", emoji: "🚿" },
      { key: "suite", label: "Suíte", emoji: "🚿" },
      { key: "closet", label: "Closet", emoji: "🧳" },
      { key: "escritorio", label: "Escritório", emoji: "🖥️" },
      { key: "hall_entrada", label: "Hall de entrada", emoji: "🚪" },
    ],
  },
  {
    key: "area_externa",
    title: "Área Externa / Apoio",
    emoji: "🚗",
    items: [
      { key: "garagem_coberta", label: "Garagem coberta", emoji: "🚗" },
      { key: "vaga_descoberta", label: "Vaga descoberta", emoji: "🚙" },
      { key: "churrasqueira", label: "Churrasqueira", emoji: "🍖" },
      { key: "lareira", label: "Lareira", emoji: "🔥" },
      { key: "sacada", label: "Sacada", emoji: "🌅" },
      { key: "patio", label: "Pátio", emoji: "🌳" },
      { key: "jardim", label: "Jardim", emoji: "🌿" },
      { key: "piscina", label: "Piscina", emoji: "🏊" },
      { key: "deposito", label: "Depósito", emoji: "🧱" },
      { key: "banheiro_externo", label: "Banheiro externo", emoji: "🚿" },
      { key: "canil", label: "Canil", emoji: "🐶" },
    ],
  },
  {
    key: "conforto",
    title: "Conforto e Diferenciais",
    emoji: "🛁",
    items: [
      { key: "banheira", label: "Banheira", emoji: "🛁" },
      { key: "hidromassagem", label: "Hidromassagem", emoji: "🚿" },
      { key: "vista_panoramica", label: "Vista panorâmica", emoji: "🌅" },
      { key: "vista_serra_lago", label: "Vista serra / lago / cidade", emoji: "🌄" },
      { key: "ar_condicionado_instalado", label: "Ar-condicionado instalado", emoji: "❄️" },
      { key: "espera_ar_condicionado", label: "Espera para ar-condicionado", emoji: "❄️" },
      { key: "energia_solar", label: "Energia solar", emoji: "☀️" },
    ],
  },
  {
    key: "acabamentos",
    title: "Acabamentos e Padrão Construtivo",
    emoji: "🧱",
    items: [
      // Parede
      { key: "acabamento_reboco_pintura", label: "Reboco + pintura", emoji: "🧱" },
      { key: "acabamento_massa_corrida", label: "Massa corrida", emoji: "🧱" },
      { key: "acabamento_tijolo_vista", label: "Tijolo à vista", emoji: "🧱" },
      { key: "acabamento_madeira_parede", label: "Madeira (parede)", emoji: "🧱" },
      // Aberturas
      { key: "abertura_aluminio", label: "Aberturas em alumínio", emoji: "🚪" },
      { key: "abertura_madeira", label: "Aberturas em madeira", emoji: "🚪" },
      { key: "abertura_pvc", label: "Aberturas em PVC", emoji: "🚪" },
      // Forro
      { key: "forro_gesso", label: "Forro em gesso", emoji: "🧯" },
      { key: "forro_pvc", label: "Forro em PVC", emoji: "🧯" },
      { key: "forro_madeira", label: "Forro em madeira", emoji: "🧯" },
      // Piso
      { key: "piso_ceramico", label: "Piso cerâmico", emoji: "🪨" },
      { key: "piso_porcelanato", label: "Piso porcelanato", emoji: "🪨" },
      { key: "piso_laminado", label: "Piso laminado", emoji: "🪨" },
      { key: "piso_madeira", label: "Piso em madeira", emoji: "🪨" },
    ],
  },
  {
    key: "tipo_construcao",
    title: "Tipo de Construção",
    emoji: "🏗️",
    items: [
      { key: "concreto_laje", label: "Casa de concreto / laje", emoji: "🧱" },
      { key: "alvenaria", label: "Alvenaria", emoji: "🧱" },
      { key: "madeira_construcao", label: "Madeira", emoji: "🪵" },
      { key: "mista", label: "Mista", emoji: "🧱" },
      { key: "estrutura_segundo_piso", label: "Estrutura para segundo piso", emoji: "🏗️" },
    ],
  },
  {
    key: "infraestrutura",
    title: "Infraestrutura e Tecnologia",
    emoji: "🌐",
    items: [
      { key: "internet_fibra", label: "Internet fibra óptica", emoji: "🌐" },
      { key: "internet_radio", label: "Internet via rádio", emoji: "📡" },
      { key: "energia_eletrica", label: "Energia elétrica", emoji: "⚡" },
      { key: "agua_encanada", label: "Água encanada", emoji: "💧" },
      { key: "poco_artesiano", label: "Poço artesiano", emoji: "🚿" },
      { key: "rua_asfaltada", label: "Rua asfaltada", emoji: "🛣️" },
      { key: "rua_calcada", label: "Rua calçada", emoji: "🛤️" },
    ],
  },
  {
    key: "seguranca",
    title: "Segurança",
    emoji: "🔐",
    items: [
      { key: "portao_eletronico", label: "Portão eletrônico", emoji: "🔒" },
      { key: "cameras", label: "Câmeras", emoji: "📹" },
      { key: "alarme", label: "Alarme", emoji: "🚨" },
      { key: "murada", label: "Murada", emoji: "🧱" },
      { key: "gradeada", label: "Gradeada", emoji: "🧱" },
    ],
  },
  {
    key: "terreno",
    title: "Terreno",
    emoji: "📐",
    items: [
      { key: "terreno_plano", label: "Terreno plano", emoji: "📐" },
      { key: "terreno_aclive", label: "Terreno em aclive", emoji: "📐" },
      { key: "terreno_declive", label: "Terreno em declive", emoji: "📐" },
      { key: "area_verde", label: "Área verde", emoji: "🌳" },
      { key: "beira_lago", label: "Beira de lago / açude", emoji: "🌊" },
    ],
  },
  {
    key: "documentacao",
    title: "Documentação / Financeiro",
    emoji: "🏦",
    items: [
      { key: "apta_financiamento", label: "Apta a financiamento bancário", emoji: "🏦" },
      { key: "escritura_registrada", label: "Escritura registrada", emoji: "📄" },
      { key: "matricula_individual", label: "Matrícula individual", emoji: "📄" },
      { key: "habite_se", label: "Habite-se", emoji: "📄" },
      { key: "contrato_compra_venda", label: "Contrato de compra e venda", emoji: "📄" },
      { key: "fracao_ideal", label: "Fração ideal", emoji: "📄" },
    ],
  },
];

// All feature keys as a flat set for the property data
export type FeatureFlags = Record<string, boolean>;

export const defaultFeatureFlags = (): FeatureFlags => {
  const flags: FeatureFlags = {};
  featureCategories.forEach((cat) =>
    cat.items.forEach((item) => {
      flags[item.key] = false;
    })
  );
  return flags;
};

// ====== GARANTIAS (ALUGUEL) ======

export interface GarantiasAluguel {
  depositoDeSeguranca: boolean;
  fiador: boolean;
  cartaFianca: boolean;
  seguroFianca: boolean;
  tituloDeCapitalizacao: boolean;
}

export const defaultGarantias: GarantiasAluguel = {
  depositoDeSeguranca: false,
  fiador: false,
  cartaFianca: false,
  seguroFianca: false,
  tituloDeCapitalizacao: false,
};

export const garantiasLabels: Record<keyof GarantiasAluguel, string> = {
  depositoDeSeguranca: "Depósito de Segurança",
  fiador: "Fiador",
  cartaFianca: "Carta Fiança",
  seguroFianca: "Seguro Fiança",
  tituloDeCapitalizacao: "Título de Capitalização",
};

// ====== FOTO ======

export interface ZapImovelPhoto {
  url: string;
  principal: boolean;
}

// ====== IMÓVEL COMPLETO ======

export interface ZapImovel {
  id: string;

  // Obrigatório Zap
  codigoImovel: string;
  tituloImovel: string;
  tipoImovel: TipoImovel;
  subTipoImovel: SubTipoImovel;
  categoriaImovel: CategoriaImovel;
  tipoOferta: TipoOferta;

  // Endereço (CEP obrigatório)
  cep: string;
  estado: string;
  cidade: string;
  zona: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
  latitude: string;
  longitude: string;

  // Preço (ao menos um obrigatório)
  precoVenda: number | null;
  precoAluguel: number | null;
  iptu: number | null;
  valorCondominio: number | null;

  // Área (ao menos um obrigatório)
  areaTotal: number | null;
  areaUtil: number | null;

  // Quantidades
  qtdDormitorios: number | null;
  qtdSuites: number | null;
  qtdBanheiros: number | null;
  qtdVagas: number | null;

  // Descrição (obrigatório, 50-3000 chars)
  observacao: string;

  // Mídia
  fotos: ZapImovelPhoto[];
  videoUrl: string;
  linkTourVirtual: string;

  // Sistema de ícones — features
  features: FeatureFlags;

  // Garantias (aluguel)
  garantias: GarantiasAluguel;

  // Ano construção
  anoConstrucao: number | null;

  // Proprietário
  proprietarioNome: string;
  proprietarioTelefone: string;
  proprietarioEmail: string;
  proprietarioDocumento: string;

  // Controle interno
  ativo: boolean;
  destaque: boolean;
  exclusivo: boolean;
  createdAt: string;
  updatedAt: string;
}
