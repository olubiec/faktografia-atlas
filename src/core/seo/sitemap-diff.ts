export interface SitemapEntry { loc: string; lastmod: string }

/** Wyciąga pary adres + data z pliku mapy strony (urlset). */
export function parseUrlset(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1]!)?.[1];
    if (!loc) continue;
    out.push({ loc: loc.replace(/&amp;/g, '&'), lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[1]!)?.[1] ?? '' });
  }
  return out;
}

/** Adresy nowe albo ze zmienionym `lastmod` (usunięte pomijamy). Wejście: treść jednego lub wielu plików urlset. */
export function changedUrls(oldXml: string, newXml: string): string[] {
  const before = new Map(parseUrlset(oldXml).map((e) => [e.loc, e.lastmod]));
  return parseUrlset(newXml)
    .filter((e) => before.get(e.loc) !== e.lastmod)
    .map((e) => e.loc);
}

/** Dzieli listę na paczki (IndexNow: do 10 000 adresów na żądanie). */
export function batches<T>(items: readonly T[], size = 10_000): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
