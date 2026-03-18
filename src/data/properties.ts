import propertyCasa from "@/assets/property-casa.jpg";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyComercial from "@/assets/property-comercial.jpg";
import propertyDetail1 from "@/assets/property-detail-1.jpg";
import propertyDetail2 from "@/assets/property-detail-2.jpg";
import propertyDetail3 from "@/assets/property-detail-3.jpg";
import propertyDetail4 from "@/assets/property-detail-4.jpg";

export interface Property {
  code: string;
  image: string;
  title: string;
  type: string;
  transactionType: "venda" | "aluguel";
  location: string;
  city: string;
  state: string;
  neighborhood: string;
  price: number;
  priceFormatted: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parking?: number;
  area?: number;
  areaDimensions?: string;
  hasPool?: boolean;
  featured?: boolean;
  exclusive?: boolean;
  // Extended fields for detail page
  areaTerreno?: number;
  areaConstruida?: number;
  salas?: number;
  lavabos?: number;
  gallery?: string[];
  fotosAreaComum?: string[];
  acabamentos?: string[];
  amenidades?: string[];
  aceitaFinanciamento?: boolean;
  description?: string;
  linkWhatsapp?: string;
  emailContato?: string;
  taxasAdicionais?: { nome: string; valor: string }[];
  condicoesPagamento?: string;
  latitude?: number;
  longitude?: number;
  corretor?: {
    nome: string;
    creci: string;
    telefone: string;
  };
}

export const properties: Property[] = [
  {
    code: "5979",
    image: propertyCasa,
    title: "Casa Moderna Alto Padrão",
    type: "Casa",
    transactionType: "venda",
    location: "COLINA DO SOL-CAMPO BOM",
    city: "Campo Bom",
    state: "RS",
    neighborhood: "Colina do Sol",
    price: 1590000,
    priceFormatted: "R$1.590.000,00",
    suites: 3,
    bathrooms: 1,
    parking: 2,
    featured: true,
    exclusive: true,
    areaTerreno: 450,
    areaConstruida: 280,
    salas: 2,
    lavabos: 1,
    hasPool: true,
    gallery: [propertyCasa, propertyDetail1, propertyDetail2, propertyDetail3, propertyDetail4],
    fotosAreaComum: [propertyDetail2, propertyDetail3, propertyDetail4],
    acabamentos: ["Forro em gesso", "Piso laminado nos quartos", "Porcelanato nas áreas comuns", "Bancadas em granito"],
    amenidades: ["Academia", "Piscina", "Salão de festas", "Espaço gourmet", "Segurança 24 horas", "Playground"],
    aceitaFinanciamento: true,
    description: "Esta magnífica casa moderna representa o ápice do luxo e conforto. Com arquitetura contemporânea e acabamentos de alto padrão, oferece uma experiência de moradia incomparável. O imóvel conta com amplos espaços integrados, perfeitos para receber família e amigos.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
    latitude: -29.6842,
    longitude: -51.0497,
  },
  {
    code: "5980",
    image: propertyApartment,
    title: "Casa com Amplo Terreno",
    type: "Casa",
    transactionType: "venda",
    location: "LOMBA GRANDE-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Lomba Grande",
    price: 629000,
    priceFormatted: "R$629.000,00",
    bedrooms: 3,
    bathrooms: 1,
    parking: 2,
    hasPool: true,
    featured: true,
    areaTerreno: 600,
    areaConstruida: 180,
    salas: 1,
    gallery: [propertyApartment, propertyDetail1, propertyDetail2],
    acabamentos: ["Piso cerâmico", "Forro PVC"],
    aceitaFinanciamento: true,
    description: "Casa espaçosa com amplo terreno em Lomba Grande. Ideal para famílias que buscam espaço e contato com a natureza.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
    latitude: -29.7220,
    longitude: -51.0680,
    image: propertyTerreno,
    title: "Terreno Plano em Condomínio",
    type: "Terreno",
    transactionType: "venda",
    location: "LOMBA GRANDE-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Lomba Grande",
    price: 265000,
    priceFormatted: "R$265.000,00",
    area: 983,
    areaDimensions: "16,5x59,61",
    featured: true,
    areaTerreno: 983,
    gallery: [propertyTerreno, propertyDetail3],
    amenidades: ["Portaria 24h", "Área verde"],
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
    latitude: -29.7350,
    longitude: -51.0550,
    image: propertySitio,
    title: "Sítio com Vista para Serra",
    type: "Sítio",
    transactionType: "venda",
    location: "LOMBA GRANDE-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Lomba Grande",
    price: 220000,
    priceFormatted: "R$220.000,00",
    areaTerreno: 5000,
    gallery: [propertySitio, propertyDetail4],
    description: "Sítio com vista privilegiada para a serra gaúcha. Perfeito para quem busca tranquilidade.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
    latitude: -29.7100,
    longitude: -51.0800,
    image: propertyComercial,
    title: "Casa Colonial Completa",
    type: "Casa",
    transactionType: "venda",
    location: "LOMBA GRANDE-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Lomba Grande",
    price: 699000,
    priceFormatted: "R$699.000,00",
    bedrooms: 4,
    bathrooms: 2,
    parking: 3,
    areaConstruida: 250,
    areaTerreno: 400,
    salas: 2,
    gallery: [propertyComercial, propertyDetail1, propertyDetail2, propertyDetail3],
    acabamentos: ["Forro em madeira", "Piso em taco", "Janelas em madeira maciça"],
    aceitaFinanciamento: true,
    description: "Casa colonial completa com acabamento refinado e amplo espaço. Localização privilegiada em Lomba Grande.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
    latitude: -29.7400,
    longitude: -51.0450,
    image: propertyTerreno,
    title: "Terreno de Esquina",
    type: "Terreno",
    transactionType: "venda",
    location: "LOMBA GRANDE-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Lomba Grande",
    price: 265000,
    priceFormatted: "R$265.000,00",
    area: 450,
    areaTerreno: 450,
    gallery: [propertyTerreno],
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
  },
  {
    code: "5985",
    image: propertyCasa,
    title: "Apartamento 2 Dormitórios",
    type: "Apartamento",
    transactionType: "aluguel",
    location: "CENTRO-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Centro",
    price: 1800,
    priceFormatted: "R$1.800,00/mês",
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    areaConstruida: 65,
    gallery: [propertyCasa, propertyDetail1],
    fotosAreaComum: [propertyDetail2, propertyDetail3],
    amenidades: ["Portaria 24h", "Elevador", "Salão de festas"],
    acabamentos: ["Piso laminado", "Forro em gesso"],
    taxasAdicionais: [
      { nome: "Condomínio", valor: "R$ 450,00" },
      { nome: "IPTU", valor: "R$ 120,00/mês" },
      { nome: "Seguro incêndio", valor: "R$ 35,00/mês" },
    ],
    condicoesPagamento: "Aluguel + caução de 3 meses",
    description: "Apartamento funcional e bem localizado no centro de Novo Hamburgo.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
  },
  {
    code: "5986",
    image: propertyApartment,
    title: "Sala Comercial 50m²",
    type: "Comercial",
    transactionType: "aluguel",
    location: "CENTRO-SÃO LEOPOLDO",
    city: "São Leopoldo",
    state: "RS",
    neighborhood: "Centro",
    price: 2500,
    priceFormatted: "R$2.500,00/mês",
    area: 50,
    areaConstruida: 50,
    gallery: [propertyApartment],
    taxasAdicionais: [
      { nome: "Condomínio", valor: "R$ 300,00" },
      { nome: "IPTU", valor: "R$ 85,00/mês" },
    ],
    condicoesPagamento: "Aluguel + caução de 3 meses",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
  },
  {
    code: "5987",
    image: propertySitio,
    title: "Casa Condomínio Fechado",
    type: "Condomínio",
    transactionType: "venda",
    location: "RONDÔNIA-NOVO HAMBURGO",
    city: "Novo Hamburgo",
    state: "RS",
    neighborhood: "Rondônia",
    price: 850000,
    priceFormatted: "R$850.000,00",
    suites: 2,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    hasPool: true,
    featured: true,
    exclusive: true,
    areaTerreno: 500,
    areaConstruida: 320,
    salas: 2,
    lavabos: 1,
    gallery: [propertySitio, propertyDetail1, propertyDetail2, propertyDetail3, propertyDetail4],
    fotosAreaComum: [propertyDetail1, propertyDetail2, propertyDetail3],
    acabamentos: ["Forro em gesso", "Piso porcelanato", "Bancadas em mármore", "Banheira de hidromassagem"],
    amenidades: ["Academia", "Piscina com borda infinita", "Salão de festas", "Espaço gourmet", "Market/minimercado", "Segurança 24 horas", "Quadra poliesportiva", "Playground"],
    aceitaFinanciamento: true,
    description: "Casa de alto padrão em condomínio fechado com infraestrutura completa de lazer e segurança. Acabamento premium em todos os ambientes.",
    linkWhatsapp: "https://wa.me/555198765432",
    emailContato: "contato@sinosimoveis.com.br",
    corretor: { nome: "João Martins", creci: "CRECI 12345", telefone: "(51) 9876-5432" },
  },
];
