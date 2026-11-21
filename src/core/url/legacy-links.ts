// Stare linki: adres `/` z parametrami stanu mapy (sprzed przeniesienia mapy pod `/mapa`).

/** Parametry stanu mapy: jednostka, wskaźnik, rok, poziom, porównanie, arkusz profilu. */
const STATE_KEYS = ['u', 'i', 'y', 'l', 'c', 'sheet'];

/**
 * Dokąd przekierować stary adres. `null` = zostaje, gdzie jest.
 * Tylko `/` z którymś parametrem stanu przechodzi na `/mapa`; zapis (także `e2e`, `logo`, `tune`
 * i nieznane parametry) zostaje bez zmian. Goły `/` i `/?logo=znak` to ekran startowy.
 */
export function legacyRedirect(pathname: string, search: string): string | null {
  if (pathname !== '/') return null;
  const params = new URLSearchParams(search);
  if (!STATE_KEYS.some((key) => params.has(key))) return null;
  return `/mapa${search}`;
}
