// Detektory faktów F1, F2, F3, F4, F5, F9 (KONCEPT-ODKRYCIA §3). Każdy zwraca fakty jednej jednostki.
import { windowHasBoundaryChange } from './boundaries';
import type { FactsContext } from './context';
import { median, percentile, rankOf, withinTop } from './rank';
import { finishFact } from './strength';
import type { Direction, Fact, FactIndicator, FactUnit } from './types';

const DIRS: Direction[] = [1, -1];

/** Rok odniesienia i wartość jednostki w nim (albo null). */
function current(ctx: FactsContext, unit: FactUnit, ind: FactIndicator) {
  const s = ctx.series(unit.teryt, ind.id);
  const idx = ctx.refYearIdx(ind.id, unit.level);
  const value = s && idx >= 0 ? s.values[idx] : null;
  if (!s || value == null) return null;
  return { s, idx, value, year: s.years[idx] };
}

/** F1 – 1% górny/dolny w Polsce w swoim poziomie. */
export function detectNational(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const sorted = ctx.sortedAt(ind.id, unit.level, cur.idx);
  const limit = Math.max(1, Math.ceil(sorted.length * ctx.input.config.thresholds.nationalShare));
  return DIRS.flatMap((dir) => {
    const r = rankOf(sorted, cur.value, dir);
    if (!withinTop(r, limit) || sorted.length < 2) return [];
    const compare = { kind: 'rank' as const, dir, rank: r.rank, total: r.total, tie: r.ties > 1 };
    return [finishFact({ type: 'F1', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, ctx.input.config, ctx.latestYear)];
  });
}

/** F2 – miejsca 1–3 i 3 ostatnie w województwie (gdy ≥ 15 jednostek poziomu). */
export function detectVoivodeship(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  if (unit.level === 'woj') return [];
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const { voivodeshipTop, voivodeshipMinUnits } = ctx.input.config.thresholds;
  const woj = unit.teryt.slice(0, 2);
  const sorted = cached(ctx, `woj|${ind.id}|${unit.level}|${woj}|${cur.idx}`, () =>
    ctx.byLevel[unit.level]
      .filter((u) => u.teryt.startsWith(woj))
      .map((u) => ctx.series(u.teryt, ind.id)?.values[cur.idx])
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b),
  );
  if (sorted.length < voivodeshipMinUnits) return [];
  return DIRS.flatMap((dir) => {
    const r = rankOf(sorted, cur.value, dir);
    if (!withinTop(r, voivodeshipTop)) return [];
    const compare = { kind: 'rank' as const, dir, rank: r.rank, total: r.total, tie: r.ties > 1 };
    return [finishFact({ type: 'F2', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, ctx.input.config, ctx.latestYear)];
  });
}

/** F3 – wartość poza zakresem wszystkich sąsiadów (≥ 4 z wartością w tym samym roku). */
export function detectNeighbours(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  const ring = ctx.input.neighbours?.[unit.teryt];
  const min = ctx.input.config.neighbours?.min ?? 4;
  if (!ring) return [];
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const around = ring.ids.map((t) => ctx.series(t, ind.id)?.values[cur.idx]).filter((v): v is number => v != null);
  if (around.length < min) return [];
  const lo = Math.min(...around);
  const hi = Math.max(...around);
  const dir: Direction | null = cur.value > hi ? 1 : cur.value < lo ? -1 : null;
  if (!dir) return [];
  const compare = { kind: 'neighbours' as const, dir, count: around.length, min: lo, max: hi, extended: ring.extended };
  return [finishFact({ type: 'F3', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, ctx.input.config, ctx.latestYear)];
}

/** Zmiana w oknie: procentowa dla liczb (osoby, zł), różnica dla wskaźników (%, na 1000). */
export function changeOf(ctx: FactsContext, ind: FactIndicator, from: number, to: number): number | null {
  if (ctx.input.config.relativeChangeUnits.includes(ind.unit)) return from > 0 ? (to - from) / from : null;
  return to - from;
}

const caches = new WeakMap<FactsContext, Map<string, unknown>>();

/** Pamięć podręczna obliczeń wspólnych dla wielu jednostek (rozkłady województw, zmian). */
function cached<T>(ctx: FactsContext, key: string, make: () => T): T {
  let byKey = caches.get(ctx);
  if (!byKey) caches.set(ctx, (byKey = new Map()));
  if (!byKey.has(key)) byKey.set(key, make());
  return byKey.get(key) as T;
}

/** Zmiany w oknie 10 lat wszystkich jednostek poziomu (bez okien ze zmianą granic) i ich rozkład. */
function changesFor(ctx: FactsContext, ind: FactIndicator, level: FactUnit['level'], toIdx: number, fromIdx: number) {
  return cached(ctx, `chg|${ind.id}|${level}|${toIdx}|${fromIdx}`, () => computeChanges(ctx, ind, level, toIdx, fromIdx));
}

function computeChanges(ctx: FactsContext, ind: FactIndicator, level: FactUnit['level'], toIdx: number, fromIdx: number) {
  const out = new Map<string, number>();
  for (const u of ctx.byLevel[level]) {
    const s = ctx.series(u.teryt, ind.id);
    const a = s?.values[fromIdx];
    const b = s?.values[toIdx];
    if (!s || a == null || b == null) continue;
    if (windowHasBoundaryChange(ctx.boundaryYears(u.teryt), s.years[fromIdx], s.years[toIdx])) continue;
    const c = changeOf(ctx, ind, a, b);
    if (c != null) out.set(u.teryt, c);
  }
  return { byTeryt: out, sorted: [...out.values()].sort((a, b) => a - b) };
}

/** F4 – zmiana 10 lat w 2% górnych/dolnych poziomu; okno ze zmianą granic nie daje faktu. */
export function detectChange(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  const { config } = ctx.input;
  if (config.changeExcluded.includes(ind.id)) return [];
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const fromIdx = cur.s.years.indexOf(cur.year - config.thresholds.changeYears);
  const fromValue = fromIdx >= 0 ? cur.s.values[fromIdx] : null;
  if (fromValue == null) return [];
  const { byTeryt, sorted } = changesFor(ctx, ind, unit.level, cur.idx, fromIdx);
  const mine = byTeryt.get(unit.teryt);
  if (mine == null) return [];
  const limit = Math.max(1, Math.ceil(sorted.length * config.thresholds.changeShare));
  return DIRS.flatMap((dir) => {
    const r = rankOf(sorted, mine, dir);
    if (!withinTop(r, limit) || sorted.length < 2) return [];
    const compare = { kind: 'change' as const, dir, rank: r.rank, total: r.total, fromYear: cur.s.years[fromIdx], fromValue };
    return [finishFact({ type: 'F4', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, config, ctx.latestYear)];
  });
}

/** F5 – stosunek do mediany kraju najdalszy w całej serii, odchylenie > 15%. */
export function detectRecord(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  const { config } = ctx.input;
  if (config.recordExcluded.includes(ind.id)) return [];
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const ratios: { year: number; r: number }[] = [];
  for (let i = 0; i <= cur.idx; i++) {
    const v = cur.s.values[i];
    const m = median(ctx.sortedAt(ind.id, unit.level, i));
    if (v != null && m != null && m > 0) ratios.push({ year: cur.s.years[i], r: v / m });
  }
  const last = ratios.at(-1);
  if (!last || last.year !== cur.year || ratios.length < config.thresholds.recordMinYears) return [];
  const since = ratios[0].year;
  if (config.absoluteIndicators.includes(ind.id) && windowHasBoundaryChange(ctx.boundaryYears(unit.teryt), since, cur.year)) return [];
  const prev = ratios.slice(0, -1).map((x) => x.r);
  const dev = config.thresholds.recordDeviation;
  let dir: Direction | null = null;
  if (last.r > 1 + dev && last.r > Math.max(...prev)) dir = 1;
  else if (last.r < 1 - dev && last.r < Math.min(...prev)) dir = -1;
  if (!dir) return [];
  const med = round2(median(ctx.sortedAt(ind.id, unit.level, cur.idx))!);
  const compare = { kind: 'record' as const, dir, median: med, sinceYear: since };
  return [finishFact({ type: 'F5', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, config, ctx.latestYear, ratios.length)];
}

/** F9 – typowość: pozycja względem mediany poziomu (ostatnia deska, gdy brak innych faktów). */
export function detectTypical(ctx: FactsContext, unit: FactUnit, ind: FactIndicator): Fact[] {
  const cur = current(ctx, unit, ind);
  if (!cur) return [];
  const sorted = ctx.sortedAt(ind.id, unit.level, cur.idx);
  const med = median(sorted);
  if (med == null) return [];
  const compare = { kind: 'typical' as const, median: round2(med), percentile: Math.round(percentile(sorted, cur.value)) };
  return [finishFact({ type: 'F9', teryt: unit.teryt, indicatorId: ind.id, year: cur.year, value: cur.value, compare, ...span(cur.s.span) }, ctx.input.config, ctx.latestYear)];
}

const span = (n: number) => (n > 1 ? { span: n } : {});
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Wszystkie kandydaci na fakty jednostki. */
export function detectAll(ctx: FactsContext, unit: FactUnit): Fact[] {
  const out: Fact[] = [];
  for (const ind of ctx.indicators.values()) {
    if (!ctx.applies(ind, unit)) continue;
    out.push(
      ...detectNational(ctx, unit, ind),
      ...detectVoivodeship(ctx, unit, ind),
      ...detectNeighbours(ctx, unit, ind),
      ...detectChange(ctx, unit, ind),
      ...detectRecord(ctx, unit, ind),
      ...detectTypical(ctx, unit, ind),
    );
  }
  return out;
}
