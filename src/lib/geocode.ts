// Geocodificação de endereços via Nominatim (OpenStreetMap).
// Serviço gratuito, sem chave de API. Política de uso exige no máximo
// 1 requisição por segundo — respeitar o throttle ao chamar em lote.

export interface GeocodeParts {
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Resolve um endereço em coordenadas. Retorna `null` quando não há dados
 * suficientes, quando a busca falha ou quando nada é encontrado.
 */
export async function geocodeAddress(p: GeocodeParts): Promise<GeocodeResult | null> {
  // Precisa de ao menos cidade ou CEP para uma busca minimamente confiável.
  if (!p.cidade && !p.cep) return null;

  const rua = [p.endereco, p.numero].filter(Boolean).join(", ");
  const q = [rua, p.bairro, p.cidade, p.estado, p.cep, "Brasil"]
    .filter(Boolean)
    .join(", ");
  if (!q) return null;

  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=" +
    encodeURIComponent(q);

  try {
    const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = Array.isArray(data) ? data[0] : null;
    if (hit?.lat && hit?.lon) {
      const lat = parseFloat(hit.lat);
      const lng = parseFloat(hit.lon);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}
