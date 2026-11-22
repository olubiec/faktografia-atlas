// Biblioteka GUS: planowanie przebiegu (czyste funkcje, testowane bez sieci).
// Budżet wg okna 12 h, sonda „czy GUS dopisał rok”, kandydaci do odświeżenia.
import { dataUrl } from './library-lib.mjs';

const H12 = 12 * 3600_000;
/** Limit BDL w oknie 12 h (5000) z marginesem bezpieczeństwa 5%. */
export const WINDOW_12H_ALLOWED = 4750;

/** Budżet tego przebiegu = min(zadany, to, co zostało w oknie 12 h po poprzednich przebiegach). */
export function budgetForRun({ runLog = [], now = Date.now(), total, allowed = WINDOW_12H_ALLOWED }) {
  const spent = runLog
    .filter((r) => now - Date.parse(r.at) < H12)
    .reduce((s, r) => s + (r.used ?? 0), 0);
  return Math.max(0, Math.min(total, allowed - spent));
}

/** Adres sondy: jedna strona danych powiatowych za rok następujący po ostatnim pobranym. */
export function yearProbeUrl(varId, years) {
  const next = Math.max(...years.map(Number)) + 1;
  const u = new URL(dataUrl(varId, 5, 0));
  u.searchParams.set('year', String(next));
  return u.toString();
}

/** Czy odpowiedź sondy zawiera jakąkolwiek wartość (GUS opublikował nowy rok). */
export function hasNewYear(json) {
  return (json?.results ?? []).some((r) => (r.values ?? []).some((v) => v.val !== null && v.val !== undefined));
}

/** Zmienne pobrane dawniej niż refreshAfterDays: przypięte pierwsze, potem wg wyniku. */
export function refreshCandidates({ done, config, now = Date.now(), scoreOf = () => 0, calendarHit = () => false, calendarLatest = null }) {
  const maxAge = (config.refreshAfterDays ?? 30) * 86400_000;
  const pinned = new Map((config.pinnedIds ?? []).map((id, i) => [Number(id), i]));
  return Object.entries(done)
    // Starsze niż maxAge albo temat świeżo opublikowany w kalendarium po ostatnim pobraniu.
    .filter(([id, day]) => now - Date.parse(day) >= maxAge || (calendarLatest && day < calendarLatest && calendarHit(Number(id))))
    .map(([id]) => Number(id))
    .sort((a, b) => {
      const pa = pinned.has(a), pb = pinned.has(b);
      if (pa !== pb) return pa ? -1 : 1;
      if (pa && pb) return pinned.get(a) - pinned.get(b);
      return scoreOf(b) - scoreOf(a) || a - b;
    });
}

/** Z wyniku sond { id: bool } zostawia id wskaźników z nowym rokiem. */
export function idsWithNewYear(probe) {
  return Object.entries(probe).filter(([, v]) => v).map(([id]) => id);
}
