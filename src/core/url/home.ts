// Powrót na stronę główną po kliknięciu w logo: adres bez parametrów wybranej jednostki i widoku.

/** Zdarzenie okna: ekran mapy ma wrócić do stanu startowego. */
export const ATLAS_RESET_EVENT = 'atlas:reset';

// Parametry techniczne (tryb testowy, strojenie, wariant logo) zostają; reszta to stan widoku.
const KEEP = ['e2e', 'tune', 'logo'];

/** Zwraca „search” adresu strony głównej: tylko parametry techniczne, bez ?u= ?i= ?y= ?l= ?c=. */
export function homeSearch(search: string): string {
  const from = new URLSearchParams(search);
  const parts: string[] = [];
  for (const key of KEEP) {
    if (!from.has(key)) continue;
    const value = from.get(key) ?? '';
    parts.push(value ? `${key}=${encodeURIComponent(value)}` : key);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
