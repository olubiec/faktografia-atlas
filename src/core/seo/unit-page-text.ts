import { formatValue } from '../format/number';
import { percentChange } from './sentences';
import type { IndicatorMeta, ProfileEntry } from './unit-page';

const TITLE_MAX = 65;

/** Zmiana po `back` latach: procent (lub punkty procentowe dla wskaźników w %); null, gdy brak danych w serii. */
export function change(e: ProfileEntry, back: number, unit: string): string | null {
  const to = e.value;
  const from = e.series[e.series.length - 1 - back];
  if (to === null || from === null || from === undefined) return null;
  if (unit === '%') {
    const d = to - from;
    return `${d > 0 ? '+' : d < 0 ? '−' : ''}${formatValue(Math.abs(d), undefined, 1)} p.p.`;
  }
  // Wskaźniki, które mogą być ujemne lub bliskie zera (np. przyrost naturalny): różnica bezwzględna, nie procent.
  if (from <= 0 || to < 0) {
    const d = to - from;
    return `${d > 0 ? '+' : d < 0 ? '−' : ''}${formatValue(Math.abs(d), undefined, 1)}`;
  }
  const pct = percentChange(from, to);
  if (pct === null) return null;
  return `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${formatValue(Math.abs(pct), undefined, 1)}%`;
}

export function titleAndDescription(label: string, qualifier: string, year: number, byId: Map<string, ProfileEntry>, metas: Map<string, IndicatorMeta>) {
  const withQ = qualifier ? `${label} (${qualifier})` : label;
  const candidates = [
    `${withQ} – ludność, bezrobocie, dochody (${year})`,
    `${withQ} – ludność, dochody (${year})`,
    `${withQ} – dane GUS (${year})`,
  ];
  const title = candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[2]!.slice(0, TITLE_MAX);
  const bits: string[] = [];
  const pop = byId.get('population');
  const piece = (id: string, text: string) => {
    const e = byId.get(id);
    return e && e.value !== null ? `${text} ${formatValue(e.value, metas.get(id)?.unit)}` : null;
  };
  const extras = [piece('unemployment-rate', 'bezrobocie'), piece('forest-cover', 'lesistość'), piece('income-per-capita', 'dochody na mieszkańca')]
    .filter((x): x is string => x !== null)
    .slice(0, 2);
  bits.push(`ludność ${formatValue(pop?.value ?? null)} (${year})`, ...extras);
  const tails = [
    '. Dane GUS, miejsce w kraju i zmiana w ciągu 10 lat na mapie Faktografii.',
    '. Dane GUS i miejsce w rankingach na mapie Faktografii.',
    '. Dane GUS na mapie Faktografii.',
  ];
  const head = `${withQ}: ${bits.join(', ')}`;
  const tail = tails.find((t) => (head + t).length <= 160) ?? '.';
  return { title, description: head + tail };
}
