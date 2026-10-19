import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadIndicatorValues, resetValuesCache } from '../../src/core/data/load-values';

describe('loadIndicatorValues (CC8.2a-1)', () => {
  beforeEach(() => {
    resetValuesCache();
  });

  it('pobiera /data/values/<id>.json i keszuje wynik', async () => {
    const fakeData = {
      indicatorId: 'population',
      years: [2022, 2023],
      values: { '0201000': [100, 105] },
      fetchedAt: '2026-01-01T00:00:00.000Z',
    };

    const fetchSpy = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData),
    } as Response);

    const val1 = await loadIndicatorValues('population', fetchSpy);
    expect(val1).toEqual(fakeData);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('/data/values/population.json');

    const val2 = await loadIndicatorValues('population', fetchSpy);
    expect(val2).toEqual(fakeData);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // brak drugiego zapytania!
  });

  it('zwraca null bez wyjątku dla błędu 404 lub błędu sieci', async () => {
    const fetch404 = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const val404 = await loadIndicatorValues('unknown', fetch404);
    expect(val404).toBeNull();

    const fetchError = vi.fn<typeof fetch>().mockRejectedValue(new Error('Network error'));
    const valError = await loadIndicatorValues('network-err', fetchError);
    expect(valError).toBeNull();
  });
});
