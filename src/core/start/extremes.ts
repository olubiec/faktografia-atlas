// „Odkrycie dnia” jako talia ciekawostek: dwa bieguny jednego wskaźnika (najmniej i najwięcej w Polsce) obok siebie.
// Dane wyłącznie z facts-start.json (lista `daily`); pary składamy po stronie strony, bez zmiany formatu pliku.
import { decodeFact } from '../facts/codec';
import type { DailyEntry, FactsStart } from '../facts/start';
import type { Fact, Level } from '../facts/types';
import { formatValue, getFractionDigits } from '../format/number';
import { plNumber, shortIndicatorName } from '../seo/sentences';
import { bigNumber, dailyEntry, factHref, factView, levelOf, resolveIndicator, type FactView } from './discoveries';

/** Jeden biegun: miejsce, liczba z jednostką i link do mapy z tym miejscem zaznaczonym. */
export interface PoleView {
  teryt: string;
  name: string;
  /** „Najmniej” albo „Najwięcej”. */
  label: string;
  number: string;
  unit: string;
  href: string;
}

export interface ExtremesView {
  /** Nazwa wskaźnika, np. „Mediana wieku”. */
  title: string;
  /** „Skrajne wartości wśród 2 473 gmin w Polsce, 2026” – zawsze z liczbą porównanych i rokiem (albo latami średniej). */
  scope: string;
  low: PoleView;
  high: PoleView;
  /** „Różnica między skrajnościami: 10 lat.” albo „Najwyższa wartość jest 1 657 razy większa od najniższej.” */
  contrast: string | null;
}

export interface DiscoveryView {
  key: string;
  /** Miejsce faktu (nagłówek karty pojedynczej). */
  place: string;
  /** Fakt dnia – jego link prowadzi „Zobacz na mapie”. */
  fact: FactView;
  /** Para skrajności, gdy w talii jest drugi biegun tego samego wskaźnika; inaczej karta pojedyncza. */
  extremes: ExtremesView | null;
}

/** Jednostki poziomu w dopełniaczu liczby mnogiej („wśród 380 powiatów”). */
const PEERS: Record<Level, string> = { gmi: 'gmin', pow: 'powiatów', woj: 'województw' };

/** Wskaźniki, dla których „X razy więcej” ma sens (liczby i kwoty, nie udziały ani lata). */
const RATIO_UNITS = new Set(['osoba', 'zł', 'm²', 'os./km²', 'na 1000', 'na 10 tys.']);

/** Krajowe 1. miejsce w wartości (F1), bez remisu – tylko takie fakty składamy w pary. */
function isNationalExtreme(f: Fact): f is Fact & { compare: { kind: 'rank'; dir: 1 | -1; total: number } } {
  return f.type === 'F1' && f.compare.kind === 'rank' && f.compare.rank === 1 && !f.compare.tie;
}

const dirOf = (f: Fact): number => (f.compare.kind === 'rank' ? f.compare.dir : 0);

/** Zdanie o rozpiętości: iloraz, gdy wartości są dodatnie i różnią się co najmniej 3 razy, inaczej różnica. */
export function contrastSentence(low: number, high: number, unit: string): string | null {
  if (RATIO_UNITS.has(unit) && low > 0) {
    const ratio = Math.round(high / low);
    // Liczby całkowite ≥ 3 zawsze z „razy” (bez „2,5 raza”).
    if (ratio >= 3) return `Najwyższa wartość jest ${plNumber(ratio)} razy większa od najniższej.`;
  }
  const diff = high - low;
  if (!(diff > 0)) return null;
  const shown = unit === '%' ? `${formatValue(diff, null, getFractionDigits(unit))} pkt proc.` : formatValue(diff, unit);
  // „pkt proc.” kończy się kropką – bez drugiej.
  return `Różnica między skrajnościami: ${shown}${shown.endsWith('.') ? '' : '.'}`;
}

function pole(entry: DailyEntry, fact: Fact, unit: string): PoleView {
  return {
    teryt: entry.u,
    name: entry.n,
    label: dirOf(fact) === 1 ? 'Najwięcej' : 'Najmniej',
    ...bigNumber(fact.value, unit),
    href: factHref(fact),
  };
}

/** Para skrajności z dwóch wpisów (kolejność dowolna); null, gdy wskaźnik nieznany. */
export function extremesView(a: { entry: DailyEntry; fact: Fact }, b: { entry: DailyEntry; fact: Fact }): ExtremesView | null {
  const ind = resolveIndicator(a.fact.indicatorId);
  if (!ind || !isNationalExtreme(a.fact)) return null;
  const [lo, hi] = dirOf(a.fact) === -1 ? [a, b] : [b, a];
  const level = levelOf(a.entry.u);
  // Fakty małych gmin bywają średnią z kilku lat (span) – wtedy podpis mówi o latach, nie o jednym roku.
  const span = Math.max(a.fact.span ?? 1, b.fact.span ?? 1);
  const when = span > 1 ? `średnio w latach ${a.fact.year - span + 1}–${a.fact.year}` : String(a.fact.year);
  return {
    title: shortIndicatorName(ind.name, ind.unit),
    scope: `Skrajne wartości wśród ${plNumber(a.fact.compare.total)} ${PEERS[level]} w Polsce, ${when}`,
    low: pole(lo.entry, lo.fact, ind.unit),
    high: pole(hi.entry, hi.fact, ind.unit),
    contrast: contrastSentence(lo.fact.value, hi.fact.value, ind.unit),
  };
}

/**
 * Talia ciekawostek od dzisiejszej: pierwsza pozycja to Odkrycie dnia (ta sama dla wszystkich danego dnia),
 * kolejne idą w kolejności pliku. Drugi biegun tego samego wskaźnika dołącza do karty i nie powtarza się osobno.
 */
export function discoveryDeck(start: FactsStart, date: Date): DiscoveryView[] {
  const today = dailyEntry(start, date);
  if (!today) return [];
  const n = start.daily.length;
  const first = start.daily.indexOf(today);
  const decoded = start.daily.map((entry) => ({ entry, fact: decodeFact(entry.u, entry.f) as Fact }));
  const used = new Set<number>();
  const out: DiscoveryView[] = [];
  for (let k = 0; k < n; k++) {
    const i = (first + k) % n;
    if (used.has(i)) continue;
    used.add(i);
    const cur = decoded[i];
    const fact = factView(cur.fact);
    if (!fact) continue;
    let extremes: ExtremesView | null = null;
    if (isNationalExtreme(cur.fact)) {
      const j = decoded.findIndex(
        (d, idx) =>
          !used.has(idx) &&
          isNationalExtreme(d.fact) &&
          d.fact.indicatorId === cur.fact.indicatorId &&
          d.fact.year === cur.fact.year &&
          levelOf(d.entry.u) === levelOf(cur.entry.u) &&
          dirOf(d.fact) === -dirOf(cur.fact),
      );
      if (j >= 0) {
        extremes = extremesView(cur, decoded[j]);
        if (extremes) used.add(j);
      }
    }
    out.push({ key: fact.key, place: cur.entry.n, fact, extremes });
  }
  return out;
}
