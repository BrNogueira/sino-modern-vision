import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ====== STATE ABBREVIATION MAP ======
const stateAbbreviations: Record<string, string> = {
  "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
  "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES",
  "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB", "Paraná": "PR",
  "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC",
  "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO",
};

const propertyTypeMap: Record<string, string> = {
  "Apartamento Padrão": "Residential / Apartment",
  "Loft": "Residential / Loft",
  "Kitchenette/Conjugados": "Residential / Kitnet",
  "Studio": "Residential / Studio",
  "Casa Padrão": "Residential / Home",
  "Casa de Condomínio": "Residential / Condo",
  "Casa de Vila": "Residential / Village House",
  "Terreno Padrão": "Residential / Land Lot",
  "Loteamento/Condomínio": "Residential / Land Lot",
  "Chácara": "Residential / Farm Ranch",
  "Sítio": "Residential / Agricultural",
  "Fazenda": "Residential / Agricultural",
  "Haras": "Residential / Agricultural",
  "Flat": "Residential / Flat",
  "Galpão/Depósito/Armazém": "Commercial / Industrial",
  "Indústria": "Commercial / Industrial",
  "Loja/Salão": "Commercial / Business",
  "Loja de Shopping/Centro Comercial": "Commercial / Business",
  "Box/Garagem": "Commercial / Garage",
  "Conjunto Comercial/Sala": "Commercial / Office",
  "Casa Comercial": "Commercial / Building",
  "Hotel": "Commercial / Hotel",
  "Motel": "Commercial / Hotel",
  "Pousada/Chalé": "Commercial / Hotel",
  "Prédio Inteiro": "Commercial / Edificio Comercial",
};

const featureMap: Record<string, string> = {
  piscina: "Pool", churrasqueira: "BBQ", jardim: "Garden Area",
  lareira: "Fireplace", sacada: "Balcony", closet: "Closet",
  cozinha: "Kitchen", lavanderia: "Laundry", banheira: "Bathtub",
  hidromassagem: "Whirlpool", ar_condicionado_instalado: "Cooling",
  energia_solar: "Solar Energy", internet_fibra: "Internet Connection",
  cameras: "Security Camera", alarme: "Alarm System",
  portao_eletronico: "Electronic Gate", escritorio: "Home Office",
  hall_entrada: "Entrance Hall", garagem_coberta: "Parking Garage",
  deposito: "Warehouse", canil: "Dog Kennel",
  vista_panoramica: "Panoramic View", piso_porcelanato: "Porcelain",
  piso_laminado: "Laminated Floor", piso_madeira: "Wood Floor",
  rua_asfaltada: "Paved Street", poco_artesiano: "Artesian Well",
  patio: "Backyard", murada: "Walls Grids",
  area_verde: "Green space / Park", sala_jantar: "Dinner Room",
};

const warrantyMap: Record<string, string> = {
  depositoDeSeguranca: "SECURITY_DEPOSIT",
  fiador: "GUARANTOR",
  seguroFianca: "INSURANCE_GUARANTEE",
  cartaFianca: "GUARANTEE_LETTER",
  tituloDeCapitalizacao: "CAPITALIZATION_BONDS",
};

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function cdata(text: string): string { return `<![CDATA[${text}]]>`; }

interface Property {
  id: string;
  codigoImovel: string;
  tituloImovel: string;
  subTipoImovel: string;
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
  precoVenda: number | null;
  precoAluguel: number | null;
  valorCondominio: number | null;
  iptu: number | null;
  areaUtil: number | null;
  areaTotal: number | null;
  qtdDormitorios: number | null;
  qtdBanheiros: number | null;
  qtdSuites: number | null;
  qtdVagas: number | null;
  observacao: string;
  fotos: Array<{ url: string; principal: boolean }>;
  videoUrl: string;
  linkTourVirtual: string;
  features: Record<string, boolean>;
  garantias: Record<string, boolean>;
  anoConstrucao: number | null;
  ativo: boolean;
  destaque: boolean;
  exclusivo: boolean;
}

function buildListingXml(p: Property): string {
  const stateAbbr = stateAbbreviations[p.estado] || "RS";
  const hasVenda = p.precoVenda && p.precoVenda > 0;
  const hasAluguel = p.precoAluguel && p.precoAluguel > 0;
  const transactionType = hasVenda && hasAluguel ? "Sale/Rent" : hasAluguel ? "For Rent" : "For Sale";
  const propertyType = propertyTypeMap[p.subTipoImovel] || "Residential / Home";
  const publicationType = p.exclusivo ? "SUPER_PREMIUM" : p.destaque ? "PREMIUM" : "STANDARD";

  const activeFeatures = Object.entries(p.features || {}).filter(([, v]) => v).map(([k]) => featureMap[k]).filter(Boolean);
  const activeWarranties = Object.entries(p.garantias || {}).filter(([, v]) => v).map(([k]) => warrantyMap[k]).filter(Boolean);

  let xml = `    <Listing>\n`;
  xml += `      <ListingID>${escapeXml(p.codigoImovel)}</ListingID>\n`;
  xml += `      <Title>${cdata(p.tituloImovel)}</Title>\n`;
  xml += `      <TransactionType>${transactionType}</TransactionType>\n`;
  xml += `      <PublicationType>${publicationType}</PublicationType>\n`;

  xml += `      <Location displayAddress="All">\n`;
  xml += `        <Country abbreviation="BR">Brasil</Country>\n`;
  xml += `        <State abbreviation="${stateAbbr}">${cdata(p.estado)}</State>\n`;
  xml += `        <City>${cdata(p.cidade)}</City>\n`;
  if (p.zona) xml += `        <Zone>${cdata(p.zona)}</Zone>\n`;
  xml += `        <Neighborhood>${cdata(p.bairro)}</Neighborhood>\n`;
  if (p.endereco) xml += `        <Address>${cdata(p.endereco)}</Address>\n`;
  if (p.numero) xml += `        <StreetNumber>${escapeXml(p.numero)}</StreetNumber>\n`;
  if (p.complemento) xml += `        <Complement>${cdata(p.complemento)}</Complement>\n`;
  xml += `        <PostalCode>${escapeXml(p.cep)}</PostalCode>\n`;
  if (p.latitude) xml += `        <Latitude>${p.latitude}</Latitude>\n`;
  if (p.longitude) xml += `        <Longitude>${p.longitude}</Longitude>\n`;
  xml += `      </Location>\n`;

  xml += `      <Details>\n`;
  xml += `        <PropertyType>${propertyType}</PropertyType>\n`;
  xml += `        <Description>${cdata(p.observacao)}</Description>\n`;
  if (hasVenda) xml += `        <ListPrice currency="BRL">${Math.round(p.precoVenda!)}</ListPrice>\n`;
  if (hasAluguel) xml += `        <RentalPrice currency="BRL" period="Monthly">${Math.round(p.precoAluguel!)}</RentalPrice>\n`;
  if (p.valorCondominio && p.valorCondominio > 0) xml += `        <PropertyAdministrationFee currency="BRL">${Math.round(p.valorCondominio)}</PropertyAdministrationFee>\n`;
  if (p.iptu && p.iptu > 0) xml += `        <Iptu currency="BRL" period="Yearly">${Math.round(p.iptu)}</Iptu>\n`;
  if (p.areaUtil) xml += `        <LivingArea unit="square metres">${Math.round(p.areaUtil)}</LivingArea>\n`;
  if (p.areaTotal) xml += `        <LotArea unit="square metres">${Math.round(p.areaTotal)}</LotArea>\n`;
  if (p.qtdDormitorios != null) xml += `        <Bedrooms>${p.qtdDormitorios}</Bedrooms>\n`;
  if (p.qtdBanheiros != null) xml += `        <Bathrooms>${p.qtdBanheiros}</Bathrooms>\n`;
  if (p.qtdSuites != null && p.qtdSuites > 0) xml += `        <Suites>${p.qtdSuites}</Suites>\n`;
  if (p.qtdVagas != null) xml += `        <Garage>${p.qtdVagas}</Garage>\n`;
  if (p.anoConstrucao) xml += `        <YearBuilt>${p.anoConstrucao}</YearBuilt>\n`;

  if (activeFeatures.length > 0) {
    xml += `        <Features>\n`;
    activeFeatures.forEach((f) => { xml += `          <Feature>${f}</Feature>\n`; });
    xml += `        </Features>\n`;
  }
  if (activeWarranties.length > 0) {
    xml += `        <Warranties>\n`;
    activeWarranties.forEach((w) => { xml += `          <Warranty>${w}</Warranty>\n`; });
    xml += `        </Warranties>\n`;
  }

  xml += `      </Details>\n`;

  if (p.fotos && p.fotos.length > 0) {
    xml += `      <Media>\n`;
    if (p.videoUrl) xml += `        <Item medium="video">${escapeXml(p.videoUrl)}</Item>\n`;
    p.fotos.forEach((foto, i) => {
      const primary = foto.principal ? ' primary="true"' : "";
      xml += `        <Item medium="image" caption="foto${i + 1}"${primary}>${escapeXml(foto.url)}</Item>\n`;
    });
    xml += `      </Media>\n`;
  }

  if (p.linkTourVirtual) xml += `      <VirtualTourLink>${escapeXml(p.linkTourVirtual)}</VirtualTourLink>\n`;

  xml += `      <ContactInfo>\n`;
  xml += `        <Name>Sinos Imóveis</Name>\n`;
  xml += `        <Email>atendimento@sinosimoveis.com.br</Email>\n`;
  xml += `        <Website>https://sinosimoveis.com.br</Website>\n`;
  xml += `        <Telephone>(51)3596 1446</Telephone>\n`;
  xml += `        <OfficeName>Sinos Imóveis - Lomba Grande</OfficeName>\n`;
  xml += `      </ContactInfo>\n`;

  xml += `    </Listing>\n`;
  return xml;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept properties via POST body (from admin panel)
    // or return a static feed if properties are stored in DB (future)
    let properties: Property[] = [];

    if (req.method === "POST") {
      const body = await req.json();
      properties = body.properties || [];
    }

    const activeProperties = properties.filter((p) => p.ativo);
    const now = new Date().toISOString().split(".")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"\n`;
    xml += `                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">\n`;
    xml += `  <Header>\n`;
    xml += `    <Provider>Sinos Imóveis</Provider>\n`;
    xml += `    <Email>atendimento@sinosimoveis.com.br</Email>\n`;
    xml += `    <ContactName>Sinos Imóveis</ContactName>\n`;
    xml += `    <PublishDate>${now}</PublishDate>\n`;
    xml += `    <Telephone>(51)3596 1446</Telephone>\n`;
    xml += `  </Header>\n`;
    xml += `  <Listings>\n`;

    activeProperties.forEach((prop) => {
      xml += buildListingXml(prop);
    });

    xml += `  </Listings>\n`;
    xml += `</ListingDataFeed>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating XML feed:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
