import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadLibraryIndex,
  resetLibraryCache,
} from '../../src/core/library/load-library';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const okResponse = () =>
  ({ ok: true, json: async () => structuredClone(indexFixture) }) as Response;

describe('PF05 – spis biblioteki: jedno żądanie naraz, błąd nie jest trwały', () => {
  beforeEach(() => {
    resetLibraryCache();
  });

  it('5 równoległych wywołań = 1 żądanie', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    const results = await Promise.all(Array.from({ length: 5 }, () => loadLibraryIndex(f)));
    expect(f).toHaveBeenCalledTimes(1);
    for (const r of results) expect(r).not.toBeNull();
  });

  it('po udanej odpowiedzi kolejne wywołania nie robią żądania', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    await loadLibraryIndex(f);
    await loadLibraryIndex(f);
    await loadLibraryIndex(f);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('odrzucone żądanie → null, a następne wywołanie robi nowe żądanie i może się udać', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(okResponse());
    expect(await loadLibraryIndex(f)).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
    expect(await loadLibraryIndex(f)).not.toBeNull();
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('równoległe wywołania w trakcie nieudanej próby dzielą jedno żądanie', async () => {
    const f = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    const results = await Promise.all([loadLibraryIndex(f), loadLibraryIndex(f), loadLibraryIndex(f)]);
    expect(results).toEqual([null, null, null]);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('odpowiedź 404 → null bez trwałego zablokowania', async () => {
    const f = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      .mockResolvedValueOnce(okResponse());
    expect(await loadLibraryIndex(f)).toBeNull();
    expect(await loadLibraryIndex(f)).not.toBeNull();
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('zły JSON → null bez trwałego zablokowania', async () => {
    const bad = {
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    } as unknown as Response;
    const f = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(bad)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ foo: 1 }) } as Response)
      .mockResolvedValueOnce(okResponse());
    expect(await loadLibraryIndex(f)).toBeNull();
    // Poprawny JSON o złym kształcie też daje null i nie blokuje
    expect(await loadLibraryIndex(f)).toBeNull();
    expect(await loadLibraryIndex(f)).not.toBeNull();
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('dwa moduły resetowane (vi.resetModules) nie dzielą stanu', async () => {
    const f1 = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    const f2 = vi.fn<typeof fetch>().mockResolvedValue(okResponse());
    vi.resetModules();
    const a = await import('../../src/core/library/load-library');
    await a.loadLibraryIndex(f1);
    vi.resetModules();
    const b = await import('../../src/core/library/load-library');
    await b.loadLibraryIndex(f2);
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
  });
});
