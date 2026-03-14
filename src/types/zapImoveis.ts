// Estrutura de dados conforme API Zap Imóveis (formato XML ZAP)

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

export interface CaracteristicasImovel {
  escritorio: boolean;
  esquina: boolean;
  arCondicionado: boolean;
  hidromassagem: boolean;
  jardim: boolean;
  churrasqueira: boolean;
  lareira: boolean;
  piscina: boolean;
  quintal: boolean;
  qtdElevador: number;
  redeTelefone: boolean;
  salaJantar: boolean;
  sauna: boolean;
  terraco: boolean;
  tvCabo: boolean;
  areaServico: boolean;
  segurancaInterna: boolean;
  playground: boolean;
  quadraPoliEsportiva: boolean;
  salaGinastica: boolean;
  salaoJogos: boolean;
  despensa: boolean;
  interfone: boolean;
  mobiliado: boolean;
  lavanderiaColetiva: boolean;
  quadraTenis: boolean;
  acesso24Horas: boolean;
  salaoFestas: boolean;
  armarioCozinha: boolean;
  armarioEmbutido: boolean;
  copa: boolean;
  closet: boolean;
}

export interface GarantiasAluguel {
  depositoDeSeguranca: boolean;
  fiador: boolean;
  cartaFianca: boolean;
  seguroFianca: boolean;
  tituloDeCapitalizacao: boolean;
}

export interface ZapImovelPhoto {
  url: string;
  principal: boolean;
}

export interface ZapImovel {
  id: string;
  // Identificação
  codigoImovel: string;
  tituloImovel: string;

  // Classificação
  tipoImovel: TipoImovel;
  subTipoImovel: SubTipoImovel;
  categoriaImovel: CategoriaImovel;
  tipoOferta: TipoOferta;

  // Endereço
  estado: string;
  cidade: string;
  zona: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  latitude: string;
  longitude: string;

  // Preços
  precoVenda: number | null;
  precoAluguel: number | null;
  iptu: number | null;
  valorCondominio: number | null;

  // Áreas
  areaTotal: number | null;
  areaUtil: number | null;

  // Quantidades
  qtdDormitorios: number | null;
  qtdSuites: number | null;
  qtdBanheiros: number | null;
  qtdVagas: number | null;

  // Descrição
  observacao: string;

  // Mídia
  fotos: ZapImovelPhoto[];
  videoUrl: string;
  linkTourVirtual: string;

  // Características
  caracteristicas: CaracteristicasImovel;

  // Garantias (aluguel)
  garantias: GarantiasAluguel;

  // Ano construção
  anoConstrucao: number | null;

  // Controle interno
  ativo: boolean;
  destaque: boolean;
  exclusivo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultCaracteristicas: CaracteristicasImovel = {
  escritorio: false,
  esquina: false,
  arCondicionado: false,
  hidromassagem: false,
  jardim: false,
  churrasqueira: false,
  lareira: false,
  piscina: false,
  quintal: false,
  qtdElevador: 0,
  redeTelefone: false,
  salaJantar: false,
  sauna: false,
  terraco: false,
  tvCabo: false,
  areaServico: false,
  segurancaInterna: false,
  playground: false,
  quadraPoliEsportiva: false,
  salaGinastica: false,
  salaoJogos: false,
  despensa: false,
  interfone: false,
  mobiliado: false,
  lavanderiaColetiva: false,
  quadraTenis: false,
  acesso24Horas: false,
  salaoFestas: false,
  armarioCozinha: false,
  armarioEmbutido: false,
  copa: false,
  closet: false,
};

export const defaultGarantias: GarantiasAluguel = {
  depositoDeSeguranca: false,
  fiador: false,
  cartaFianca: false,
  seguroFianca: false,
  tituloDeCapitalizacao: false,
};

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

export const caracteristicasLabels: Record<keyof CaracteristicasImovel, string> = {
  escritorio: "Escritório",
  esquina: "Imóvel de Esquina",
  arCondicionado: "Ar Condicionado",
  hidromassagem: "Hidromassagem",
  jardim: "Jardim",
  churrasqueira: "Churrasqueira",
  lareira: "Lareira",
  piscina: "Piscina",
  quintal: "Quintal",
  qtdElevador: "Elevador",
  redeTelefone: "Cabeamento Estruturado",
  salaJantar: "Sala de Jantar",
  sauna: "Sauna",
  terraco: "Varanda/Terraço",
  tvCabo: "TV a Cabo",
  areaServico: "Área de Serviço",
  segurancaInterna: "Circuito de Segurança",
  playground: "Playground",
  quadraPoliEsportiva: "Quadra Poliesportiva",
  salaGinastica: "Academia",
  salaoJogos: "Salão de Jogos",
  despensa: "Despensa",
  interfone: "Interfone",
  mobiliado: "Mobiliado",
  lavanderiaColetiva: "Lavanderia",
  quadraTenis: "Quadra de Tênis",
  acesso24Horas: "Vigia 24h",
  salaoFestas: "Salão de Festas",
  armarioCozinha: "Armário na Cozinha",
  armarioEmbutido: "Armário Embutido",
  copa: "Copa",
  closet: "Closet",
};

export const garantiasLabels: Record<keyof GarantiasAluguel, string> = {
  depositoDeSeguranca: "Depósito de Segurança",
  fiador: "Fiador",
  cartaFianca: "Carta Fiança",
  seguroFianca: "Seguro Fiança",
  tituloDeCapitalizacao: "Título de Capitalização",
};
