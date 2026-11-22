import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import seo from '../../config/seo.json';
import { buildSitemaps, isIndexed, MAX_URLS_PER_FILE, type SitemapPage } from '../../src/core/seo/sitemap';

const LASTMOD = '2026-11-17T10:24:24.317Z';
const STATIC = ['/', '/mapa', '/o-projekcie', '/zrodla', '/prywatnosc'];
const page = (path: string, level: SitemapPage['level'], indexable = true): SitemapPage => ({
  path,
  level,
  indexable,
  lastmod: LASTMOD,
});
const PAGES: SitemapPage[] = [
  page('/wojewodztwo/malopolskie', 'woj'),
  page('/powiat/krakowski', 'pow'),
  page('/powiat/pusty', 'pow', false),
  page('/miasto/krakow', 'pow'),
  page('/gmina/wieliczka', 'gmi'),
];

const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

/** Prosty sprawdzian poprawności XML: nagłówek, zrównoważone znaczniki, bez surowych & i <. */
function expectWellFormed(xml: string, root: 'urlset' | 'sitemapindex') {
  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
  expect(xml).toContain(`<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
  expect(xml.trimEnd().endsWith(`</${root}>`)).toBe(true);
  const stack: string[] = [];
  const mismatched: string[] = [];
  for (const m of xml.replace(/^<\?xml[^>]*\?>/, '').matchAll(/<(\/?)([a-z]+)[^>]*>/gi)) {
    if (!m[1]) stack.push(m[2]);
    else if (stack.pop() !== m[2]) mismatched.push(m[2]);
  }
  expect(mismatched).toEqual([]);
  expect(stack).toEqual([]);
  expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
}

describe('S07 config/seo.json (D7)', () => {
  it('gminy są na razie poza indeksem', () => {
    expect(seo).toEqual({ indexGminy: false });
  });

  it('isIndexed: gmina tylko przy indexGminy, reszta wg indexable', () => {
    expect(isIndexed(page('/gmina/x', 'gmi'), { indexGminy: false })).toBe(false);
    expect(isIndexed(page('/gmina/x', 'gmi'), { indexGminy: true })).toBe(true);
    expect(isIndexed(page('/powiat/x', 'pow', false), { indexGminy: true })).toBe(false);
    expect(isIndexed(page('/powiat/x', 'pow'), { indexGminy: false })).toBe(true);
  });
});

describe('S07 mapa strony', () => {
  const files = buildSitemaps(PAGES, STATIC, { indexGminy: false });

  it('indeks wskazuje pliki z adresami absolutnymi; bez pustego pliku gmin', () => {
    expectWellFormed(files['sitemap.xml'], 'sitemapindex');
    expect(locs(files['sitemap.xml'])).toEqual([
      'https://faktografia.eu/sitemap-strony.xml',
      'https://faktografia.eu/sitemap-wojewodztwa-powiaty.xml',
    ]);
    expect(files['sitemap-gminy.xml']).toBeUndefined();
  });

  it('strony stałe i jednostki to poprawny XML z adresami https://faktografia.eu', () => {
    for (const name of ['sitemap-strony.xml', 'sitemap-wojewodztwa-powiaty.xml']) {
      expectWellFormed(files[name], 'urlset');
      for (const loc of locs(files[name])) expect(loc).toMatch(/^https:\/\/faktografia\.eu\//);
    }
    expect(locs(files['sitemap-strony.xml'])).toEqual(STATIC.map((p) => `https://faktografia.eu${p}`));
  });

  it('tylko indeksowane; lastmod = data danych', () => {
    const units = files['sitemap-wojewodztwa-powiaty.xml'];
    expect(locs(units)).toEqual([
      'https://faktografia.eu/wojewodztwo/malopolskie',
      'https://faktografia.eu/powiat/krakowski',
      'https://faktografia.eu/miasto/krakow',
    ]);
    expect(units).not.toContain('/powiat/pusty');
    expect(units).not.toContain('/gmina/');
    expect((units.match(/<lastmod>2026-11-17<\/lastmod>/g) ?? []).length).toBe(3);
  });

  it('indexGminy:true → osobny plik gmin w indeksie', () => {
    const on = buildSitemaps(PAGES, STATIC, { indexGminy: true });
    expect(locs(on['sitemap.xml'])).toContain('https://faktografia.eu/sitemap-gminy.xml');
    expect(locs(on['sitemap-gminy.xml'])).toEqual(['https://faktografia.eu/gmina/wieliczka']);
  });

  it('dzieli pliki powyżej 50 000 adresów', () => {
    expect(MAX_URLS_PER_FILE).toBe(50_000);
    const many = Array.from({ length: 50_001 }, (_, i) => page(`/gmina/g-${i}`, 'gmi'));
    const out = buildSitemaps(many, STATIC, { indexGminy: true });
    expect(locs(out['sitemap-gminy.xml'])).toHaveLength(50_000);
    expect(locs(out['sitemap-gminy-2.xml'])).toEqual(['https://faktografia.eu/gmina/g-50000']);
    expect(locs(out['sitemap.xml'])).toContain('https://faktografia.eu/sitemap-gminy-2.xml');
  });

  it('znaki specjalne w adresie są zakodowane jako encje XML', () => {
    const out = buildSitemaps([page('/powiat/a&b', 'pow')], [], { indexGminy: false });
    expectWellFormed(out['sitemap-wojewodztwa-powiaty.xml'], 'urlset');
    expect(out['sitemap-wojewodztwa-powiaty.xml']).toContain('/powiat/a&amp;b');
  });

  it('adresy w public/sitemap.xml (S01) służą jako lista stron stałych', () => {
    const s01 = locs(readFileSync('public/sitemap.xml', 'utf8'));
    expect(s01).toEqual(STATIC.map((p) => `https://faktografia.eu${p}`));
  });
});
