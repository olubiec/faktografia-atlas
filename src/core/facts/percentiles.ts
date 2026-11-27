// W31-O01: percentyl kraju, stosunek do mediany i histogram rozkładu (gminy). Zapis: patrz PercentileShard w types.ts.
import { valenceOf } from './valence';
import type { DistEntry, PercentileShard } from './percentile-types';

const round2 = (n: number) => Math.round(n * 100) / 100;

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
  /** Okno zmiany w latach (domyślnie 10) i wskaźniki bez zmiany (np. gęstość). */
  changeYears?: number;
  changeExcluded?: readonly string[];
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
  // Zmiana w oknie (domyślnie 10 lat): względna, percentyl zmiany wśród gmin; do karty „Największa zmiana”.
  const win = inp.changeYears ?? 10;
  const change = used.map((u) => {
    const s = inp.values[u.id];
    const yi = s.years.indexOf(u.year);
    const fi = s.years.indexOf(u.year - win);
    const at: Record<string, { from: number; rel: number }> = {};
    if (fi < 0 || inp.changeExcluded?.includes(u.id)) return { at, sorted: [] as number[] };
    for (const t of inp.gminas) {
      const a = s.values[t]?.[fi];
      const b = s.values[t]?.[yi];
      if (typeof a === 'number' && typeof b === 'number' && a > 0) at[t] = { from: a, rel: b / a - 1 };
    }
    return { at, sorted: Object.values(at).map((x) => x.rel).sort((x, y) => x - y) };
  });
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
      const guarded = inp.zeroGuard && (u.median <= 0 || v <= 0);
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
    const pop = used.findIndex((u) => u.id === 'population');
    if (pop >= 0 && used[pop].at[t] !== undefined) keep.add(pop); // do doboru sąsiada o podobnej liczbie ludności
    const vv: number[] = [];
    for (const i of [...keep].sort((a, b) => a - b)) vv.push(i, round2(used[i].at[t]));
    if (vv.length) (shards[woj].v ??= {})[t] = vv;
    // Największe zmiany: po 4 liczby [indeks, wartość z początku okna, zmiana względna, percentyl zmiany], 3 najdalsze od środka, min. 10%.
    const ch: number[][] = [];
    change.forEach((c, i) => {
      const x = c.at[t];
      if (!x || c.sorted.length < inp.minUnits || Math.abs(x.rel) < 0.1 || valenceOf(used[i].id) === null) return;
      ch.push([i, round2(x.from), round2(x.rel), percentileOf(c.sorted, x.rel)]);
    });
    ch.sort((a, b) => Math.abs(b[3] - 50) - Math.abs(a[3] - 50));
    if (ch.length) (shards[woj].c ??= {})[t] = ch.slice(0, 3).flat();
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
