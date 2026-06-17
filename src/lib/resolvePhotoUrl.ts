/**
 * Resolve URL de foto de imóvel (upload local ou legado Maya).
 */
import propertyPlaceholder from "@/assets/property-casa.jpg";
import { apiUrl } from "@/integrations/api/client";

const LEGACY_IMG_BASE = (
  (import.meta.env.VITE_LEGACY_IMG_BASE as string | undefined) ?? "https://www.sinosimoveis.com.br/admin/imagens"
).replace(/\/+$/, "");

export function resolvePhotoUrl(url: string | null | undefined): string {
  if (!url) return propertyPlaceholder;
  const trimmed = url.trim();
  if (!trimmed) return propertyPlaceholder;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/assets/")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/api/storage/")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  const rel = trimmed.replace(/^\/+/, "");
  if (LEGACY_IMG_BASE) return `${LEGACY_IMG_BASE}/${rel}`;
  return apiUrl(`/api/storage/imoveis-fotos/${rel}`);
}

export { propertyPlaceholder };
