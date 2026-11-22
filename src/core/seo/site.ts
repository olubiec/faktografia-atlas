/** Adres główny serwisu (decyzja D1 w docs/SEO.md: jedna domena). */
export const SITE_URL = 'https://faktografia.eu';

/** Obrazek do udostępnień (1200×630), generowany przez scripts/seo/og-image.mjs. */
export const OG_IMAGE_PATH = '/og/faktografia.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Pełny adres z samej ścieżki (ukośnik na początku dopisywany, gdy go brak). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Adres kanoniczny: bez parametrów, fragmentu i bez ukośnika na końcu (poza stroną główną). */
export function canonicalFor(pathname: string): string {
  const clean = (pathname.split(/[?#]/)[0] ?? '').replace(/\/+$/, '');
  return absoluteUrl(clean === '' ? '/' : clean);
}
