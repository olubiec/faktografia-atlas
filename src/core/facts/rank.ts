// Miejsca w rankingu, mediany i percentyle na posortowanych rosnąco tablicach.
import type { Direction } from './types';

/** Pierwszy indeks z wartością ≥ v. */
export function lowerBound(sorted: readonly number[], v: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < v) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Pierwszy indeks z wartością > v. */
export function upperBound(sorted: readonly number[], v: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= v) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export interface RankResult {
  /** Miejsce od góry (dir 1) albo od dołu (dir −1), 1 = skrajne. */
  rank: number;
  /** Ile jednostek ma tę samą wartość (≥ 1). */
  ties: number;
  total: number;
}

export function rankOf(sorted: readonly number[], v: number, dir: Direction): RankResult {
  const lo = lowerBound(sorted, v);
  const hi = upperBound(sorted, v);
  const rank = dir === 1 ? sorted.length - hi + 1 : lo + 1;
  return { rank, ties: Math.max(1, hi - lo), total: sorted.length };
}

/**
 * Czy jednostka mieści się w `limit` skrajnych miejscach razem z całą grupą remisu
 * (100 gmin z 0% kanalizacji to nie jest skrajność).
 */
export function withinTop(r: RankResult, limit: number): boolean {
  return r.rank + r.ties - 1 <= limit;
}

export function median(sorted: readonly number[]): number | null {
  const n = sorted.length;
  if (n === 0) return null;
  const mid = n >> 1;
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Percentyl (0–100) wartości w rozkładzie, remisy liczone w połowie. */
export function percentile(sorted: readonly number[], v: number): number {
  if (sorted.length === 0) return 50;
  const lo = lowerBound(sorted, v);
  const hi = upperBound(sorted, v);
  return ((lo + (hi - lo) / 2) / sorted.length) * 100;
}
