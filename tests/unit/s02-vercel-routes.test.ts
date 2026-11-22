import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface Header { key: string; value: string }
interface Config {
  trailingSlash?: boolean;
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: Header[] }[];
}
const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as Config;

describe('W25-S02: vercel.json', () => {
  it('nie ma reguły przepisującej każdy adres', () => {
    expect(config.rewrites.some((r) => r.source === '/(.*)' || r.source === '/:path*')).toBe(false);
  });

  it('każda trasa z App.tsx (poza *) jest objęta regułą', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]!).filter((p) => p !== '*');
    expect(paths.length).toBeGreaterThan(5);
    const sources = new Set(config.rewrites.map((r) => r.source));
    for (const p of paths) expect(sources.has(p), `brak reguły dla ${p}`).toBe(true);
  });

  it('trailingSlash jest wyłączony', () => {
    expect(config.trailingSlash).toBe(false);
  });

  it('nagłówki bezpieczeństwa bez zmian', () => {
    const all = config.headers.find((h) => h.source === '/(.*)')!.headers;
    const by = Object.fromEntries(all.map((h) => [h.key, h.value]));
    expect(Object.keys(by).sort()).toEqual([
      'Content-Security-Policy', 'Permissions-Policy', 'Referrer-Policy',
      'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options',
    ]);
    expect(by['X-Frame-Options']).toBe('DENY');
    expect(by['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload');
    expect(by['Content-Security-Policy']).toContain("default-src 'self'");
  });

  it('strony testowe i /design mają noindex', () => {
    for (const source of ['/__test/(.*)', '/design']) {
      const h = config.headers.find((x) => x.source === source);
      expect(h?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
    }
  });

  it('public/404.html: noindex, linki, bez skryptów', () => {
    const html = readFileSync('public/404.html', 'utf8');
    expect(html).toContain('name="robots" content="noindex"');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/mapa"');
    expect(html).not.toContain('<script');
  });
});
