// Tematy i zestawienia (W26-F04, docs/KONCEPT-ODKRYCIA.md §7a–§7b): adresy, grupy wskaźników, wspólne pomocnicze.
// Temat = grupa z config/indicators.json (Ludność, Praca, Pieniądze, Mieszkania, Środowisko, Życie, Transport).
import { formatValue } from '../format/number';
import { plNumber } from './sentences';
import { slugify } from './slug';

export const TOPIC_ROOT = '/temat';
export const LIST_ROOT = '/zestawienie';
/** Spis tematów i zestawień. */
export const DISCOVER_INDEX = '/zestawienia';
export const DISCOVER_INDEX_NAME = 'Tematy i zestawienia';

/** Wskaźnik z config/indicators.json (pola potrzebne tematom i zestawieniom). */
export interface TopicIndicator {
  id: string;
  name: string;
  unit: string;
  group: string;
  higherIsBetter: boolean | null;
}

export interface Topic {
  /** Nazwa grupy, np. „Mieszkania”. */
  name: string;
  slug: string;
  path: string;
  indicators: TopicIndicator[];
}

export const topicPath = (group: string) => `${TOPIC_ROOT}/${slugify(group)}`;
export const listPath = (slug: string) => `${LIST_ROOT}/${slug}`;

/** Tematy w kolejności pierwszego wystąpienia grupy w config/indicators.json. */
export function topicsOf(indicators: readonly TopicIndicator[]): Topic[] {
  const out: Topic[] = [];
  for (const ind of indicators) {
    let topic = out.find((t) => t.name === ind.group);
    if (!topic) {
      topic = { name: ind.group, slug: slugify(ind.group), path: topicPath(ind.group), indicators: [] };
      out.push(topic);
    }
    topic.indicators.push(ind);
  }
  return out;
}

/** Odmiana po liczbie: 1 wskaźnik, 2 wskaźniki, 5 wskaźników, 22 wskaźniki. */
export function plural(n: number, one: string, few: string, many: string): string {
  const word = n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
  return `${plNumber(n)} ${word}`;
}

/** Zmiana do tabeli: „+25,3%” (liczby), „−1,2 pkt proc.” (%), „+3,4 na 1000” (inne wskaźniki). */
export function showChange(change: number, unit: string, relative: boolean): string {
  const sign = (d: number) => (d > 0 ? '+' : d < 0 ? '−' : '');
  if (relative) {
    const pct = Math.round(change * 1000) / 10;
    return `${sign(pct)}${plNumber(Math.abs(pct), 1)}%`;
  }
  const shown = unit === '%' ? `${plNumber(Math.abs(change), 1)} pkt proc.` : formatValue(Math.abs(change), unit);
  return `${sign(change)}${shown}`;
}

/** Pierwszy wariant tekstu, który mieści się w limicie (inaczej ostatni). */
export const fitText = (options: readonly string[], max: number) => options.find((o) => o.length <= max) ?? options[options.length - 1]!;
