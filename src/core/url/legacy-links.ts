// Stare linki: adres `/` z parametrami stanu mapy (sprzed przeniesienia mapy pod `/mapa`)
// oraz stara Biblioteka (`/biblioteka*`, R2), której strony już nie ma.

const LIBRARY_PARAMS = ['k', 'q'];

/** `/biblioteka`: bez parametrów lub z `k`/`q` → menu danych (fraza `q` przechodzi, kategoria `k` znika). */
function libraryList(search: string): string | null {
  const params = new URLSearchParams(search);
  if ([...params.keys()].some((key) => !LIBRARY_PARAMS.includes(key))) return null;
  const q = (params.get('q') ?? '').trim();
  return q ? `/mapa?${new URLSearchParams({ menu: 'dane', q })}` : '/mapa?menu=dane';
}

/** `/biblioteka/<id>`: numer zmiennej GUS → wskaźnik `b<id>`; nieznany numer → sama mapa. */
function libraryVariable(id: string, knownIds?: ReadonlySet<string>): string {
  if (!/^\d+$/.test(id)) return '/mapa';
  const indicatorId = `b${id}`;
  if (knownIds && !knownIds.has(indicatorId)) return '/mapa';
  return `/mapa?${new URLSearchParams({ i: indicatorId })}`;
}

/** Parametry stanu mapy: jednostka, wskaźnik, rok, poziom, porównanie, arkusz profilu. */
const STATE_KEYS = ['u', 'i', 'y', 'l', 'c', 'sheet'];

/**
 * Dokąd przekierować stary adres. `null` = zostaje, gdzie jest.
 * Tylko `/` z którymś parametrem stanu przechodzi na `/mapa`; zapis (także `e2e`, `logo`, `tune`
 * i nieznane parametry) zostaje bez zmian. Goły `/` i `/?logo=znak` to ekran startowy.
 * `knownIds` (id wskaźników ze spisu, np. `b101`) pozwala odrzucić nieistniejące `/biblioteka/<id>`.
 */
export function legacyRedirect(pathname: string, search: string, knownIds?: ReadonlySet<string>): string | null {
  if (pathname === '/biblioteka' || pathname === '/biblioteka/') return libraryList(search);
  const variable = /^\/biblioteka\/([^/]+)\/?$/.exec(pathname);
  if (variable) return libraryVariable(variable[1]!, knownIds);
  if (pathname !== '/') return null;
  const params = new URLSearchParams(search);
  if (!STATE_KEYS.some((key) => params.has(key))) return null;
  return `/mapa${search}`;
}
