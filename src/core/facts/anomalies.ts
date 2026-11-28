// Anomalie gmin z całej biblioteki GUS: dla każdej gminy zostają te wskaźniki, w których najmocniej odstaje od kraju.
// Czysta logika (robot: scripts/data/build-facts.mjs). Zapis: patrz AnomalyShard w anomaly-types.ts.
import config from '../../../config/anomalies.json';
import type { AnomalyMeta, AnomalyShard } from './anomaly-types';
import type { DistEntry } from './percentile-types';
import { medianOf, percentileOf, quantile } from './percentiles';
import { valenceFromName, type AnomalySource } from './anomaly-sources';

const round = (n: number) => Number(n.toPrecision(4));
const sig2 = (n: number) => Number(n.toPrecision(2));

export interface AnomalyInput {
  sources: readonly AnomalySource[];
  gminas: readonly string[];
  /** Ludność gmin (do wyboru sąsiada o podobnej wielkości). */
  population: Readonly<Record<string, number>>;
  /** Sąsiedzi (wspólna granica) po TERYT, także z innych województw. */
  neighbours: Readonly<Record<string, readonly string[]>>;
}

interface Prepared {
  src: AnomalySource;
  year: number;
  at: Map<string, number>;
  sorted: number[];
  median: number;
  dist: DistEntry;
  valence: 'u' | 'd' | '';
  /** Zmiana w oknie: [wartość z początku, wartość teraz, rok początku] i percentyl zmiany. */
  change: Map<string, [number, number, number]>;
  changeSorted: number[];
}

function prepare(src: AnomalySource, gminas: readonly string[]): Prepared | null {
  const { minUnits, minYear, bins, changeYears } = config;
  let yi = -1;
  for (let i = src.years.length - 1; i >= 0 && yi < 0; i--) {
    let c = 0;
    for (const t of gminas) if (typeof src.values[t]?.[i] === 'number') c++;
    if (c >= minUnits) yi = i;
  }
  if (yi < 0 || src.years[yi] < minYear) return null;
  const at = new Map<string, number>();
  for (const t of gminas) {
    const v = src.values[t]?.[yi];
    if (typeof v === 'number' && Number.isFinite(v)) at.set(t, v);
  }
  const sorted = [...at.values()].sort((a, b) => a - b);
  const lo = quantile(sorted, 0.01);
  const hi = quantile(sorted, 0.99);
  const b = new Array<number>(bins).fill(0);
  for (const v of sorted) {
    const k = hi > lo ? Math.floor(((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * bins) : 0;
    b[Math.min(k, bins - 1)]++;
  }
  const median = medianOf(sorted);
  const fi = src.years.indexOf(src.years[yi] - changeYears);
  const change = new Map<string, [number, number, number]>();
  if (fi >= 0) {
    for (const t of at.keys()) {
      const a = src.values[t]?.[fi];
      if (typeof a === 'number' && Number.isFinite(a)) change.set(t, [a, at.get(t) as number, src.years[fi]]);
    }
  }
  const changeSorted = [...change.values()].map(([a, c]) => c - a).sort((x, y) => x - y);
  const v = valenceFromName(src.id, src.name);
  return { src, year: src.years[yi], at, sorted, median, dist: { m: round(median), lo: round(lo), hi: round(hi), b }, valence: v === 'up' ? 'u' : v === 'down' ? 'd' : '', change, changeSorted };
}

interface Entry {
  p: Prepared;
  value: number;
  pct: number;
  ratio: number;
  /** Odległość percentyla od środka (0–50). */
  e: number;
}

/** Wpisy gminy; ratio = 0, gdy mediana lub wartość nie są dodatnie (stosunek byłby nieczytelny). */
function entriesOf(t: string, list: readonly Prepared[]): Entry[] {
  const out: Entry[] = [];
  for (const p of list) {
    const v = p.at.get(t);
    if (v === undefined) continue;
    const pct = percentileOf(p.sorted, v);
    const ratio = p.median > 0 && v > 0 ? v / p.median : 0;
    out.push({ p, value: v, pct, ratio, e: Math.abs(pct - 50) });
  }
  return out;
}

const logRatio = (x: Entry) => (x.ratio > 0 ? Math.abs(Math.log(x.ratio)) : 0);
const adjusted = (x: Entry) => (x.p.valence === 'd' ? 100 - x.pct : x.pct);

/** Wybiera wpisy gminy: najbardziej odstające (różne tematy), najdalsze od mediany, najlepsze i najgorsze z kierunkiem. */
export function selectEntries(all: readonly Entry[]): Entry[] {
  const { extreme, ratio, side, minExtremity } = config.pick;
  const ranked = [...all].sort((a, b) => b.e - a.e || logRatio(b) - logRatio(a) || a.p.src.id.localeCompare(b.p.src.id));
  const out: Entry[] = [];
  const topics = new Set<string>();
  for (const x of ranked) {
    if (out.length >= extreme || x.e < minExtremity) break;
    if (topics.has(x.p.src.topic)) continue;
    topics.add(x.p.src.topic);
    out.push(x);
  }
  const add = (x: Entry | undefined) => {
    if (x && !out.includes(x)) out.push(x);
  };
  [...all].filter((x) => x.ratio >= 2 || (x.ratio > 0 && x.ratio <= 0.5)).sort((a, b) => logRatio(b) - logRatio(a)).slice(0, ratio).forEach(add);
  const dir = [...all].filter((x) => x.p.valence !== '' && x.p.median > 0).sort((a, b) => adjusted(b) - adjusted(a));
  dir.slice(0, side).forEach(add);
  dir.slice(-side).forEach(add);
  return out;
}

export function buildAnomalies(inp: AnomalyInput): Record<string, AnomalyShard> {
  const list = inp.sources.map((s) => prepare(s, inp.gminas)).filter((p): p is Prepared => p !== null);
  const shards: Record<string, AnomalyShard> = {};
  const index = new Map<string, Map<string, number>>();
  const metaOf = (woj: string, p: Prepared): number => {
    const sh = (shards[woj] ??= { m: [], u: {}, c: {}, n: {} });
    const idx = (index.get(woj) ?? index.set(woj, new Map()).get(woj)) as Map<string, number>;
    let i = idx.get(p.src.id);
    if (i === undefined) {
      i = sh.m.length;
      const meta: AnomalyMeta = [p.src.id, p.src.name, p.src.unit, p.year, p.valence, p.src.derived ? 1 : 0, p.dist];
      sh.m.push(meta);
      idx.set(p.src.id, i);
    }
    return i;
  };
  const popOf = (t: string) => inp.population[t] ?? null;
  const known = new Set(inp.gminas);
  for (const t of inp.gminas) {
    const woj = t.slice(0, 2);
    const all = entriesOf(t, list);
    const picked = selectEntries(all);
    if (!picked.length) continue;
    const sh = (shards[woj] ??= { m: [], u: {}, c: {}, n: {} });
    sh.u[t] = picked.flatMap((x) => [metaOf(woj, x.p), round(x.value), x.pct, x.ratio ? sig2(x.ratio) : 0]);
    // Zmiany: percentyl różnicy wartości wśród gmin; największe odchylenia, różne tematy.
    const ch = list
      .map((p) => ({ p, c: p.change.get(t) }))
      .filter((x): x is { p: Prepared; c: [number, number, number] } => x.c !== undefined && (x.c[0] !== 0 || x.c[1] !== 0))
      .map((x) => ({ ...x, pct: percentileOf(x.p.changeSorted, x.c[1] - x.c[0]) }))
      .filter((x) => Math.abs(x.pct - 50) >= config.pick.minExtremity + 5)
      .sort((a, b) => Math.abs(b.pct - 50) - Math.abs(a.pct - 50) || a.p.src.id.localeCompare(b.p.src.id));
    const seen = new Set<string>();
    const changes = ch.filter((x) => !seen.has(x.p.src.topic) && seen.add(x.p.src.topic)).slice(0, config.pick.change);
    if (changes.length) sh.c[t] = changes.flatMap((x) => [metaOf(woj, x.p), round(x.c[0]), round(x.c[1]), x.c[2], x.pct]);
    // Sąsiad o najbliższej liczbie ludności i jego wartości w tych samych wskaźnikach.
    const mine = popOf(t);
    const near = [...(inp.neighbours[t] ?? [])].filter((x) => known.has(x)).sort((a, b) => {
      const d = (x: string) => (mine !== null && popOf(x) !== null ? Math.abs((popOf(x) as number) - mine) : Infinity);
      return d(a) - d(b) || a.localeCompare(b);
    })[0];
    if (near) {
      const row: (string | number)[] = [near];
      for (const x of picked.slice(0, config.pick.neighbour)) {
        const v = x.p.at.get(near);
        if (v !== undefined && v !== 0) row.push(metaOf(woj, x.p), round(v), percentileOf(x.p.sorted, v));
      }
      if (row.length > 1) sh.n[t] = row;
    }
  }
  return shards;
}
