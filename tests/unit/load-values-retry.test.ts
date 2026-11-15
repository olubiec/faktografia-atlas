import { describe, it, expect, vi } from 'vitest';
import { loadIndicatorValues, resetValuesCache } from '../../src/core/data/load-values';

const data = {
  indicatorId: 'population',
  years: [2022, 2023],
  values: { '0201000': [100, 105] },
  fetchedAt: '2026-01-01T00:00:00.000Z',
};
const okResponse = { ok: true, status: 200, json: () => Promise.resolve(data) } as Response;

describe('loadIndicatorValues – ponowienie po chwilowym błędzie (N-05)', () => {
  it('odrzucony fetch nie jest zapamiętany: druga próba pobiera plik', async () => {
    resetValuesCache();
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(okResponse);
    expect(await loadIndicatorValues('population', fetchSpy)).toBeNull();
    expect(await loadIndicatorValues('population', fetchSpy)).toEqual(data);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('status 503 nie jest zapamiętany: druga próba pobiera plik', async () => {
    resetValuesCache();
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(okResponse);
    expect(await loadIndicatorValues('population', fetchSpy)).toBeNull();
    expect(await loadIndicatorValues('population', fetchSpy)).toEqual(data);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('404 jest zapamiętany: druga próba bez nowego żądania', async () => {
    resetValuesCache();
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValue({ ok: false, status: 404 } as Response);
    expect(await loadIndicatorValues('missing', fetchSpy)).toBeNull();
    expect(await loadIndicatorValues('missing', fetchSpy)).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('po udanym pobraniu kolejne wywołania nie robią żądań', async () => {
    resetValuesCache();
    const fetchSpy = vi.fn<typeof fetch>().mockResolvedValue(okResponse);
    await loadIndicatorValues('population', fetchSpy);
    await loadIndicatorValues('population', fetchSpy);
    await loadIndicatorValues('population', fetchSpy);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('dwa równoległe wywołania przy błędzie sieci dają jedno żądanie i oba null', async () => {
    resetValuesCache();
    const fetchSpy = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    const [a, b] = await Promise.all([
      loadIndicatorValues('population', fetchSpy),
      loadIndicatorValues('population', fetchSpy),
    ]);
    expect(a).toBeNull();
    expect(b).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
