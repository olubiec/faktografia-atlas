import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDataStatus, resetDataStatusCache } from '../../src/core/data/load-status';
import { libraryBase } from '../../src/core/library/config';

const ok = (body: unknown) => vi.fn<typeof fetch>(async () => ({ ok: true, json: async () => body }) as Response);
const good = { version: 1, checkedAt: '2026-11-19T03:00:00Z', values: null, library: null };

describe('loadDataStatus (PU01)', () => {
  beforeEach(resetDataStatusCache);

  it('poprawny plik daje obiekt, a dwa wywołania to jedno żądanie', async () => {
    const f = ok(good);
    expect(await loadDataStatus(f)).toEqual(good);
    await loadDataStatus(f);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('404 daje null i nie jest ponawiane', async () => {
    const f = vi.fn<typeof fetch>(async () => ({ ok: false, json: async () => ({}) }) as Response);
    expect(await loadDataStatus(f)).toBeNull();
    await loadDataStatus(f);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('błąd sieci, zły JSON i version 2 dają null', async () => {
    expect(await loadDataStatus(vi.fn<typeof fetch>(async () => Promise.reject(new Error('sieć'))))).toBeNull();
    resetDataStatusCache();
    expect(await loadDataStatus(vi.fn<typeof fetch>(async () => ({ ok: true, json: async () => Promise.reject(new Error('json')) }) as Response))).toBeNull();
    resetDataStatusCache();
    expect(await loadDataStatus(ok({ ...good, version: 2 }))).toBeNull();
  });
  it('adres zaczyna się od libraryBase() i kończy na /status.json', async () => {
    const f = ok(good);
    await loadDataStatus(f);
    const url = String((f.mock.calls[0] as unknown[])[0]);
    expect(url.startsWith(libraryBase())).toBe(true);
    expect(url.endsWith('/status.json')).toBe(true);
  });
});
