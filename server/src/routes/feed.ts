// ============================================================================
// Feed VRSync (VivaReal/ZAP/Canal Pro) — porta da edge function canal-pro-feed.
// GET /api/feed/canal-pro → XML de TODOS os imóveis ativos (puxado direto do MySQL).
// Rota pública (portais consomem por URL).
// ============================================================================
import { Hono } from "hono";
import { queryMany } from "../lib/db-helpers.js";

const stateAbbreviations: Record<string, string> = {
  Acre: "AC", Alagoas: "AL", Amapá: "AP", Amazonas: "AM", Bahia: "BA", Ceará: "CE",
  "Distrito Federal": "DF", "Espírito Santo": "ES", Goiás: "GO", Maranhão: "MA",
  "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG", Pará: "PA",
  Paraíba: "PB", Paraná: "PR", Pernambuco: "PE", Piauí: "PI", "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS", Rondônia: "RO", Roraima: "RR",
  "Santa Catarina": "SC", "São Paulo": "SP", Sergipe: "SE", Tocantins: "TO",
};

const propertyTypeMap: Record<string, string> = {
  "Apartamentos": "Residential / Apartment", "Casas": "Residential / Home",
  "Terrenos": "Residential / Land Lot", "Terrenos de Esquina": "Residential / Land Lot",
  "Sítios": "Residential / Agricultural", "Sala comercial": "Commercial / Office",
  "Comerciais": "Commercial / Business", "Pavilhões": "Commercial / Industrial",
  "Condomínios": "Residential / Condo", "Lançamentos": "Residential / Apartment",
};

const featureMap: Record<string, string> = {
  piscina: "Pool", churrasqueira: "BBQ", jardim: "Garden Area", lareira: "Fireplace",
  sacada: "Balcony", closet: "Closet", cozinha: "Kitchen", lavanderia: "Laundry",
  banheira: "Bathtub", hidromassagem: "Whirlpool", ar_condicionado_instalado: "Cooling",
  energia_solar: "Solar Energy", internet_fibra: "Internet Connection", cameras: "Security Camera",
  alarme: "Alarm System", portao_eletronico: "Electronic Gate", escritorio: "Home Office",
  hall_entrada: "Entrance Hall", garagem_coberta: "Parking Garage", deposito: "Warehouse",
  canil: "Dog Kennel", vista_panoramica: "Panoramic View", piso_porcelanato: "Porcelain",
  piso_laminado: "Laminated Floor", piso_madeira: "Wood Floor", rua_asfaltada: "Paved Street",
  poco_artesiano: "Artesian Well", patio: "Backyard", murada: "Walls Grids",
  area_verde: "Green space / Park", sala_jantar: "Dinner Room",
};

const warrantyMap: Record<string, string> = {
  depositoDeSeguranca: "SECURITY_DEPOSIT", fiador: "GUARANTOR",
  seguroFianca: "INSURANCE_GUARANTEE", cartaFianca: "GUARANTEE_LETTER",
  tituloDeCapitalizacao: "CAPITALIZATION_BONDS",
};

const escapeXml = (t: string) =>
  String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const cdata = (t: string) => `<![CDATA[${t ?? ""}]]>`;

/** mysql2 retorna JSON já parseado; normaliza strings/objetos por segurança. */
function asJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") { try { return JSON.parse(v) as T; } catch { return fallback; } }
  return v as T;
}

function buildListingXml(r: Record<string, any>): string {
  const fotos = asJson<Array<{ url: string; principal: boolean }>>(r.fotos, []);
  const features = asJson<Record<string, boolean>>(r.features, {});
  const garantias = asJson<Record<string, boolean>>(r.garantias, {});
  const stateAbbr = stateAbbreviations[r.estado] || "RS";
  const precoVenda = r.preco_venda != null ? Number(r.preco_venda) : null;
  const precoAluguel = r.preco_aluguel != null ? Number(r.preco_aluguel) : null;
  const hasVenda = precoVenda && precoVenda > 0;
  const hasAluguel = precoAluguel && precoAluguel > 0;
  const transactionType = hasVenda && hasAluguel ? "Sale/Rent" : hasAluguel ? "For Rent" : "For Sale";
  const propertyType = propertyTypeMap[r.sub_tipo_imovel] || propertyTypeMap[r.tipo_imovel] || "Residential / Home";
  const publicationType = r.exclusivo ? "SUPER_PREMIUM" : r.destaque ? "PREMIUM" : "STANDARD";
  const activeFeatures = Object.entries(features).filter(([, v]) => v).map(([k]) => featureMap[k]).filter(Boolean);
  const activeWarranties = Object.entries(garantias).filter(([, v]) => v).map(([k]) => warrantyMap[k]).filter(Boolean);

  let xml = `    <Listing>\n`;
  xml += `      <ListingID>${escapeXml(r.codigo_imovel)}</ListingID>\n`;
  xml += `      <Title>${cdata(r.titulo_imovel)}</Title>\n`;
  xml += `      <TransactionType>${transactionType}</TransactionType>\n`;
  xml += `      <PublicationType>${publicationType}</PublicationType>\n`;
  xml += `      <Location displayAddress="All">\n`;
  xml += `        <Country abbreviation="BR">Brasil</Country>\n`;
  xml += `        <State abbreviation="${stateAbbr}">${cdata(r.estado)}</State>\n`;
  xml += `        <City>${cdata(r.cidade)}</City>\n`;
  if (r.zona) xml += `        <Zone>${cdata(r.zona)}</Zone>\n`;
  xml += `        <Neighborhood>${cdata(r.bairro ?? "")}</Neighborhood>\n`;
  if (r.endereco) xml += `        <Address>${cdata(r.endereco)}</Address>\n`;
  if (r.numero) xml += `        <StreetNumber>${escapeXml(r.numero)}</StreetNumber>\n`;
  if (r.complemento) xml += `        <Complement>${cdata(r.complemento)}</Complement>\n`;
  xml += `        <PostalCode>${escapeXml(r.cep ?? "")}</PostalCode>\n`;
  if (r.latitude) xml += `        <Latitude>${r.latitude}</Latitude>\n`;
  if (r.longitude) xml += `        <Longitude>${r.longitude}</Longitude>\n`;
  xml += `      </Location>\n`;
  xml += `      <Details>\n`;
  xml += `        <PropertyType>${propertyType}</PropertyType>\n`;
  xml += `        <Description>${cdata(r.observacao ?? r.descricao_curta ?? "")}</Description>\n`;
  if (hasVenda) xml += `        <ListPrice currency="BRL">${Math.round(precoVenda!)}</ListPrice>\n`;
  if (hasAluguel) xml += `        <RentalPrice currency="BRL" period="Monthly">${Math.round(precoAluguel!)}</RentalPrice>\n`;
  if (r.valor_condominio && Number(r.valor_condominio) > 0) xml += `        <PropertyAdministrationFee currency="BRL">${Math.round(Number(r.valor_condominio))}</PropertyAdministrationFee>\n`;
  if (r.iptu && Number(r.iptu) > 0) xml += `        <Iptu currency="BRL" period="Yearly">${Math.round(Number(r.iptu))}</Iptu>\n`;
  if (r.area_util) xml += `        <LivingArea unit="square metres">${Math.round(Number(r.area_util))}</LivingArea>\n`;
  if (r.area_total) xml += `        <LotArea unit="square metres">${Math.round(Number(r.area_total))}</LotArea>\n`;
  if (r.qtd_dormitorios != null) xml += `        <Bedrooms>${r.qtd_dormitorios}</Bedrooms>\n`;
  if (r.qtd_banheiros != null) xml += `        <Bathrooms>${r.qtd_banheiros}</Bathrooms>\n`;
  if (r.qtd_suites != null && r.qtd_suites > 0) xml += `        <Suites>${r.qtd_suites}</Suites>\n`;
  if (r.qtd_vagas != null) xml += `        <Garage>${r.qtd_vagas}</Garage>\n`;
  if (r.ano_construcao) xml += `        <YearBuilt>${r.ano_construcao}</YearBuilt>\n`;
  if (activeFeatures.length) {
    xml += `        <Features>\n`;
    activeFeatures.forEach((f) => { xml += `          <Feature>${f}</Feature>\n`; });
    xml += `        </Features>\n`;
  }
  if (activeWarranties.length) {
    xml += `        <Warranties>\n`;
    activeWarranties.forEach((w) => { xml += `          <Warranty>${w}</Warranty>\n`; });
    xml += `        </Warranties>\n`;
  }
  xml += `      </Details>\n`;
  if (r.video_url || fotos.length) {
    xml += `      <Media>\n`;
    if (r.video_url) xml += `        <Item medium="video">${escapeXml(r.video_url)}</Item>\n`;
    fotos.forEach((foto, i) => {
      const primary = foto.principal ? ` primary="true"` : "";
      xml += `        <Item medium="image" caption="foto${i + 1}"${primary}>${escapeXml(foto.url)}</Item>\n`;
    });
    xml += `      </Media>\n`;
  }
  if (r.link_tour_virtual) xml += `      <VirtualTourLink>${escapeXml(r.link_tour_virtual)}</VirtualTourLink>\n`;
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

export const feedRouter = new Hono();

feedRouter.get("/canal-pro", async (c) => {
  const rows = await queryMany<Record<string, any>>("SELECT * FROM imoveis WHERE ativo = 1");
  const now = new Date().toISOString().split(".")[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"\n`;
  xml += `                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `                 xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">\n`;
  xml += `  <Header>\n    <Provider>Sinos Imóveis</Provider>\n    <Email>atendimento@sinosimoveis.com.br</Email>\n`;
  xml += `    <ContactName>Sinos Imóveis</ContactName>\n    <PublishDate>${now}</PublishDate>\n    <Telephone>(51)3596 1446</Telephone>\n  </Header>\n`;
  xml += `  <Listings>\n`;
  for (const r of rows) xml += buildListingXml(r);
  xml += `  </Listings>\n</ListingDataFeed>`;
  return c.body(xml, 200, { "Content-Type": "application/xml; charset=utf-8" });
});
