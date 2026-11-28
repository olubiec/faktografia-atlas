import { readdirSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import * as sm from '../../src/core/seo/sitemap-diff';
// @ts-expect-error – moduł .mjs bez typów (skrypt narzędziowy)
import { runIndexNow } from '../../scripts/seo/indexnow.mjs';

const SITE = 'https://faktografia.eu';
// Klucz IndexNow jest publiczny, ale nie wpisujemy go na sztywno (skaner sekretów): bierzemy nazwę pliku z public/.
const KEY = (readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f)) ?? '').replace(/\.txt$/, '');
const urlset = (rows: [string, string?][]) =>
  `<urlset>${rows.map(([l, m]) => `<url><loc>${l}</loc>${m ? `<lastmod>${m}</lastmod>` : ''}</url>`).join('')}</urlset>`;

type Call = { url: string; body?: { urlList: string[] } };
function makeFetch(keyBody: string, postStatus = 200, fail = false) {
  const calls: Call[] = [];
  const fetch = vi.fn<(url: string, init?: { body?: string }) => Promise<unknown>>(async (url, init) => {
    if (url.endsWith('.txt')) return { ok: true, status: 200, text: async () => keyBody };
    if (fail) throw new Error('sieć padła');
    calls.push({ url, body: JSON.parse(init?.body ?? '{}') });
    return { ok: true, status: postStatus, text: async () => '' };
  });
  return { fetch, calls };
}

describe('S17 allUrls', () => {
  it('zwraca wszystkie adresy z kilku sklejonych plików, każdy raz', () => {
    const xml = [urlset([[`${SITE}/`], [`${SITE}/a`, '2026-01-01']]), urlset([[`${SITE}/a`, '2026-01-01'], [`${SITE}/b`]])].join('\n');
    expect(sm.allUrls(xml)).toEqual([`${SITE}/`, `${SITE}/a`, `${SITE}/b`]);
  });
});

describe('S17 runIndexNow', () => {
  const run = (extra: Record<string, unknown>) => runIndexNow({ siteUrl: SITE, key: KEY, sm, ...extra });

  it('brak starej migawki = wszystkie adresy w paczkach ≤ limit', async () => {
    const rows = Array.from({ length: 25 }, (_, i): [string] => [`${SITE}/p${i}`]);
    const { fetch, calls } = makeFetch(KEY);
    const small = { ...sm, batches: <T,>(items: readonly T[]) => sm.batches(items, 10) };
    const summary = vi.fn<(line: string) => void>();
    const res = await run({ oldXml: null, newXml: urlset(rows), fetch, sm: small, summary });
    expect(res).toMatchObject({ mode: 'start', count: 25, codes: [200, 200, 200] });
    expect(calls.map((c) => c.body?.urlList.length)).toEqual([10, 10, 5]);
    expect(summary).toHaveBeenCalledWith(expect.stringContaining('tryb start, 25 adresów'));
  });

  it('obecna migawka = tylko zmienione adresy', async () => {
    const oldXml = urlset([[`${SITE}/a`, '1'], [`${SITE}/b`, '1']]);
    const newXml = urlset([[`${SITE}/a`, '1'], [`${SITE}/b`, '2']]);
    const { fetch, calls } = makeFetch(KEY);
    const res = await run({ oldXml, newXml, fetch });
    expect(res.mode).toBe('zmiany');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.body?.urlList).toEqual([`${SITE}/b`]);
  });

  it('plik klucza zwraca coś innego = nic nie wysłane, jest ostrzeżenie', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { fetch, calls } = makeFetch('<html>404</html>');
    const res = await run({ oldXml: null, newXml: urlset([[`${SITE}/a`]]), fetch });
    expect(res).toBeNull();
    expect(calls).toHaveLength(0);
    expect(log.mock.calls.flat().join('\n')).toContain(`::warning::IndexNow: plik klucza ${SITE}/${KEY}.txt`);
    log.mockRestore();
  });

  it('błąd sieci przy wysyłce = ostrzeżenie, nie wyjątek', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { fetch } = makeFetch(KEY, 200, true);
    await expect(run({ oldXml: null, newXml: urlset([[`${SITE}/a`]]), fetch })).resolves.toMatchObject({ codes: ['błąd sieci'] });
    expect(log.mock.calls.flat().join('\n')).toContain('::warning::IndexNow: błąd sieci przy wysyłce');
    log.mockRestore();
  });
});
