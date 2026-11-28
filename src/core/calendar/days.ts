// Dane dni: sprawdzenie pliku z sieci i liczby do znaczników w komórce kalendarza.
import type { DayData, KalendariumDni } from './types';

const EMPTY: DayData = { publications: [], media: [] };

/** Bezpieczne odczytanie pliku z sieci: zły kształt = null (strona pokazuje komunikat, nie wywala się). */
export function parseKalendarium(raw: unknown): KalendariumDni | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { updated?: unknown; days?: unknown };
  if (typeof r.updated !== 'string' || !r.days || typeof r.days !== 'object') return null;
  const days: KalendariumDni['days'] = {};
  for (const [iso, d] of Object.entries(r.days as Record<string, Partial<DayData>>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue;
    days[iso] = {
      publications: Array.isArray(d?.publications) ? d.publications : [],
      media: Array.isArray(d?.media) ? d.media : [],
    };
  }
  return { updated: r.updated, days };
}

export const dayData = (data: KalendariumDni | null, iso: string): DayData => data?.days[iso] ?? EMPTY;

export interface DayMarks {
  /** Publikacje GUS tego dnia. */
  publications: number;
  /** Zmienne i wskaźniki pobrane (stan „pobrane”). */
  downloaded: number;
  /** Pomysły na media. */
  media: number;
}

export function dayMarks(data: KalendariumDni | null, iso: string): DayMarks {
  const d = dayData(data, iso);
  return {
    publications: d.publications.length,
    downloaded: d.publications.reduce((n, p) => n + (p.counts?.downloaded ?? 0), 0),
    media: d.media.length,
  };
}

/** Liczba po polsku z właściwą formą: plural(2, 'zmienna', 'zmienne', 'zmiennych'). */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;
}
