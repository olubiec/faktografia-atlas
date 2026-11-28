import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDiscoveriesCache } from '../../src/core/start/load-discoveries';
import { FACTS_LISTS_URL, GMINA_SMALL_URL, loadFactsLists, loadGminaSmall } from '../../src/core/start/load-lists';

// Pobieranie danych karuzeli: jedno żądanie na plik, błąd nie zostaje w pamięci.
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

describe('pobieranie danych karuzeli zestawień', () => {
  beforeEach(() => resetDiscoveriesCache());

  it('facts-lists.json: jedno żądanie, kolejne wywołania biorą z pamięci', async () => {
    const f = vi.fn<typeof fetch>(async () => ok({ generatedAt: 'x', lists: [] }));
    await loadFactsLists(f);
    await loadFactsLists(f);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith(FACTS_LISTS_URL);
  });

  it('gmina-small.json: kody rozdzielone przecinkami → zbiór; pusty plik → pusty zbiór', async () => {
    const small = await loadGminaSmall((async () => ok({ min: 5000, t: '0201011,0201022' })) as unknown as typeof fetch);
    expect([...small]).toEqual(['0201011', '0201022']);
    resetDiscoveriesCache();
    const none = await loadGminaSmall((async () => ok({ min: 5000, t: '' })) as unknown as typeof fetch);
    expect(none.size).toBe(0);
    expect(GMINA_SMALL_URL).toBe('/data/gmina-small.json');
  });

  it('błąd HTTP odrzuca obietnicę, a ponowna próba pobiera od nowa', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce(ok({ generatedAt: 'x', lists: [] }));
    await expect(loadFactsLists(f)).rejects.toThrow('HTTP 500');
    await expect(loadFactsLists(f)).resolves.toMatchObject({ lists: [] });
    expect(f).toHaveBeenCalledTimes(2);
  });
});
