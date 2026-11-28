import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accessToken, SCOPE_WRITE } from '../../scripts/seo/gsc-client.mjs';
import { renderSummary, sitemapUrls, statusRow, submitSitemaps } from '../../scripts/seo/gsc-submit-sitemap.mjs';
import { sitemapLocs } from '../../src/core/seo/sitemap-diff';

const MAP = 'https://faktografia.eu/sitemap.xml';
const API = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:faktografia.eu')}/sitemaps/${encodeURIComponent(MAP)}`;
// Kształt odpowiedzi sitemaps.get z API Search Console.
const STATUS = {
  path: MAP,
  lastDownloaded: '2026-11-28T10:00:00.000Z',
  isPending: false,
  errors: '0',
  warnings: '2',
  contents: [{ type: 'web', submitted: '1200', indexed: '0' }, { type: 'web', submitted: '300' }],
};
const json = (body: unknown, status = 200) => new Response(body === undefined ? '' : JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe('W35-S14 wysyłka mapy', () => {
  it('PUT na zakodowany adres mapy, potem GET i status', async () => {
    const calls: { url: string; method: string }[] = [];
    vi.stubGlobal('fetch', async (url: string, init: { method: string }) => {
      calls.push({ url, method: init.method });
      return init.method === 'PUT' ? json(undefined) : json(STATUS);
    });
    const summary = vi.fn<(msg: string) => void>();
    const log = vi.fn<(msg: string) => void>();
    expect(await submitSitemaps({ token: 't', urls: [MAP], log, summary })).toBe(0);
    expect(calls).toEqual([{ url: API, method: 'PUT' }, { url: API, method: 'GET' }]);
    expect(API).toContain('https%3A%2F%2Ffaktografia.eu%2Fsitemap.xml');
    expect(summary.mock.calls[0]?.[0]).toContain(`| ${MAP} | nie | 2026-11-28T10:00:00.000Z | 0 | 2 | 1500 |`);
  });

  it('mapuje pola odpowiedzi na wiersz podsumowania', () => {
    const row = statusRow(MAP, STATUS);
    expect(row).toEqual({ url: MAP, pending: false, lastDownloaded: STATUS.lastDownloaded, errors: 0, warnings: 2, urls: 1500 });
    expect(renderSummary([row])).toContain('| Mapa | Oczekuje |');
  });

  it('wysyła też pliki z indeksu', async () => {
    const index = '<sitemapindex><sitemap><loc>https://faktografia.eu/sitemap-1.xml</loc></sitemap></sitemapindex>';
    expect(await sitemapUrls('https://faktografia.eu', sitemapLocs, async () => index)).toEqual([MAP, 'https://faktografia.eu/sitemap-1.xml']);
  });

  it('403 przy PUT → ostrzeżenie z instrukcją i kod 0', async () => {
    vi.stubGlobal('fetch', async () => json({ error: 'forbidden' }, 403));
    const log = vi.fn<(msg: string) => void>();
    expect(await submitSitemaps({ token: 't', urls: [MAP], log })).toBe(0);
    const out = log.mock.calls.map((c) => c[0]).join('\n');
    expect(out).toContain('::warning::');
    expect(out).toContain('Pełny');
    expect(out).toContain('docs/SEO-AUTOMAT.md §5');
  });

  it('brak sekretu → komunikat i kod 0, bez fragmentu klucza', () => {
    const env = { ...process.env, GSC_SERVICE_ACCOUNT: '' };
    const res = spawnSync('node', [path.resolve('scripts/seo/gsc-submit-sitemap.mjs')], { env, encoding: 'utf8' });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Brak sekretu GSC_SERVICE_ACCOUNT');
  });

  it('zły sekret nie trafia do komunikatu', () => {
    const env = { ...process.env, GSC_SERVICE_ACCOUNT: '{"private_key":"SEKRETNYFRAGMENT"' };
    const res = spawnSync('node', [path.resolve('scripts/seo/gsc-submit-sitemap.mjs')], { env, encoding: 'utf8' });
    expect(`${res.stdout}${res.stderr}`).not.toContain('SEKRETNYFRAGMENT');
  });
});

describe('W35-S14 klient: zakresy', () => {
  async function scopeOf(...args: unknown[]) {
    const { generateKeyPairSync } = await import('node:crypto');
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const account = { client_email: 'a@b.c', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
    let assertion = '';
    vi.stubGlobal('fetch', async (_u: string, init: { body: URLSearchParams }) => {
      assertion = init.body.get('assertion') ?? '';
      return json({ access_token: 'x' });
    });
    await (accessToken as (...a: unknown[]) => Promise<string>)(account, ...args);
    return JSON.parse(Buffer.from(assertion.split('.')[1] ?? '', 'base64url').toString()).scope;
  }

  it('bez argumentu nadal webmasters.readonly', async () => {
    expect(await scopeOf()).toBe('https://www.googleapis.com/auth/webmasters.readonly');
  });

  it('z zakresem zapisu prosi o webmasters', async () => {
    expect(await scopeOf(SCOPE_WRITE)).toBe('https://www.googleapis.com/auth/webmasters');
  });
});
