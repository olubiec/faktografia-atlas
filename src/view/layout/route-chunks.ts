// Mapa podstron ładowanych na żądanie i prefetch kodu po najechaniu lub fokusie na link.
// Ten sam import co w `lazy(...)` w App.tsx, więc przeglądarka pobiera chunk tylko raz.

export type RouteKey =
  | 'About'
  | 'Sources'
  | 'Privacy'
  | 'Contact'
  | 'DataDisclaimer'
  | 'Rankings'
  | 'ComparePage'
  | 'Library'
  | 'LibraryVariable';

type Chunk = () => Promise<unknown>;

export const routeChunks = {
  About: () => import('../pages/About'),
  Sources: () => import('../pages/Sources'),
  Privacy: () => import('../pages/Privacy'),
  Contact: () => import('../pages/Contact'),
  DataDisclaimer: () => import('../pages/DataDisclaimer'),
  Rankings: () => import('../pages/Rankings'),
  ComparePage: () => import('../pages/ComparePage'),
  Library: () => import('../pages/Library'),
  LibraryVariable: () => import('../pages/LibraryVariable'),
} satisfies Record<RouteKey, Chunk>;

const pathKeys: Record<string, RouteKey> = {
  '/o-projekcie': 'About',
  '/zrodla': 'Sources',
  '/prywatnosc': 'Privacy',
  '/kontakt': 'Contact',
  '/zastrzezenie': 'DataDisclaimer',
  '/rankingi': 'Rankings',
  '/porownaj': 'ComparePage',
  '/biblioteka': 'Library',
};

/** Klucz podstrony dla linku z tego samego origin (bez query i hash); nieznane → null. */
export function routeKeyFromHref(href: string, origin: string): RouteKey | null {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
  if (path in pathKeys) return pathKeys[path];
  if (/^\/biblioteka\/[^/]+$/.test(path)) return 'LibraryVariable';
  return null;
}

const started = new Map<RouteKey, Promise<void>>();

/** Pobiera kod podstrony najwyżej raz; błąd jest połykany i pozwala spróbować ponownie. */
export function prefetchRoute(key: RouteKey, chunks: Record<RouteKey, Chunk> = routeChunks): Promise<void> {
  const existing = started.get(key);
  if (existing) return existing;
  const p = chunks[key]().then(
    () => undefined,
    () => {
      started.delete(key);
    },
  );
  started.set(key, p);
  return p;
}
