import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Header = { key: string; value: string };
type Config = {
  trailingSlash?: boolean;
  headers: { source: string; headers: Header[] }[];
  rewrites: { source: string; destination: string }[];
};

const config: Config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const app = readFileSync('src/App.tsx', 'utf8');
const notFound = readFileSync('public/404.html', 'utf8');

// Wartości sprzed zmiany (S02 nie rusza nagłówków bezpieczeństwa).
const SECURITY: Header[] = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; object-src 'none'; base-uri 'self';",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const routePaths = [...app.matchAll(/<Route path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== '*');

// `/` serwuje Vercel z index.html bez reguły.
const covered = (path: string) =>
  path === '/' || config.rewrites.some((r) => new RegExp(`^${r.source}$`).test(path));

describe('S02 vercel.json', () => {
  it('nie przepisuje wszystkiego na index.html', () => {
    expect(config.rewrites.some((r) => r.source === '/(.*)' || r.source === '/:path*')).toBe(false);
  });

  it('znajduje trasy w App.tsx', () => {
    expect(routePaths.length).toBeGreaterThan(5);
  });

  it.each(routePaths)('trasa %s jest objęta regułą', (path) => {
    expect(covered(path)).toBe(true);
  });

  it('nieistniejący adres nie jest objęty regułą (dostaje 404)', () => {
    expect(covered('/nie-ma-takiej')).toBe(false);
    expect(covered('/mapa/x')).toBe(false);
  });

  it('trailingSlash jest wyłączony', () => {
    expect(config.trailingSlash).toBe(false);
  });

  it('nagłówki bezpieczeństwa są bez zmian', () => {
    const all = config.headers.find((h) => h.source === '/(.*)');
    expect(all?.headers).toEqual(SECURITY);
  });

  it('strony testowe i /design mają noindex', () => {
    for (const source of ['/__test/(.*)', '/design']) {
      const rule = config.headers.find((h) => h.source === source);
      expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
    }
  });
});

describe('S02 public/404.html', () => {
  it('ma noindex, linki do / i /mapa, bez skryptów', () => {
    expect(notFound).toContain('<meta name="robots" content="noindex">');
    expect(notFound).toContain('href="/"');
    expect(notFound).toContain('href="/mapa"');
    expect(notFound).not.toContain('<script');
    expect(notFound).toContain('Nie ma takiej strony');
  });
});
