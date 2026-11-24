/** Jednostki z biblioteki GUS, które nic nie mówią („osoba”, „szt.”, „-”) – gdy nazwa podaje przeliczenie, nazwa wygrywa. */
const VAGUE = new Set(['', '-', '–', 'osoba', 'osób', 'szt.', 'szt', 'jedn.']);

const PER = /\bna\s+((?:\d+(?:\s\d{3})*|\d+)(?:\s?tys\.)?)\s+([\p{L}\d²]+(?:\s+(?!wg\b|w\b|ogółem\b|oraz\b|i\b)[\p{L}\d²]+){0,2}(?:\s+w\s+wieku\s+[^–,(]+?)?)(?=\s*(?:[–,(]|\swg\b|$))/iu;

/**
 * Jednostka zrozumiała dla człowieka: „czytelnicy na 1000 ludności” z jednostką „osoba” to
 * „na 1000 ludności”, a nie „osób”. Gdy jednostka z GUS jest rzeczowa (np. „zł”, „%”, „ha”), zostaje bez zmian.
 */
export function effectiveUnit(name: string, unit: string | null | undefined): string {
  const u = (unit ?? '').trim();
  if (!VAGUE.has(u.toLowerCase())) return u;
  const m = PER.exec(name);
  return m ? `na ${m[1]} ${m[2].trim()}` : u;
}
