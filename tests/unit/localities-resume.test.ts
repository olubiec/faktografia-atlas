import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createPageStore, fetchAllPrngFeatures, parseArgs, PartialFetchError, slimFeature } from '../../scripts/geo/localities.mjs';

// Strona odpowiedzi PRNG: `count` miejscowości, numberMatched = 5 (3 strony po 2)
const page = (count: number, start: number) => ({
  numberMatched: 5,
  features: Array.from({ length: count }, (_, i) => ({
    properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'wieś', idPRNG: start + i, nazwaGlowna: `M${start + i}`, terytGminy: '1217011', zbedne: 'x'.repeat(50) },
    geometry: { type: 'Point', coordinates: [20, 49] },
  })),
});

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'prng-pages-'));

describe('PRNG: wznawianie pobierania (CC5.3c)', () => {
  it('slimFeature zostawia tylko pola używane przez parser', () => {
    const slim = slimFeature(page(1, 0).features[0]);
    expect(Object.keys(slim.properties).sort()).toEqual(['idPRNG', 'kategoriaObiektu', 'nazwaGlowna', 'rodzajObiektu', 'terytGminy']);
    expect(slim.geometry).toEqual({ type: 'Point', coordinates: [20, 49] });
    expect(slimFeature({ properties: { kategoriaObiektu: 'rzeka', rodzajObiektu: 'rzeka', nazwaGlowna: 'Wisła' } })).toEqual({ properties: { kategoriaObiektu: 'rzeka', rodzajObiektu: 'rzeka' } });
  });

  it('drugie uruchomienie pobiera tylko brakujące strony', async () => {
    const store = createPageStore(tmpDir());
    const first = vi.fn<(url: string) => Promise<unknown>>()
      .mockResolvedValueOnce(page(2, 0))
      .mockRejectedValueOnce(new Error('HTTP 503'));
    await expect(fetchAllPrngFeatures({ limit: 2, concurrency: 1, fetchJson: first, waitTurn: async () => {}, pageStore: store })).rejects.toThrow('HTTP 503');
    expect(store.has(0)).toBe(true);
    expect(store.has(1)).toBe(false);

    const second = vi.fn<(url: string) => Promise<unknown>>()
      .mockResolvedValueOnce(page(2, 2))
      .mockResolvedValueOnce(page(1, 4));
    const features = await fetchAllPrngFeatures({ limit: 2, concurrency: 1, fetchJson: second, waitTurn: async () => {}, pageStore: store });
    expect(second).toHaveBeenCalledTimes(2);
    expect(second.mock.calls[0][0]).toContain('offset=2');
    expect(features.map((f: { properties: { idPRNG: number } }) => f.properties.idPRNG)).toEqual([0, 1, 2, 3, 4]);
  });

  it('po przekroczeniu limitu czasu zgłasza PartialFetchError, a pobrane strony zostają', async () => {
    const store = createPageStore(tmpDir());
    let t = 0;
    const fetchJson = vi.fn<(url: string) => Promise<unknown>>().mockImplementation(async () => {
      t += 1000;
      return page(2, 0);
    });
    await expect(
      fetchAllPrngFeatures({ limit: 2, concurrency: 1, fetchJson, waitTurn: async () => {}, pageStore: store, deadline: 500, now: () => t }),
    ).rejects.toBeInstanceOf(PartialFetchError);
    expect(store.has(0)).toBe(true);
  });

  it('parseArgs czyta --pages-dir, --time-budget-min i --timeout-ms', () => {
    const args = parseArgs(['--pages-dir', '/tmp/x', '--time-budget-min', '100', '--timeout-ms', '60000']);
    expect(args.pagesDir).toBe(path.resolve('/tmp/x'));
    expect(args.timeBudgetMin).toBe(100);
    expect(args.timeoutMs).toBe(60000);
  });
});
