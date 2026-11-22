// Adresy serwisu do meta i udostępnień: czyste funkcje, bez Reacta. Domena: docs/SEO.md (D1, D6).

/** Domena główna (D1); domeny .pl nie mamy, więc nigdzie jej nie podajemy. */
export const SITE_URL = 'https://faktografia.eu';

/** Obrazek do udostępnień (1200×630), generowany przez scripts/seo/og-image.mjs. */
export const OG_IMAGE_PATH = '/og/faktografia.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Pełny adres dla ścieżki w serwisie; adres już absolutny zostaje bez zmian. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Adres kanoniczny: bez parametrów i kotwicy, bez „/” na końcu (poza stroną startową).
 * Parametry (np. `/mapa?u=…`) nie tworzą osobnych adresów (D6).
 */
export function canonicalFor(pathname: string): string {
  const bare = pathname.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0] ?? '';
  const trimmed = bare.replace(/\/+$/, '');
  if (trimmed === '') return `${SITE_URL}/`;
  return `${SITE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/** Minimalny kształt `document.head` potrzebny do sprzątania (łatwy do podmiany w testach). */
export interface HeadLike {
  querySelectorAll(selector: string): ArrayLike<{ remove(): void }>;
}

/**
 * Usuwa zapasowe tagi z `index.html` (`[data-fallback]`), gdy strona ustawiła już własne –
 * żeby w `<head>` nie było dwóch opisów. Zwraca liczbę usuniętych elementów.
 */
export function removeFallbackTags(head: HeadLike): number {
  const nodes = Array.from(head.querySelectorAll('[data-fallback]'));
  for (const node of nodes) node.remove();
  return nodes.length;
}
