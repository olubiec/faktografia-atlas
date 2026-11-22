import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { batches, changedUrls } from '../../src/core/seo/sitemap-diff';

const urlset = (items: [string, string][]) =>
  `<urlset>${items.map(([u, d]) => `<url><loc>https://faktografia.eu${u}</loc><lastmod>${d}</lastmod></url>`).join('')}</urlset>`;
const base: [string, string][] = Array.from({ length: 10 }, (_, i) => [`/p/${i}`, '2026-11-01']);

describe('W25-S11: różnica map strony', () => {
  it('zmiana lastmod 3 adresów daje dokładnie te 3', () => {
    const next = base.map(([u, d], i): [string, string] => (i < 3 ? [u, '2026-11-17'] : [u, d]));
    expect(changedUrls(urlset(base), urlset(next))).toEqual([
      'https://faktografia.eu/p/0',
      'https://faktografia.eu/p/1',
      'https://faktografia.eu/p/2',
    ]);
  });

  it('nowy adres jest na liście, usunięty jest pomijany', () => {
    const next: [string, string][] = [...base.slice(1), ['/p/nowy', '2026-11-17']];
    expect(changedUrls(urlset(base), urlset(next))).toEqual(['https://faktografia.eu/p/nowy']);
  });

  it('identyczne pliki dają pustą listę', () => {
    expect(changedUrls(urlset(base), urlset(base))).toEqual([]);
  });

  it('25 000 adresów to 3 paczki po najwyżej 10 000', () => {
    const list = Array.from({ length: 25_000 }, (_, i) => `u${i}`);
    const parts = batches(list);
    expect(parts.map((p) => p.length)).toEqual([10_000, 10_000, 5_000]);
  });

  it('plik klucza IndexNow: 32 znaki szesnastkowe, treść = nazwa pliku', () => {
    const file = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f))!;
    expect(file).toBeTruthy();
    expect(readFileSync(`public/${file}`, 'utf8').trim()).toBe(file.replace('.txt', ''));
  });
});
