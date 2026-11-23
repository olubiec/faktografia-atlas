// F8 – bliźniak (KONCEPT-ODKRYCIA §3): najbliższa jednostka tego samego poziomu w innym województwie
// według wektora ~10 wskaźników standaryzowanych (z-score w poziomie, ludność i gęstość w skali log).
import { isCityCounty } from '../units/label';
import type { FactsContext } from './context';
import type { FactUnit, Level, TwinFact } from './types';

interface Profile {
  unit: FactUnit;
  /** Odchylenia standardowe; NaN = brak wartości. */
  z: number[];
}

/** Jednostki porównywane na poziomie: gminy bez miast na prawach powiatu (te porównuje się jako powiaty). */
const comparable = (u: FactUnit) => u.level !== 'gmi' || !isCityCounty(u.teryt);

function profilesFor(ctx: FactsContext, level: Level, ids: readonly string[], log: ReadonlySet<string>) {
  const units = ctx.byLevel[level].filter(comparable);
  const years: number[] = [];
  const columns: number[][] = [];
  for (const id of ids) {
    const ind = ctx.indicators.get(id);
    const idx = ctx.refYearIdx(id, level);
    if (!ind || idx < 0 || !units.length || !ctx.applies(ind, units[0])) continue;
    const raw = units.map((u) => {
      const v = ctx.series(u.teryt, id)?.values[idx];
      if (v == null) return NaN;
      return log.has(id) ? (v > 0 ? Math.log(v) : NaN) : v;
    });
    const ok = raw.filter((v) => Number.isFinite(v));
    if (ok.length < 2) continue;
    const mean = ok.reduce((a, b) => a + b, 0) / ok.length;
    const sd = Math.sqrt(ok.reduce((a, b) => a + (b - mean) ** 2, 0) / ok.length);
    if (sd === 0) continue;
    columns.push(raw.map((v) => (v - mean) / sd));
    years.push(ctx.input.values[id].years[idx]);
  }
  const profiles: Profile[] = units.map((unit, i) => ({ unit, z: columns.map((c) => c[i]) }));
  return { profiles, dims: columns.length, year: mostCommon(years) };
}

/** Najczęstszy rok odniesienia wskaźników (jeden wskaźnik „do przodu” nie zmienia roku całego porównania). */
function mostCommon(years: readonly number[]): number {
  const count = new Map<number, number>();
  for (const y of years) count.set(y, (count.get(y) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;
}

/** Odległość: pierwiastek ze średniej kwadratów różnic na wspólnych wskaźnikach; null, gdy wspólnych za mało. */
export function distance(a: readonly number[], b: readonly number[], minDims: number): { d: number; n: number } | null {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - b[i];
    if (Number.isFinite(x)) {
      sum += x * x;
      n++;
    }
  }
  return n >= minDims && n > 0 ? { d: Math.sqrt(sum / n), n } : null;
}

/** Bliźniaki wszystkich porównywalnych jednostek. Brak jednostki w wyniku = brak kandydata. */
export function findTwins(ctx: FactsContext): Map<string, TwinFact> {
  const out = new Map<string, TwinFact>();
  const cfg = ctx.input.config.twin;
  if (!cfg) return out;
  const log = new Set(cfg.log);
  for (const level of ['woj', 'pow', 'gmi'] as const) {
    const { profiles, dims, year } = profilesFor(ctx, level, cfg.indicators, log);
    const minDims = Math.max(1, Math.ceil(dims * cfg.minShare));
    for (const p of profiles) {
      const woj = p.unit.teryt.slice(0, 2);
      let best: { q: Profile; d: number; n: number } | null = null;
      for (const q of profiles) {
        if (q.unit.teryt.slice(0, 2) === woj) continue;
        const r = distance(p.z, q.z, minDims);
        if (!r) continue;
        if (!best || r.d < best.d || (r.d === best.d && q.unit.teryt < best.q.unit.teryt)) best = { q, ...r };
      }
      if (best) {
        out.set(p.unit.teryt, { type: 'F8', teryt: p.unit.teryt, twin: best.q.unit.teryt, year, dims: best.n, distance: Math.round(best.d * 100) / 100 });
      }
    }
  }
  return out;
}
