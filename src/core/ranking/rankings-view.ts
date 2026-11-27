// Widok listy na stronie Rankingi: kolejność (najwyższe / najniższe), szukajka po nazwie i podział na strony.
import { normalize } from '../search/normalize';
import type { RankedUnit } from './ranking';

export const RANKINGS_PAGE_SIZE = 50;

export type RankingRow = { teryt: string; value: number; pos: number };

/** Wartości od najwyższej (`high`) albo najniższej (`low`); `pos` to numer w całej liście, także po filtrowaniu. */
export function orderRows(items: readonly RankedUnit[], dir: 'high' | 'low'): RankingRow[] {
  const sign = dir === 'high' ? -1 : 1;
  return [...items]
    .sort((a, b) => sign * (a.value - b.value) || a.name.localeCompare(b.name, 'pl'))
    .map((r, i) => ({ teryt: r.teryt, value: r.value, pos: i + 1 }));
}

/** Zostawia wiersze, których nazwa zawiera szukany tekst (bez polskich znaków i wielkości liter). */
export function filterRows(rows: readonly RankingRow[], nameOf: (teryt: string) => string, q: string): RankingRow[] {
  const needle = normalize(q);
  return needle ? rows.filter((r) => normalize(nameOf(r.teryt)).includes(needle)) : [...rows];
}

/** Jedna strona listy; numer spoza zakresu przechodzi na najbliższą istniejącą stronę. */
export function pageOf<T>(rows: readonly T[], page: number, size = RANKINGS_PAGE_SIZE): { rows: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, page), pages);
  return { rows: rows.slice((p - 1) * size, p * size), page: p, pages };
}
