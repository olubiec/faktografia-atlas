// Dwa końce zestawienia na starcie (decyzja właściciela 26.11.2026): przełącznik „Najwyższe | Najniższe”, po 5 pozycji.
// Kolejność przełącznika stała; na start wybrany kierunek redakcyjny zestawienia (np. mediana wieku → najmłodsze).
import type { StartList } from '../facts/start';
import type { Level } from '../facts/types';
import type { ListLink } from './list-links';

export type EndKey = 'high' | 'low';
export const END_KEYS: readonly EndKey[] = ['high', 'low'];
export const END_LABELS: Record<EndKey, string> = { high: 'Najwyższe', low: 'Najniższe' };

export interface ListRow {
  teryt: string;
  name: string;
  value: string;
  href: string;
}

export interface ListEnd {
  subtitle: string;
  rows: ListRow[];
  /** Pełne zestawienie w tym kierunku (`/zestawienie/<slug>`), gdy strona istnieje. */
  full: ListLink | null;
}

export interface ListEnds {
  initial: EndKey;
  high: ListEnd;
  low: ListEnd;
}

/** Formy: 1 gmina · 2–4 gminy (bez 12–14) · 5 gmin. */
const PEERS: Record<Level, [string, string, string]> = {
  gmi: ['gmina', 'gminy', 'gmin'],
  pow: ['powiat', 'powiaty', 'powiatów'],
  woj: ['województwo', 'województwa', 'województw'],
};

export function peersWord(n: number, level: Level): string {
  const [one, few, many] = PEERS[level];
  if (n === 1) return one;
  const d = n % 10;
  const t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many;
}

/** „5 gmin z najwyższą wartością, 2025”. */
export function endSubtitle(n: number, level: Level, key: EndKey, year: number): string {
  return `${n} ${peersWord(n, level)} z ${key === 'high' ? 'najwyższą' : 'najniższą'} wartością, ${year}`;
}

export const endOf = (dir: number): EndKey => (dir === 1 ? 'high' : 'low');

/** Oba końce skali; null, gdy plik nie ma drugiego końca (starsze facts-start.json) – wtedy bez przełącznika. */
export function listEnds(
  list: StartList,
  row: (r: [string, string, number]) => ListRow,
  links: { full: ListLink | null; opposite: ListLink | null },
): ListEnds | null {
  if (!list.bottom?.length) return null;
  const main = endOf(list.dir);
  const other: EndKey = main === 'high' ? 'low' : 'high';
  const end = (key: EndKey, rows: [string, string, number][], full: ListLink | null): ListEnd => ({
    subtitle: endSubtitle(rows.length, list.level, key, list.year),
    rows: rows.map(row),
    // „Pełny ranking” otwiera się z tym samym końcem skali, który widać w panelu.
    full: full?.ranking ? { ...full, href: `${full.href}&d=${key}` } : full,
  });
  const a = end(main, list.top, links.full);
  const b = end(other, list.bottom, links.opposite);
  return main === 'high' ? { initial: main, high: a, low: b } : { initial: main, high: b, low: a };
}
