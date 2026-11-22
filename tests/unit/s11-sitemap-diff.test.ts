import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  batches,
  changedUrls,
  INDEXNOW_BATCH,
  parseSitemap,
  sitemapLocs,
} from '../../src/core/seo/sitemap-diff';

const urlset = (rows: [string, string?][]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows
    .map(([loc, lastmod]) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>\n`)
    .join('')}</urlset>\n`;

const BASE: [string, string?][] = [
  ['https://faktografia.eu/'],
  ['https://faktografia.eu/mapa'],
  ['https://faktografia.eu/wojewodztwo/malopolskie', '2026-11-01'],
  ['https://faktografia.eu/powiat/krakowski', '2026-11-01'],
  ['https://faktografia.eu/powiat/wielicki', '2026-11-01'],
  ['https://faktografia.eu/miasto/krakow', '2026-11-01'],
  ['https://faktografia.eu/gmina/wieliczka', '2026-11-01'],
];

describe('S11 changedUrls', () => {
  it('zmiana lastmod 3 adresów → dokładnie te 3', () => {
    const changed = new Set(['/powiat/krakowski', '/miasto/krakow', '/gmina/wieliczka'].map((p) => `https://faktografia.eu${p}`));
    const next = BASE.map(([loc, lm]): [string, string?] => [loc, changed.has(loc) ? '2026-11-20' : lm]);
    expect(changedUrls(urlset(BASE), urlset(next)).sort()).toEqual([...changed].sort());
  });

  it('nowy adres → jest na liście; usunięty adres pomijany', () => {
    const next: [string, string?][] = [...BASE.slice(1), ['https://faktografia.eu/powiat/nowy', '2026-11-01']];
    expect(changedUrls(urlset(BASE), urlset(next))).toEqual(['https://faktografia.eu/powiat/nowy']);
  });

  it('identyczne pliki → pusta lista', () => {
    expect(changedUrls(urlset(BASE), urlset(BASE))).toEqual([]);
  });

  it('brak starej mapy (pierwszy przebieg) → wszystkie adresy są nowe', () => {
    expect(changedUrls('', urlset(BASE))).toHaveLength(BASE.length);
  });

  it('kolejność w pliku nie ma znaczenia; encje XML są dekodowane', () => {
    const amp: [string, string?][] = [['https://faktografia.eu/a?x=1&amp;y=2', '2026-11-01']];
    expect(changedUrls(urlset([...BASE].reverse()), urlset(BASE))).toEqual([]);
    expect(changedUrls('', urlset(amp))).toEqual(['https://faktografia.eu/a?x=1&y=2']);
  });

  it('kilka plików mapy strony sklejonych w jeden tekst czyta się razem', () => {
    const joined = urlset(BASE.slice(0, 3)) + urlset(BASE.slice(3));
    expect(parseSitemap(joined).size).toBe(BASE.length);
  });

  it('sitemapLocs czyta adresy plików z indeksu mapy strony', () => {
    const index = `<?xml version="1.0"?><sitemapindex><sitemap><loc>https://faktografia.eu/sitemap-strony.xml</loc></sitemap><sitemap><loc>https://faktografia.eu/sitemap-gminy.xml</loc><lastmod>2026-11-01</lastmod></sitemap></sitemapindex>`;
    expect(sitemapLocs(index)).toEqual([
      'https://faktografia.eu/sitemap-strony.xml',
      'https://faktografia.eu/sitemap-gminy.xml',
    ]);
  });
});

describe('S11 batches', () => {
  it('25 000 adresów → 3 paczki po najwyżej 10 000', () => {
    const urls = Array.from({ length: 25_000 }, (_, i) => `https://faktografia.eu/p/${i}`);
    const out = batches(urls);
    expect(INDEXNOW_BATCH).toBe(10_000);
    expect(out).toHaveLength(3);
    expect(out.map((b) => b.length)).toEqual([10_000, 10_000, 5_000]);
    expect(out.flat()).toEqual(urls);
  });

  it('brak zmian → zero paczek (nic nie wysyłamy)', () => {
    expect(batches([])).toEqual([]);
  });
});

describe('S11 plik klucza IndexNow', () => {
  it('public/<klucz>.txt: 32 znaki szesnastkowe, treść = nazwa pliku', () => {
    const dir = path.resolve(import.meta.dirname, '../../public');
    const keys = readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
    expect(keys).toHaveLength(1);
    const key = keys[0]!.replace(/\.txt$/, '');
    expect(readFileSync(path.join(dir, keys[0]!), 'utf8').trim()).toBe(key);
  });
});
