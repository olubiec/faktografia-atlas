import { describe, expect, it } from 'vitest';
import { buildSitemaps, type SitemapPage } from '../../src/core/seo/sitemap';

const pages: SitemapPage[] = [
  { path: '/powiat/a', indexable: true, lastmod: '2026-11-17T10:00:00Z', group: 'wojewodztwa-powiaty' },
  { path: '/powiat/b', indexable: false, lastmod: '2026-11-17T10:00:00Z', group: 'wojewodztwa-powiaty' },
  { path: '/gmina/c', indexable: true, lastmod: '2026-11-17T10:00:00Z', group: 'gminy' },
];
const opts = { indexGminy: false, lastmod: '2026-11-17T10:00:00Z' };
const get = (files: { name: string; xml: string }[], name: string) => files.find((f) => f.name === name);

describe('W25-S07: mapa strony', () => {
  it('tylko strony indeksowane, adresy absolutne, data danych', () => {
    const files = buildSitemaps(pages, ['/', '/mapa'], opts);
    const xml = get(files, 'sitemap-wojewodztwa-powiaty.xml')!.xml;
    expect(xml).toContain('<loc>https://faktografia.eu/powiat/a</loc>');
    expect(xml).not.toContain('/powiat/b');
    expect(xml).toContain('<lastmod>2026-11-17</lastmod>');
    for (const f of files) {
      for (const m of f.xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(m[1]).toMatch(/^https:\/\/faktografia\.eu\//);
    }
  });

  it('indexGminy=false: bez pliku gmin w indeksie; true: jest', () => {
    const off = buildSitemaps(pages, ['/'], opts);
    expect(get(off, 'sitemap-gminy.xml')).toBeUndefined();
    expect(get(off, 'sitemap.xml')!.xml).not.toContain('sitemap-gminy');
    const on = buildSitemaps(pages, ['/'], { ...opts, indexGminy: true });
    expect(get(on, 'sitemap-gminy.xml')!.xml).toContain('/gmina/c');
    expect(get(on, 'sitemap.xml')!.xml).toContain('https://faktografia.eu/sitemap-gminy.xml');
  });

  it('pliki są poprawnym XML, dzielone po 50 000 adresów', () => {
    const many: SitemapPage[] = Array.from({ length: 50_001 }, (_, i) => ({ path: `/gmina/g${i}`, indexable: true, lastmod: opts.lastmod, group: 'gminy' as const }));
    const files = buildSitemaps(many, ['/'], { ...opts, indexGminy: true });
    expect(get(files, 'sitemap-gminy.xml')!.xml.match(/<url>/g)).toHaveLength(50_000);
    expect(get(files, 'sitemap-gminy-2.xml')!.xml.match(/<url>/g)).toHaveLength(1);
    for (const f of files.slice(0, 2)) {
      expect(f.xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(f.xml.trim().endsWith('>')).toBe(true);
    }
  });
});
