import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPartsShard, resetPartsCache, type PartsShard } from '../../src/core/data/load-parts';

describe('loadPartsShard (W1.19)', () => {
  beforeEach(() => {
    resetPartsCache();
  });

  it('dwa wywołania dla tego samego województwa = jedno żądanie', async () => {
    const fakeData: PartsShard = {
      voivodeship: '12',
      years: { population: [2022, 2023] },
      values: {
        '1201014': { population: [100, 105] },
        '1201015': { population: [200, 205] },
      },
    };

    const fetchSpy = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData),
    } as Response);

    const promise1 = loadPartsShard('12', fetchSpy);
    const promise2 = loadPartsShard('12', fetchSpy);

    const [res1, res2] = await Promise.all([promise1, promise2]);

    expect(res1).toEqual(fakeData);
    expect(res2).toEqual(fakeData);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('/data/parts/12.json');

    // Kolejne wywołanie po zakończeniu obietnicy też korzysta z pamięci podręcznej
    const res3 = await loadPartsShard('12', fetchSpy);
    expect(res3).toEqual(fakeData);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('404 → null (bez wyjątku)', async () => {
    const fetch404 = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const res = await loadPartsShard('99', fetch404);
    expect(res).toBeNull();
    expect(fetch404).toHaveBeenCalledTimes(1);
  });

  it('zły JSON lub niepoprawny kształt → null (bez wyjątku)', async () => {
    const fetchInvalidJson = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Invalid JSON')),
    } as Response);

    const resInvalidJson = await loadPartsShard('12', fetchInvalidJson);
    expect(resInvalidJson).toBeNull();

    resetPartsCache();

    const fetchWrongShape = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalidKey: 'abc' }),
    } as Response);

    const resWrongShape = await loadPartsShard('12', fetchWrongShape);
    expect(resWrongShape).toBeNull();
  });

  it('poprawny kształt przechodzi', async () => {
    const fakeData: PartsShard = {
      voivodeship: '14',
      years: { indicatorA: [2020] },
      values: {
        '1401014': { indicatorA: [50] },
      },
    };

    const fetchSpy = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData),
    } as Response);

    const res = await loadPartsShard('14', fetchSpy);
    expect(res).toEqual(fakeData);
    expect(res?.voivodeship).toBe('14');
  });

  it('różne województwa = różne żądania', async () => {
    const fakeData12: PartsShard = {
      voivodeship: '12',
      years: {},
      values: {},
    };

    const fakeData14: PartsShard = {
      voivodeship: '14',
      years: {},
      values: {},
    };

    const fetchSpy = vi.fn<typeof fetch>().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('12')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeData12),
        } as Response);
      }
      if (typeof url === 'string' && url.includes('14')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeData14),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    const res12 = await loadPartsShard('12', fetchSpy);
    const res14 = await loadPartsShard('14', fetchSpy);

    expect(res12).toEqual(fakeData12);
    expect(res14).toEqual(fakeData14);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(1, '/data/parts/12.json');
    expect(fetchSpy).toHaveBeenNthCalledWith(2, '/data/parts/14.json');
  });
});
