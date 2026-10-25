import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Unit } from '../../src/core/units/types';
import { libraryBase } from '../../src/core/library/config';
import {
  loadLibraryIndex,
  loadLibraryValues,
  resetLibraryCache,
  valuesByTeryt,
} from '../../src/core/library/load-library';

describe('Biblioteka GUS – load-library (W1.23)', () => {
  beforeEach(() => {
    resetLibraryCache();
    delete import.meta.env.VITE_LIBRARY_BASE;
  });

  it('dwa wywołania loadLibraryIndex = jedno żądanie na adres z libraryBase()', async () => {
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1, variables: { '101': { id: '101' } } }),
    } as Response);

    const expectedUrl = `${libraryBase()}/index.json`;

    const res1 = await loadLibraryIndex(mockFetch);
    const res2 = await loadLibraryIndex(mockFetch);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
    expect(res1).toEqual(res2);
    expect(res1).toEqual({ version: 1, variables: { '101': { id: '101' } } });
  });

  it('404 zwraca null dla indeksu i wartości', async () => {
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not Found' }),
    } as Response);

    const indexRes = await loadLibraryIndex(mockFetch);
    expect(indexRes).toBeNull();

    const valuesRes = await loadLibraryValues('101', mockFetch);
    expect(valuesRes).toBeNull();
  });

  it('zły kształt danych zwraca null dla indeksu i wartości', async () => {
    const mockFetchBadJson = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => 'not an object',
    } as Response);

    const indexRes1 = await loadLibraryIndex(mockFetchBadJson);
    expect(indexRes1).toBeNull();

    resetLibraryCache();

    const mockFetchEmptyObject = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ unexpectedField: 123 }),
    } as Response);

    const indexRes2 = await loadLibraryIndex(mockFetchEmptyObject);
    expect(indexRes2).toBeNull();

    const valuesRes = await loadLibraryValues('101', mockFetchEmptyObject);
    expect(valuesRes).toBeNull();
  });

  it('valuesByTeryt mapuje znane bdlId i pomija nieznane oraz części gmin', () => {
    const mockUnits: Unit[] = [
      {
        teryt: '3211043',
        bdlId: '023216611043',
        name: 'Police',
        level: 'gmi',
        parent: '3211',
        bbox: [0, 0, 0, 0],
        centroid: [0, 0],
      },
      {
        teryt: '3214',
        bdlId: '023216614000',
        name: 'powiat stargardzki',
        level: 'pow',
        parent: '32',
        bbox: [0, 0, 0, 0],
        centroid: [0, 0],
      },
    ];

    const libraryData = {
      v: 'var_1001',
      l6: {
        y: ['2021', '2022'],
        d: {
          '023216611043': [100, 200], // znana gmina Police
          '023216611044': [10, 20],   // część gminy / nieobecny kod w units
          '999999999999': [1, 2],     // nieznane bdlId
        },
      },
    };

    const result = valuesByTeryt(libraryData, 'gmi', mockUnits);

    expect(result.indicatorId).toBe('var_1001');
    expect(result.years).toEqual([2021, 2022]);
    expect(result.values).toEqual({
      '3211043': [100, 200],
    });
    expect(result.values['3211044']).toBeUndefined();
    expect(result.values['999999999999']).toBeUndefined();
  });

  it('zmiana VITE_LIBRARY_BASE zmienia adres żądania', async () => {
    import.meta.env.VITE_LIBRARY_BASE = 'https://example.com/custom-library/';

    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1, variables: {} }),
    } as Response);

    await loadLibraryIndex(mockFetch);

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/custom-library/index.json');

    resetLibraryCache();

    await loadLibraryValues('202', mockFetch);

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/custom-library/values/202.json');
  });

  it('brak jakiegokolwiek wywołania sieci przy imporcie modułu', () => {
    const mockFetch = vi.fn<typeof fetch>();
    globalThis.fetch = mockFetch;

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
