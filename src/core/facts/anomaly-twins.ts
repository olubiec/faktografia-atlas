// „Najbardziej podobna gmina” z całej biblioteki GUS: te same wskaźniki co panel anomalii (anomaly-sources.ts), a nie ~10 ręcznie wybranych.
// Każda gmina to wektor percentyli (0–1) we wszystkich wskaźnikach; bliźniak = najbliższa gmina z innego województwa.
import config from '../../../config/anomalies.json';
import { isCityCounty } from '../units/label';
import type { AnomalySource } from './anomaly-sources';
import type { TwinFact } from './types';

export interface TwinInput {
  sources: readonly AnomalySource[];
  gminas: readonly string[];
  /** Ludność gmin: dodatkowy wymiar, żeby bliźniak miał podobną wielkość. */
  population: Readonly<Record<string, number>>;
  /** Minimum gmin z wartością, żeby wskaźnik wszedł do wektora (domyślnie jak w anomaliach). */
  minUnits?: number;
}

interface Column {
  year: number;
  /** Percentyl 0–1 dla każdej gminy (indeks jak w `gminas`), NaN = brak wartości. */
  pct: Float32Array;
}

/** Percentyle (średnia ranga przy remisach) wartości dostępnych dla gmin; null, gdy za mało wartości. */
function rankColumn(values: readonly (number | null | undefined)[], minCount: number): Float32Array | null {
  const idx: number[] = [];
  values.forEach((v, i) => {
    if (typeof v === 'number' && Number.isFinite(v)) idx.push(i);
  });
  if (idx.length < minCount) return null;
  idx.sort((a, b) => (values[a] as number) - (values[b] as number));
  const out = new Float32Array(values.length).fill(NaN);
  const last = idx.length - 1;
  for (let s = 0; s < idx.length; ) {
    let e = s;
    while (e + 1 < idx.length && values[idx[e + 1]] === values[idx[s]]) e++;
    for (let k = s; k <= e; k++) out[idx[k]] = (s + e) / 2 / last;
    s = e + 1;
  }
  return out;
}

function columnsOf(inp: TwinInput): Column[] {
  const { minYear } = config;
  const minUnits = inp.minUnits ?? config.minUnits;
  const out: Column[] = [];
  for (const src of inp.sources) {
    for (let i = src.years.length - 1; i >= 0; i--) {
      if (src.years[i] < minYear) break;
      const pct = rankColumn(inp.gminas.map((t) => src.values[t]?.[i]), minUnits);
      if (pct) {
        out.push({ year: src.years[i], pct });
        break;
      }
    }
  }
  const pop = rankColumn(inp.gminas.map((t) => inp.population[t]), 1);
  if (pop) out.push({ year: 0, pct: pop });
  return out;
}

const mostCommon = (years: readonly number[]) => {
  const count = new Map<number, number>();
  for (const y of years) if (y > 0) count.set(y, (count.get(y) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;
};

/** Bliźniaki gmin (poza miastami na prawach powiatu): najbliższa gmina z innego województwa w przestrzeni percentyli. */
export function findLibraryTwins(inp: TwinInput): Map<string, TwinFact> {
  const cols = columnsOf(inp);
  const out = new Map<string, TwinFact>();
  if (!cols.length) return out;
  const year = mostCommon(cols.map((c) => c.year));
  const n = inp.gminas.length;
  const dims = cols.length;
  const flat = new Float32Array(n * dims);
  cols.forEach((c, j) => {
    for (let i = 0; i < n; i++) flat[i * dims + j] = c.pct[i];
  });
  const rows: number[] = [];
  inp.gminas.forEach((t, i) => {
    if (isCityCounty(t)) return;
    let have = 0;
    for (let j = 0; j < dims; j++) if (!Number.isNaN(flat[i * dims + j])) have++;
    if (have >= Math.max(config.twin.minDims, Math.ceil(dims * config.twin.minShare))) rows.push(i);
  });
  const need = Math.max(config.twin.minDims, Math.ceil(dims * config.twin.minShare));
  for (const i of rows) {
    const woj = inp.gminas[i].slice(0, 2);
    let best = -1;
    let bestD = Infinity;
    let bestN = 0;
    for (const k of rows) {
      if (inp.gminas[k].slice(0, 2) === woj) continue;
      let sum = 0;
      let used = 0;
      for (let j = 0; j < dims; j++) {
        const d = flat[i * dims + j] - flat[k * dims + j];
        if (d === d) {
          sum += d * d;
          used++;
        }
      }
      if (used < need) continue;
      const dist = Math.sqrt(sum / used);
      if (dist < bestD || (dist === bestD && inp.gminas[k] < inp.gminas[best])) {
        best = k;
        bestD = dist;
        bestN = used;
      }
    }
    if (best >= 0) {
      const t = inp.gminas[i];
      out.set(t, { type: 'F8', teryt: t, twin: inp.gminas[best], year, dims: bestN, distance: Math.round(bestD * 100) / 100 });
    }
  }
  return out;
}
