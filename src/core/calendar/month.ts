// Siatka miesiąca (poniedziałek–niedziela) i działania na datach ISO. Czyste funkcje, bez stref czasowych:
// daty liczymy w UTC i trzymamy jako tekst „RRRR-MM-DD”.
import type { GridCell } from './types';

export const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'] as const;
const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const DAYS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const WEEKDAYS_LONG = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Miesiąc „RRRR-MM” z tekstu; null, gdy to nie miesiąc. */
export function parseMonth(s: string | null | undefined): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(s ?? '');
  if (!m) return null;
  const month = Number(m[2]);
  return month >= 1 && month <= 12 ? { year: Number(m[1]), month } : null;
}

export const isIsoDay = (s: string | null | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

export const monthOf = (iso: string) => iso.slice(0, 7);

/** Przesuwa miesiąc o `delta` (może być ujemna); działa przez granicę roku. */
export function shiftMonth(ym: string, delta: number): string {
  const p = parseMonth(ym);
  if (!p) return ym;
  const idx = p.year * 12 + (p.month - 1) + delta;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export function monthTitle(ym: string): string {
  const p = parseMonth(ym);
  return p ? `${MONTHS[p.month - 1]} ${p.year}` : ym;
}

/** „czwartek, 26 listopada 2026”. */
export function dayTitle(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${d.getUTCDate()} ${DAYS_GEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Pełne tygodnie (od poniedziałku) obejmujące miesiąc; dni sąsiednich miesięcy mają `inMonth: false`. */
export function monthGrid(ym: string): GridCell[][] {
  const p = parseMonth(ym);
  if (!p) return [];
  const first = new Date(Date.UTC(p.year, p.month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const total = Math.ceil((lead + new Date(Date.UTC(p.year, p.month, 0)).getUTCDate()) / 7) * 7;
  const weeks: GridCell[][] = [];
  for (let i = 0; i < total; i += 1) {
    const d = new Date(Date.UTC(p.year, p.month - 1, 1 - lead + i));
    const cell: GridCell = { iso: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: d.getUTCMonth() === p.month - 1 };
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(cell);
  }
  return weeks;
}
