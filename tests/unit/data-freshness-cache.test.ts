import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFreshnessLabel } from '../../src/core/freshness/freshness-label';
import { loadIndicatorValues, resetValuesCache } from '../../src/core/data/load-values';
import type { IndicatorValues } from '../../src/core/profile/profile';

const NOW = new Date('2026-06-01T12:00:00Z');

describe('loadFreshnessLabel', () => {
  beforeEach(() => resetValuesCache());
  afterEach(() => {
    vi.unstubAllGlobals();
    resetValuesCache();
  });

  it('(a) z atrapą zwracającą fetchedAt daje etykietę z datą', async () => {
    const load = vi.fn<typeof loadIndicatorValues>().mockResolvedValue({ fetchedAt: '2026-05-20T10:00:00Z' } as IndicatorValues);
    expect(await loadFreshnessLabel(load, NOW)).toBe('Dane GUS odświeżone: 20.05.2026');
    expect(load).toHaveBeenCalledWith('density');
  });

  it('(b) brak pliku (null) daje null', async () => {
    const load = vi.fn<typeof loadIndicatorValues>().mockResolvedValue(null);
    expect(await loadFreshnessLabel(load, NOW)).toBeNull();
  });

  it('(c) dwa wywołania z prawdziwym loadIndicatorValues = 1 żądanie fetch', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        years: [2024],
        values: { '02': { '2024': 1 } },
        fetchedAt: '2026-05-20T10:00:00Z',
      }),
    }) as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    const first = await loadFreshnessLabel(undefined, NOW);
    const second = await loadFreshnessLabel(undefined, NOW);
    expect(first).toBe('Dane GUS odświeżone: 20.05.2026');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
