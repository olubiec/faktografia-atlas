// Mapa strony (sitemap.xml) dla stron miejsc (S07, docs/SEO.md D7). Czyste funkcje, bez Reacta.
import { absoluteUrl } from './site';
import type { SlugUnit } from './slug';

/** Limit protokołu sitemaps.org: najwyżej 50 000 adresów w jednym pliku. */
export const MAX_URLS_PER_FILE = 50_000;

const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';

export interface SitemapPage {
  path: string;
  level: SlugUnit['level'];
  indexable: boolean;
  /** Data danych (ISO); w mapie strony sam dzień. */
  lastmod: string;
}

/** Przełączniki z config/seo.json. */
export interface SeoConfig {
  /** D7: gminy trafiają do Google dopiero po obserwacji powiatów. */
  indexGminy: boolean;
}

/** Czy strona ma być w Google: dość świeżych danych, a gmina tylko przy włączonym `indexGminy`. */
export function isIndexed(page: Pick<SitemapPage, 'level' | 'indexable'>, config: SeoConfig): boolean {
  return page.indexable && (page.level !== 'gmi' || config.indexGminy);
}

const xmlText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const day = (iso: string) => iso.slice(0, 10);

interface Entry {
  loc: string;
  lastmod?: string;
}

function urlset(entries: Entry[]): string {
  const rows = entries.map(
    (e) => `  <url><loc>${xmlText(e.loc)}</loc>${e.lastmod ? `<lastmod>${xmlText(e.lastmod)}</lastmod>` : ''}</url>\n`,
  );
  return `${HEAD}<urlset xmlns="${NS}">\n${rows.join('')}</urlset>\n`;
}

function sitemapIndex(entries: Entry[]): string {
  const rows = entries.map(
    (e) =>
      `  <sitemap><loc>${xmlText(e.loc)}</loc>${e.lastmod ? `<lastmod>${xmlText(e.lastmod)}</lastmod>` : ''}</sitemap>\n`,
  );
  return `${HEAD}<sitemapindex xmlns="${NS}">\n${rows.join('')}</sitemapindex>\n`;
}

/**
 * Buduje indeks `sitemap.xml` i pliki: `sitemap-strony.xml` (strony stałe),
 * `sitemap-wojewodztwa-powiaty.xml`, `sitemap-gminy.xml` (dalsze części: `-2`, `-3`…).
 * Pusty plik nie powstaje i nie trafia do indeksu. Zwraca nazwa pliku → treść XML.
 */
export function buildSitemaps(
  pages: readonly SitemapPage[],
  staticPaths: readonly string[],
  config: SeoConfig,
): Record<string, string> {
  const indexed = pages.filter((p) => isIndexed(p, config));
  const toEntry = (p: SitemapPage): Entry => ({ loc: absoluteUrl(p.path), lastmod: day(p.lastmod) });
  const groups: [string, Entry[]][] = [
    ['sitemap-strony', staticPaths.map((p) => ({ loc: absoluteUrl(p) }))],
    ['sitemap-wojewodztwa-powiaty', indexed.filter((p) => p.level !== 'gmi').map(toEntry)],
    ['sitemap-gminy', indexed.filter((p) => p.level === 'gmi').map(toEntry)],
  ];

  const files: Record<string, string> = {};
  const index: Entry[] = [];
  for (const [base, entries] of groups) {
    for (let part = 0; part * MAX_URLS_PER_FILE < entries.length; part++) {
      const chunk = entries.slice(part * MAX_URLS_PER_FILE, (part + 1) * MAX_URLS_PER_FILE);
      const name = `${base}${part === 0 ? '' : `-${part + 1}`}.xml`;
      files[name] = urlset(chunk);
      const dates = chunk.map((e) => e.lastmod).filter((d): d is string => !!d).sort();
      index.push({ loc: absoluteUrl(`/${name}`), lastmod: dates.at(-1) });
    }
  }
  files['sitemap.xml'] = sitemapIndex(index);
  return files;
}
