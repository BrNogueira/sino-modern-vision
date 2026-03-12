import propertyCasa from "@/assets/property-casa.jpg";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertyTerreno from "@/assets/property-terreno.jpg";
import propertySitio from "@/assets/property-sitio.jpg";
import propertyComercial from "@/assets/property-comercial.jpg";

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
  },
  {
    code: "5981",
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
  },
  {
    code: "5982",
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
  },
  {
    code: "5983",
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
  },
  {
    code: "5984",
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
  },
];
