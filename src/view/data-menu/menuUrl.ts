// Adres menu wyboru danych: ?menu=dane otwiera menu, ?q=<fraza> wpisuje frazę (stara Biblioteka → /mapa).

const MENU_PARAM = 'menu';
const QUERY_PARAM = 'q';

export function readMenuUrl(): { open: boolean; query: string } {
  if (typeof window === 'undefined') return { open: false, query: '' };
  const params = new URLSearchParams(window.location.search);
  return { open: params.get(MENU_PARAM) === 'dane', query: params.get(QUERY_PARAM) ?? '' };
}

/** Po zamknięciu menu parametry menu= i q= znikają z adresu (replace, bez nowego wpisu w historii). */
export function clearMenuUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(MENU_PARAM) && !url.searchParams.has(QUERY_PARAM)) return;
  url.searchParams.delete(MENU_PARAM);
  url.searchParams.delete(QUERY_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
}
