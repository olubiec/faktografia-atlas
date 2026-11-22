import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const robots = read('public/robots.txt');
const sitemap = read('public/sitemap.xml');
const html = read('index.html');
const app = read('src/App.tsx');

describe('S01: robots.txt', () => {
  const lines = robots.split(/\r?\n/).map((l) => l.trim());

  it('wskazuje mapę strony', () => {
    expect(lines).toContain('Sitemap: https://faktografia.eu/sitemap.xml');
  });
  it('nie blokuje całej strony ani danych', () => {
    expect(lines).not.toContain('Disallow: /');
    expect(robots).not.toMatch(/Disallow:\s*\/(data|geo)/);
  });
  it('blokuje tylko strony techniczne', () => {
    expect(lines).toContain('Allow: /');
    expect(lines).toContain('Disallow: /__test/');
    expect(lines).toContain('Disallow: /design');
  });
});

describe('S01: sitemap.xml', () => {
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

  it('jest poprawnym XML z 5 adresami', () => {
    expect(sitemap.startsWith('<?xml')).toBe(true);
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap.trimEnd().endsWith('</urlset>')).toBe(true);
    expect((sitemap.match(/<url>/g) ?? []).length).toBe(5);
    expect((sitemap.match(/<\/url>/g) ?? []).length).toBe(5);
    expect(locs).toHaveLength(5);
  });
  it('adresy są pełne, a ścieżki istnieją w App.tsx', () => {
    for (const loc of locs) {
      expect(loc.startsWith('https://faktografia.eu/')).toBe(true);
      const p = new URL(loc).pathname;
      expect(app).toContain(`path="${p}"`);
    }
  });
  it('nie ma lastmod', () => {
    expect(sitemap).not.toContain('lastmod');
  });
});

describe('S01: index.html', () => {
  const meta = (attr: string, name: string) =>
    [...html.matchAll(/<meta\b[^>]*>/g)]
      .map((m) => m[0])
      .find((tag) => new RegExp(`${attr}="${name}"`).test(tag));
  const content = (tag?: string) => tag?.match(/content="([^"]*)"/)?.[1] ?? '';
  const start = html.indexOf('<div id="root">');
  const rootHtml = html.slice(start, html.indexOf('</div>', start));

  it('ma język polski', () => {
    expect(html).toMatch(/<html[^>]*lang="pl"/);
  });
  it('ma opis 70–160 znaków oznaczony data-fallback', () => {
    const tag = meta('name', 'description');
    expect(tag).toContain('data-fallback');
    const len = content(tag).length;
    expect(len).toBeGreaterThanOrEqual(70);
    expect(len).toBeLessThanOrEqual(160);
  });
  it('ma og:site_name, og:locale i og:type', () => {
    expect(content(meta('property', 'og:site_name'))).toBe('Faktografia');
    expect(content(meta('property', 'og:locale'))).toBe('pl_PL');
    expect(content(meta('property', 'og:type'))).toBe('website');
  });
  it('tagi ustawiane też przez PageMeta mają data-fallback', () => {
    for (const p of ['og:title', 'og:description', 'og:type']) {
      expect(meta('property', p)).toContain('data-fallback');
    }
  });
  it('treść zastępcza ma h1 i co najmniej 3 linki wewnętrzne', () => {
    expect(rootHtml).toContain('<h1>');
    const links = [...rootHtml.matchAll(/<a\s+href="(\/[^"]*)"/g)];
    expect(links.length).toBeGreaterThanOrEqual(3);
  });
});
