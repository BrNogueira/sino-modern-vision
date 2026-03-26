/**
 * VRSync XML Generator — Maps ZapImovel data to VRSync XML format
 * for Canal Pro (Grupo ZAP) integration.
 * Docs: https://developers.grupozap.com/feeds/vrsync/
 */

import { ZapImovel, TipoImovel, SubTipoImovel } from "@/types/zapImoveis";

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

// ====== PROPERTY TYPE MAPPING ======
const propertyTypeMap: Record<string, string> = {
  // Apartamento
  "Apartamento Padrão": "Residential / Apartment",
  "Loft": "Residential / Loft",
  "Kitchenette/Conjugados": "Residential / Kitnet",
  "Studio": "Residential / Studio",
  // Casa
  "Casa Padrão": "Residential / Home",
  "Casa de Condomínio": "Residential / Condo",
  "Casa de Vila": "Residential / Village House",
  // Terreno
  "Terreno Padrão": "Residential / Land Lot",
  "Loteamento/Condomínio": "Residential / Land Lot",
  // Rural
  "Chácara": "Residential / Farm Ranch",
  "Sítio": "Residential / Agricultural",
  "Fazenda": "Residential / Agricultural",
  "Haras": "Residential / Agricultural",
  // Flat
  "Flat": "Residential / Flat",
  // Comercial
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

// ====== FEATURE MAPPING (internal key → VRSync Feature value) ======
const featureMap: Record<string, string> = {
  piscina: "Pool",
  churrasqueira: "BBQ",
  jardim: "Garden Area",
  lareira: "Fireplace",
  sacada: "Balcony",
  closet: "Closet",
  cozinha: "Kitchen",
  lavanderia: "Laundry",
  banheira: "Bathtub",
  hidromassagem: "Whirlpool",
  ar_condicionado_instalado: "Cooling",
  energia_solar: "Solar Energy",
  internet_fibra: "Internet Connection",
  cameras: "Security Camera",
  alarme: "Alarm System",
  portao_eletronico: "Electronic Gate",
  escritorio: "Home Office",
  hall_entrada: "Entrance Hall",
  garagem_coberta: "Parking Garage",
  deposito: "Warehouse",
  canil: "Dog Kennel",
  vista_panoramica: "Panoramic View",
  piso_porcelanato: "Porcelain",
  piso_laminado: "Laminated Floor",
  piso_madeira: "Wood Floor",
  rua_asfaltada: "Paved Street",
  poco_artesiano: "Artesian Well",
  patio: "Backyard",
  murada: "Walls Grids",
  area_verde: "Green space / Park",
  sala_jantar: "Dinner Room",
};

// ====== WARRANTY MAPPING ======
const warrantyMap: Record<string, string> = {
  depositoDeSeguranca: "SECURITY_DEPOSIT",
  fiador: "GUARANTOR",
  seguroFianca: "INSURANCE_GUARANTEE",
  cartaFianca: "GUARANTEE_LETTER",
  tituloDeCapitalizacao: "CAPITALIZATION_BONDS",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(text: string): string {
  return `<![CDATA[${text}]]>`;
}

function getTransactionType(imovel: ZapImovel): string {
  const hasVenda = imovel.precoVenda && imovel.precoVenda > 0;
  const hasAluguel = imovel.precoAluguel && imovel.precoAluguel > 0;
  if (hasVenda && hasAluguel) return "Sale/Rent";
  if (hasAluguel) return "For Rent";
  return "For Sale";
}

function getPropertyType(subTipo: SubTipoImovel): string {
  return propertyTypeMap[subTipo] || "Residential / Home";
}

function getStateAbbr(estado: string): string {
  return stateAbbreviations[estado] || "RS";
}

function getPublicationType(imovel: ZapImovel): string {
  if (imovel.exclusivo) return "SUPER_PREMIUM";
  if (imovel.destaque) return "PREMIUM";
  return "STANDARD";
}

function buildListingXml(imovel: ZapImovel): string {
  const stateAbbr = getStateAbbr(imovel.estado);
  const transactionType = getTransactionType(imovel);
  const propertyType = getPropertyType(imovel.subTipoImovel);
  const publicationType = getPublicationType(imovel);

  // Features
  const activeFeatures = Object.entries(imovel.features || {})
    .filter(([, v]) => v)
    .map(([k]) => featureMap[k])
    .filter(Boolean);

  // Warranties
  const activeWarranties = Object.entries(imovel.garantias || {})
    .filter(([, v]) => v)
    .map(([k]) => warrantyMap[k])
    .filter(Boolean);

  let xml = `    <Listing>\n`;
  xml += `      <ListingID>${escapeXml(imovel.codigoImovel)}</ListingID>\n`;
  xml += `      <Title>${cdata(imovel.tituloImovel)}</Title>\n`;
  xml += `      <TransactionType>${transactionType}</TransactionType>\n`;
  xml += `      <PublicationType>${publicationType}</PublicationType>\n`;

  // Location
  xml += `      <Location displayAddress="All">\n`;
  xml += `        <Country abbreviation="BR">Brasil</Country>\n`;
  xml += `        <State abbreviation="${stateAbbr}">${cdata(imovel.estado)}</State>\n`;
  xml += `        <City>${cdata(imovel.cidade)}</City>\n`;
  if (imovel.zona) xml += `        <Zone>${cdata(imovel.zona)}</Zone>\n`;
  xml += `        <Neighborhood>${cdata(imovel.bairro)}</Neighborhood>\n`;
  if (imovel.endereco) xml += `        <Address>${cdata(imovel.endereco)}</Address>\n`;
  if (imovel.numero) xml += `        <StreetNumber>${escapeXml(imovel.numero)}</StreetNumber>\n`;
  if (imovel.complemento) xml += `        <Complement>${cdata(imovel.complemento)}</Complement>\n`;
  xml += `        <PostalCode>${escapeXml(imovel.cep)}</PostalCode>\n`;
  if (imovel.latitude) xml += `        <Latitude>${imovel.latitude}</Latitude>\n`;
  if (imovel.longitude) xml += `        <Longitude>${imovel.longitude}</Longitude>\n`;
  xml += `      </Location>\n`;

  // Details
  xml += `      <Details>\n`;
  xml += `        <PropertyType>${propertyType}</PropertyType>\n`;
  xml += `        <Description>${cdata(imovel.observacao)}</Description>\n`;

  if (imovel.precoVenda && imovel.precoVenda > 0) {
    xml += `        <ListPrice currency="BRL">${Math.round(imovel.precoVenda)}</ListPrice>\n`;
  }
  if (imovel.precoAluguel && imovel.precoAluguel > 0) {
    xml += `        <RentalPrice currency="BRL" period="Monthly">${Math.round(imovel.precoAluguel)}</RentalPrice>\n`;
  }
  if (imovel.valorCondominio && imovel.valorCondominio > 0) {
    xml += `        <PropertyAdministrationFee currency="BRL">${Math.round(imovel.valorCondominio)}</PropertyAdministrationFee>\n`;
  }
  if (imovel.iptu && imovel.iptu > 0) {
    xml += `        <Iptu currency="BRL" period="Yearly">${Math.round(imovel.iptu)}</Iptu>\n`;
  }
  if (imovel.areaUtil) {
    xml += `        <LivingArea unit="square metres">${Math.round(imovel.areaUtil)}</LivingArea>\n`;
  }
  if (imovel.areaTotal) {
    xml += `        <LotArea unit="square metres">${Math.round(imovel.areaTotal)}</LotArea>\n`;
  }
  if (imovel.qtdDormitorios != null) {
    xml += `        <Bedrooms>${imovel.qtdDormitorios}</Bedrooms>\n`;
  }
  if (imovel.qtdBanheiros != null) {
    xml += `        <Bathrooms>${imovel.qtdBanheiros}</Bathrooms>\n`;
  }
  if (imovel.qtdSuites != null && imovel.qtdSuites > 0) {
    xml += `        <Suites>${imovel.qtdSuites}</Suites>\n`;
  }
  if (imovel.qtdVagas != null) {
    xml += `        <Garage>${imovel.qtdVagas}</Garage>\n`;
  }
  if (imovel.anoConstrucao) {
    xml += `        <YearBuilt>${imovel.anoConstrucao}</YearBuilt>\n`;
  }

  // Features
  if (activeFeatures.length > 0) {
    xml += `        <Features>\n`;
    activeFeatures.forEach((f) => {
      xml += `          <Feature>${f}</Feature>\n`;
    });
    xml += `        </Features>\n`;
  }

  // Warranties
  if (activeWarranties.length > 0) {
    xml += `        <Warranties>\n`;
    activeWarranties.forEach((w) => {
      xml += `          <Warranty>${w}</Warranty>\n`;
    });
    xml += `        </Warranties>\n`;
  }

  xml += `      </Details>\n`;

  // Media
  if (imovel.fotos && imovel.fotos.length > 0) {
    xml += `      <Media>\n`;
    if (imovel.videoUrl) {
      xml += `        <Item medium="video">${escapeXml(imovel.videoUrl)}</Item>\n`;
    }
    imovel.fotos.forEach((foto, i) => {
      const primary = foto.principal ? ' primary="true"' : "";
      xml += `        <Item medium="image" caption="foto${i + 1}"${primary}>${escapeXml(foto.url)}</Item>\n`;
    });
    xml += `      </Media>\n`;
  }

  // Virtual Tour
  if (imovel.linkTourVirtual) {
    xml += `      <VirtualTourLink>${escapeXml(imovel.linkTourVirtual)}</VirtualTourLink>\n`;
  }

  // Contact Info
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

export function generateVRSyncXml(properties: ZapImovel[]): string {
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

  return xml;
}
