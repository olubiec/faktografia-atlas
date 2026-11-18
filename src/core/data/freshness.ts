// Świeżość danych: czysta logika dat (bez przeglądarki). „Teraz” jest podawane z zewnątrz.

const TIME_ZONE = 'Europe/Warsaw';
const MS_PER_DAY = 86_400_000;

const dayParts = new Intl.DateTimeFormat('pl-PL', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export type Freshness = { label: string; ageDays: number; stale: boolean };

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function warsawYmd(date: Date): { year: number; month: number; day: number } {
  const get = (type: string) => Number(dayParts.formatToParts(date).find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** Pełne dni kalendarzowe (czas polski) między datą a „teraz”; przyszłość daje 0. */
function calendarAgeDays(date: Date, now: Date): number {
  const a = warsawYmd(date);
  const b = warsawYmd(now);
  const diff = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.max(0, Math.round(diff / MS_PER_DAY));
}

/** Największa poprawna data; niepoprawne i puste są pomijane. */
export function latestTimestamp(isoDates: (string | undefined | null)[]): Date | null {
  let latest: Date | null = null;
  for (const iso of isoDates) {
    const date = parseDate(iso);
    if (date && (!latest || date.getTime() > latest.getTime())) latest = date;
  }
  return latest;
}

/** Dzień w formacie „19.10.2026” (strefa Europe/Warsaw). */
export function formatDay(date: Date): string {
  const { year, month, day } = warsawYmd(date);
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

/** „Dane z 19.10.2026” + wiek w dniach; `stale`, gdy wiek przekracza próg. Brak/zła data → null. */
export function describeFreshness(
  iso: string | null | undefined,
  now: Date,
  staleAfterDays = 3
): Freshness | null {
  const date = parseDate(iso);
  if (!date) return null;
  const ageDays = calendarAgeDays(date, now);
  return { label: `Dane z ${formatDay(date)}`, ageDays, stale: ageDays > staleAfterDays };
}

/** „Sprawdzone przez automat: dziś / wczoraj / N dni temu”. Brak/zła data → null. */
export function describeCheck(checkedAtIso: string | null | undefined, now: Date): string | null {
  const date = parseDate(checkedAtIso);
  if (!date) return null;
  const days = calendarAgeDays(date, now);
  const when = days === 0 ? 'dziś' : days === 1 ? 'wczoraj' : `${days} dni temu`;
  return `Sprawdzone przez automat: ${when}`;
}
