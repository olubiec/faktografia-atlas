import { titleCase } from './tree';

const norm = (s: string) => s.toLocaleLowerCase('pl').replace(/ł/g, 'l').normalize('NFKD').replace(/[̀-ͯ]/g, '');
const stems = (s: string) =>
  norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 5));

const GENERIC = new Set([
  'ogolem', 'razem', 'mezczyzni', 'kobiety', 'miasta', 'wies', 'miasto', 'ogolem w', 'chlopcy', 'dziewczeta',
  'chłopcy', 'dziewczęta', 'tak', 'nie', 'pozostale', 'inne',
]);

/** Nazwa to sama cecha (płeć, „ogółem”, wiek, liczba) – bez podmiotu. */
function isBareQualifier(name: string): boolean {
  const first = norm(name.split(' – ')[0]).trim();
  return GENERIC.has(first) || /^\d/.test(first);
}

/**
 * Nazwa wskaźnika zrozumiała bez nagłówka: gdy sama nazwa z GUS to tylko cecha
 * („ogółem – 0”, „mężczyźni”), dopisuje przed nią temat (ostatni człon ścieżki).
 * Gdy nazwa już zawiera słowo z tematu – zostaje bez zmian.
 */
export function standaloneName(name: string, categoryPath?: string | null): string {
  const topicRaw = (categoryPath ?? '').split(' > ').map((p) => p.trim()).filter(Boolean).pop() ?? '';
  if (!topicRaw) return name;
  if (!isBareQualifier(name)) return name;
  const topicStems = stems(topicRaw);
  const own = new Set(stems(name));
  if (topicStems.length === 0 || topicStems.some((s) => own.has(s))) return name;
  const capital = name.charAt(0).toLocaleUpperCase('pl') + name.slice(1);
  return `${titleCase(topicRaw)} – ${capital.charAt(0).toLocaleLowerCase('pl') + capital.slice(1)}`;
}
