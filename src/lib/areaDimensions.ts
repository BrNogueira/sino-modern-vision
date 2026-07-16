// Campo `area_dimensions` legado às vezes traz um blob HTML descritivo
// (ex.: "<p><strong>&Aacute;rea do terreno: 398,94m&sup2; (12x33,24)...")
// em vez da dimensão curta ("12x33,24"). Normaliza para exibição.
const NXM = /(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)/i;

export function displayDimensions(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const hasMarkup = /<[^>]+>|&[a-z]+\d*;|&#\d+;/i.test(trimmed);
  if (!hasMarkup && trimmed.length <= 30) return trimmed;

  const text = trimmed.replace(/<[^>]+>/g, " ");
  const m = NXM.exec(text);
  return m ? `${m[1]}x${m[2]}` : undefined;
}
