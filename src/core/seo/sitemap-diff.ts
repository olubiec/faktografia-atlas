// Porównanie map strony dla IndexNow (S11, docs/SEO.md §5). Czyste funkcje, bez Reacta i bez sieci.

/** Limit protokołu IndexNow: najwyżej 10 000 adresów w jednym zapytaniu. */
export const INDEXNOW_BATCH = 10_000;

const decode = (s: string) =>
  s
    .trim()
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const tag = (block: string, name: string): string | undefined => {
  const m = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(block);
  return m ? decode(m[1] ?? '') : undefined;
};

/**
 * Adres → `lastmod` (pusty tekst, gdy brak) ze wszystkich `<url>` w tekście.
 * Działa też na kilku plikach `urlset` sklejonych w jeden tekst.
 */
export function parseSitemap(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = tag(m[1] ?? '', 'loc');
    if (loc) out.set(loc, tag(m[1] ?? '', 'lastmod') ?? '');
  }
  return out;
}

/** Adresy plików wymienionych w indeksie mapy strony (`<sitemapindex>`). */
export function sitemapLocs(indexXml: string): string[] {
  return [...indexXml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)]
    .map((m) => tag(m[1] ?? '', 'loc'))
    .filter((loc): loc is string => !!loc);
}

/** Adresy nowe albo ze zmienionym `lastmod` (w kolejności nowej mapy). Usunięte pomija. */
export function changedUrls(oldXml: string, newXml: string): string[] {
  const before = parseSitemap(oldXml);
  const out: string[] = [];
  for (const [loc, lastmod] of parseSitemap(newXml)) {
    if (before.get(loc) !== lastmod) out.push(loc);
  }
  return out;
}

/** Dzieli listę na paczki ≤ `size` (domyślnie limit IndexNow). Pusta lista → brak paczek. */
export function batches<T>(items: readonly T[], size = INDEXNOW_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
