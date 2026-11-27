// Zwarty zapis faktu w plikach public/data/facts/<WW>.json (krotka zamiast obiektu – mniejszy plik).
// [typ, wskaźnik, rok, wartość, siła, …porównanie, span?] – porównanie zależy od typu:
//   F1/F2: kierunek, miejsce, z ilu, remis(0/1) · F4: kierunek, miejsce, z ilu, rok początku, wartość początku
//   F3: kierunek, ilu sąsiadów, minimum, maksimum, pierścień poszerzony(0/1)
//   F5: kierunek, mediana, rok początku serii · F9: mediana, percentyl
// Opcjonalny ostatni element (W28-D06): 1 = fakt z najnowszego roku świeżego wskaźnika („Nowość”). Stare pliki go nie mają;
// gdy flaga jest, a span nie, w miejscu span stoi 0. Zapis: [..., porównanie, span|0, 1].
// Bliźniak (F8) to osobny rekord: ['F8', TERYT bliźniaka, rok, ile wskaźników, odległość].
import { valenceOf } from './valence';
import { FRAME_BY_TYPE, type DistEntry, type Direction, type Fact, type FactCompare, type FactType, type PercentileShard, type TwinFact } from './types';

export type EncodedFact = (string | number)[];

/** Fakt z opcjonalną flagą nowości. */
export type FlaggedFact = Fact & { isNew?: boolean };

const round2 = (n: number) => Math.round(n * 100) / 100;

const COMPARE_LENGTH: Record<FactType, number> = { F1: 4, F2: 4, F3: 5, F4: 5, F5: 3, F9: 2 };

function encodeCompare(c: FactCompare): number[] {
  switch (c.kind) {
    case 'rank':
      return [c.dir, c.rank, c.total, c.tie ? 1 : 0];
    case 'change':
      return [c.dir, c.rank, c.total, c.fromYear, round2(c.fromValue)];
    case 'neighbours':
      return [c.dir, c.count, round2(c.min), round2(c.max), c.extended ? 1 : 0];
    case 'record':
      return [c.dir, round2(c.median), c.sinceYear];
    case 'typical':
      return [round2(c.median), c.percentile];
  }
}

function decodeCompare(type: FactType, x: number[]): FactCompare {
  if (type === 'F1' || type === 'F2') return { kind: 'rank', dir: x[0] as Direction, rank: x[1], total: x[2], tie: x[3] === 1 };
  if (type === 'F3') return { kind: 'neighbours', dir: x[0] as Direction, count: x[1], min: x[2], max: x[3], extended: x[4] === 1 };
  if (type === 'F4') return { kind: 'change', dir: x[0] as Direction, rank: x[1], total: x[2], fromYear: x[3], fromValue: x[4] };
  if (type === 'F5') return { kind: 'record', dir: x[0] as Direction, median: x[1], sinceYear: x[2] };
  return { kind: 'typical', median: x[0], percentile: x[1] };
}

export function encodeFact(f: FlaggedFact): EncodedFact {
  const out: EncodedFact = [f.type, f.indicatorId, f.year, round2(f.value), f.strength, ...encodeCompare(f.compare)];
  const span = f.span && f.span > 1 ? f.span : 0;
  if (span || f.isNew) out.push(span);
  if (f.isNew) out.push(1);
  return out;
}

export function decodeFact(teryt: string, e: readonly (string | number)[]): FlaggedFact {
  const type = e[0] as FactType;
  const n = COMPARE_LENGTH[type];
  const compareRaw = e.slice(5, 5 + n) as number[];
  const span = e[5 + n] as number | undefined;
  const isNew = e[6 + n] === 1;
  return {
    type,
    teryt,
    indicatorId: String(e[1]),
    year: Number(e[2]),
    value: Number(e[3]),
    strength: Number(e[4]),
    frame: FRAME_BY_TYPE[type],
    compare: decodeCompare(type, compareRaw),
    ...(span ? { span } : {}),
    ...(isNew ? { isNew: true } : {}),
  };
}

export type EncodedTwin = [string, string, number, number, number];

export const encodeTwin = (t: TwinFact): EncodedTwin => ['F8', t.twin, t.year, t.dims, round2(t.distance)];

export function decodeTwin(teryt: string, e: readonly (string | number)[]): TwinFact {
  return { type: 'F8', teryt, twin: String(e[1]), year: Number(e[2]), dims: Number(e[3]), distance: Number(e[4]) };
}

// ── W31-O01: percentyl kraju, stosunek do mediany i histogram rozkładu (gminy) ──

/** Dwie cyfry znaczące (zwarty zapis stosunku). */
/** Stosunek do mediany zapisujemy tylko poza przedziałem (0,5; 2) – reszta to „typowa gmina” (zapis zwarty). */
const RATIO_LOW = 0.5;
const RATIO_HIGH = 2;
const RATIO_KEEP = 2;
const VALUE_KEEP = 3;
const PCT_BASE = 0x100;
const sig2 = (n: number) => Number(n.toPrecision(2));

/** Percentyl 0–100 (100 = najwyższa wartość); remisy dostają środek swojego przedziału. */
export function percentileOf(sorted: readonly number[], v: number): number {
  const n = sorted.length;
  if (n < 2) return 50;
  let lo = 0;
  while (lo < n && sorted[lo] < v) lo++;
  let hi = lo;
  while (hi < n && sorted[hi] === v) hi++;
  return Math.round(((lo + hi - 1) / 2 / (n - 1)) * 100);
}

export function medianOf(sorted: readonly number[]): number {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

/** Wartość kwantyla z posortowanej listy (interpolacja liniowa). */
function quantile(sorted: readonly number[], q: number): number {
  const pos = q * (sorted.length - 1);
  const i = Math.floor(pos);
  return sorted[i] + (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (pos - i);
}

export interface PercentileInput {
  /** Wskaźniki gminne i ich serie (wartości po TERYT, ostatnie nie-null = najnowszy rok). */
  values: Record<string, { years: number[]; values: Record<string, (number | null)[]> }>;
  /** TERYT-y gmin. */
  gminas: readonly string[];
  zeroGuard: boolean;
  bins: number;
  minUnits: number;
}

export interface PercentileResult {
  shards: Record<string, PercentileShard>;
  dist: Record<string, DistEntry>;
}

/** Najnowszy rok, w którym wartość ma co najmniej minUnits gmin. */
function latestYearIndex(s: PercentileInput['values'][string], gminas: readonly string[], minUnits: number): number {
  for (let i = s.years.length - 1; i >= 0; i--) {
    let c = 0;
    for (const t of gminas) if (typeof s.values[t]?.[i] === 'number') c++;
    if (c >= minUnits) return i;
  }
  return -1;
}

export function buildPercentiles(inp: PercentileInput): PercentileResult {
  const shards: Record<string, PercentileShard> = {};
  const dist: Record<string, DistEntry> = {};
  const ids = Object.keys(inp.values).sort();
  const used: { id: string; year: number; sorted: number[]; median: number; at: Record<string, number> }[] = [];
  for (const id of ids) {
    const s = inp.values[id];
    const yi = latestYearIndex(s, inp.gminas, inp.minUnits);
    if (yi < 0) continue;
    const at: Record<string, number> = {};
    for (const t of inp.gminas) {
      const v = s.values[t]?.[yi];
      if (typeof v === 'number' && Number.isFinite(v)) at[t] = v;
    }
    const sorted = Object.values(at).sort((a, b) => a - b);
    const median = medianOf(sorted);
    used.push({ id, year: s.years[yi], sorted, median, at });
    const lo = quantile(sorted, 0.01);
    const hi = quantile(sorted, 0.99);
    const b = new Array<number>(inp.bins).fill(0);
    for (const v of sorted) {
      const k = hi > lo ? Math.floor(((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * inp.bins) : 0;
      b[Math.min(k, inp.bins - 1)]++;
    }
    dist[id] = { m: round2(median), lo: round2(lo), hi: round2(hi), b };
  }
  const ind = used.map((u) => u.id);
  const y = used.map((u) => u.year);
  for (const t of inp.gminas) {
    const woj = t.slice(0, 2);
    shards[woj] ??= { ind, y, u: {} };
    let chars = '';
    const cand: [number, number][] = [];
    used.forEach((u, i) => {
      const v = u.at[t];
      if (v === undefined) {
        chars += ' ';
        return;
      }
      chars += String.fromCharCode(PCT_BASE + percentileOf(u.sorted, v));
      const guarded = inp.zeroGuard && (u.median === 0 || v === 0);
      const ratio = v / u.median;
      if (!guarded && (ratio >= RATIO_HIGH || ratio <= RATIO_LOW)) cand.push([i, sig2(ratio)]);
    });
    shards[woj].u[t] = chars;
    // Tylko dwa najdalsze od mediany (to one wybiera „Najbardziej nietypowe”).
    cand.sort((a, b) => Math.abs(Math.log(b[1])) - Math.abs(Math.log(a[1])));
    const rr = cand.slice(0, RATIO_KEEP).flat();
    // Wartości kandydatów do kart: 3 najlepsze i 3 najgorsze percentyle wśród wskaźników z kierunkiem + wskaźniki ze stosunkiem.
    const dirs = used
      .map((u, i) => ({ i, p: percentileOf(u.sorted, u.at[t]), ok: u.at[t] !== undefined && valenceOf(u.id) !== null }))
      .filter((x) => x.ok)
      .map((x) => ({ i: x.i, p: valenceOf(used[x.i].id) === 'up' ? x.p : 100 - x.p }))
      .sort((a, b) => a.p - b.p);
    const keep = new Set<number>([...dirs.slice(0, VALUE_KEEP), ...dirs.slice(-VALUE_KEEP)].map((x) => x.i));
    for (let k = 0; k < rr.length; k += 2) keep.add(rr[k]);
    const vv: number[] = [];
    for (const i of [...keep].sort((a, b) => a - b)) vv.push(i, round2(used[i].at[t]));
    if (vv.length) (shards[woj].v ??= {})[t] = vv;
    if (rr.length) (shards[woj].r ??= {})[t] = rr;
  }
  return { shards, dist };
}

export interface UnitPercentile {
  indicatorId: string;
  year: number;
  percentile: number;
  /** Stosunek do mediany kraju; null, gdy gmina jest typowa (0,5–2) albo zadziałał zeroGuard. */
  ratio: number | null;
  /** Wartość wskaźnika – tylko dla kandydatów do kart (3 najlepsze, 3 najgorsze, najbardziej nietypowe); inaczej null. */
  value: number | null;
}

/** Odczyt percentyli jednostki z pliku województwa; stary plik bez `pct` daje pustą listę. */
export function decodePercentiles(pct: PercentileShard | undefined, teryt: string): UnitPercentile[] {
  const row = pct?.u[teryt];
  if (!pct || !row) return [];
  const ratios = new Map<number, number>();
  const rr = pct.r?.[teryt] ?? [];
  for (let k = 0; k + 1 < rr.length; k += 2) ratios.set(rr[k], rr[k + 1]);
  const vals = new Map<number, number>();
  const vv = pct.v?.[teryt] ?? [];
  for (let k = 0; k + 1 < vv.length; k += 2) vals.set(vv[k], vv[k + 1]);
  const out: UnitPercentile[] = [];
  pct.ind.forEach((indicatorId, i) => {
    const code = row.charCodeAt(i);
    if (code >= PCT_BASE) out.push({ indicatorId, year: pct.y[i], percentile: code - PCT_BASE, ratio: ratios.get(i) ?? null, value: vals.get(i) ?? null });
  });
  return out;
}
