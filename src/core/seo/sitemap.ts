import { absoluteUrl } from './site';

export interface SitemapPage {
  path: string;
  indexable: boolean;
  lastmod: string;
  group: 'wojewodztwa-powiaty' | 'gminy';
}
export interface SitemapFile { name: string; xml: string }

const MAX_URLS = 50_000;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (iso: string) => iso.slice(0, 10);

function urlset(entries: { path: string; lastmod?: string }[]): string {
  const rows = entries
    .map((e) => `  <url><loc>${esc(absoluteUrl(e.path))}</loc>${e.lastmod ? `<lastmod>${day(e.lastmod)}</lastmod>` : ''}</url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

/**
 * Indeks mapy strony + pliki cząstkowe. Tylko strony `indexable`; gminy trafiają do mapy dopiero przy `indexGminy: true` (D7).
 * Pliki ponad 50 000 adresów są dzielone (sitemap-gminy-2.xml itd.).
 */
export function buildSitemaps(
  pages: readonly SitemapPage[],
  staticPaths: readonly string[],
  options: { indexGminy: boolean; lastmod: string },
): SitemapFile[] {
  const files: SitemapFile[] = [];
  const add = (base: string, entries: { path: string; lastmod?: string }[]) => {
    if (entries.length === 0) return;
    for (let i = 0; i * MAX_URLS < entries.length; i++) {
      const name = i === 0 ? `${base}.xml` : `${base}-${i + 1}.xml`;
      files.push({ name, xml: urlset(entries.slice(i * MAX_URLS, (i + 1) * MAX_URLS)) });
    }
  };
  add('sitemap-strony', staticPaths.map((path) => ({ path, lastmod: options.lastmod })));
  const list = (group: SitemapPage['group']) =>
    pages.filter((p) => p.indexable && p.group === group).map((p) => ({ path: p.path, lastmod: p.lastmod }));
  add('sitemap-wojewodztwa-powiaty', list('wojewodztwa-powiaty'));
  if (options.indexGminy) add('sitemap-gminy', list('gminy'));

  const index = files
    .map((f) => `  <sitemap><loc>${esc(absoluteUrl('/' + f.name))}</loc><lastmod>${day(options.lastmod)}</lastmod></sitemap>`)
    .join('\n');
  files.unshift({
    name: 'sitemap.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index}\n</sitemapindex>\n`,
  });
  return files;
}
