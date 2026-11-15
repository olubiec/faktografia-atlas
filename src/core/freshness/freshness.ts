// Wskaźnik świeżości danych: czysta logika (format daty, wiek, próg).

export const STALE_AFTER_DAYS = 60;
const DAY_MS = 86_400_000;

// Jeden istniejący plik z polem fetchedAt (pobierany w runtime, nie importowany)
export const FRESHNESS_URL = '/data/values/density.json';

function parse(iso: unknown): Date | null {
  if (typeof iso !== 'string') return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Data w formacie DD.MM.RRRR (UTC, stabilna niezależnie od strefy). */
export function formatDatePl(iso: unknown): string | null {
  const d = parse(iso);
  if (!d) return null;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

/** Wiek w pełnych dniach względem `now`; null dla złej daty. */
export function ageInDays(iso: unknown, now: Date = new Date()): number | null {
  const d = parse(iso);
  if (!d) return null;
  return Math.floor((now.getTime() - d.getTime()) / DAY_MS);
}

export function isStale(iso: unknown, now: Date = new Date()): boolean {
  const age = ageInDays(iso, now);
  return age !== null && age > STALE_AFTER_DAYS;
}

export function freshnessLabel(iso: unknown, now: Date = new Date()): string | null {
  const date = formatDatePl(iso);
  if (!date) return null;
  const base = `Dane GUS odświeżone: ${date}`;
  return isStale(iso, now) ? `${base} (dane mogą być nieaktualne)` : base;
}

/** Pobiera plik i zwraca etykietę; błąd lub brak pola = null. */
export async function loadFreshness(
  fetchFn: typeof fetch = fetch,
  now: Date = new Date(),
): Promise<string | null> {
  try {
    const res = await fetchFn(FRESHNESS_URL);
    if (!res.ok) return null;
    const json = (await res.json()) as { fetchedAt?: unknown } | null;
    return freshnessLabel(json?.fetchedAt, now);
  } catch {
    return null;
  }
}
