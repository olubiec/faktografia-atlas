import { formatValue } from '../format/number';

/**
 * Stałe szablony zdań na stronach miejsc (decyzja D8 w docs/SEO.md): tylko liczby z danych, zero tekstu z AI.
 * Funkcje zwracają `null`, gdy brakuje danych – wtedy zdanie jest pomijane.
 */

const n = (v: number | null | undefined, unit?: string | null) => formatValue(v, unit ?? undefined);
const ok = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

/** Zmiana względna w procentach (np. „wzrosła o 5,2%”); null, gdy nie da się policzyć. */
export function percentChange(from: number | null | undefined, to: number | null | undefined): number | null {
  if (!ok(from) || !ok(to) || from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

export function populationSentence(label: string, population: number | null, year: number | null): string | null {
  if (!ok(population) || year === null) return null;
  return `${label} liczy ${n(population)} mieszkańców (${year}).`;
}

export function populationChangeSentence(
  from: number | null,
  to: number | null,
  yearFrom: number,
  yearTo: number,
): string | null {
  const pct = percentChange(from, to);
  if (pct === null || !ok(from) || !ok(to)) return null;
  const verb = pct > 0 ? 'wzrosła' : pct < 0 ? 'spadła' : 'nie zmieniła się';
  if (pct === 0) return `Od ${yearFrom} do ${yearTo} roku liczba ludności nie zmieniła się (${n(to)} osób).`;
  return `Od ${yearFrom} do ${yearTo} roku liczba ludności ${verb} o ${n(Math.abs(pct), '%')} (z ${n(from)} do ${n(to)}).`;
}

export function populationRankSentence(
  rank: number | null,
  total: number | null,
  scope: string,
  year: number | null,
): string | null {
  if (!ok(rank) || !ok(total) || total < 2 || year === null) return null;
  return `Pod względem liczby ludności zajmuje ${rank}. miejsce spośród ${total} ${scope} (${year}).`;
}

export function extremeSentence(
  kind: 'highest' | 'lowest',
  indicatorName: string,
  value: number | null,
  unit: string,
  rank: number | null,
  total: number | null,
  year: number | null,
): string | null {
  if (!ok(value) || !ok(rank) || !ok(total) || year === null) return null;
  const lead = kind === 'highest' ? 'Najwyżej w Polsce wypada we wskaźniku' : 'Najniżej w Polsce wypada we wskaźniku';
  return `${lead} „${indicatorName}”: ${n(value, unit)}, czyli ${rank}. miejsce z ${total} (${year}).`;
}
