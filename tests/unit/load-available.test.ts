import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadAvailable, peekAvailable, resetAvailableCache } from '../../src/core/indicators/load-available';

const fixture = readFileSync('tests/fixtures/library/available.json', 'utf8');

function okResponse(body: string) {
  return { ok: true, status: 200, json: async () => JSON.parse(body) } as unknown as Response;
}
const notFound = { ok: false, status: 404, json: async () => ({}) } as unknown as Response;

describe('loadAvailable (QC603)', () => {
  beforeEach(() => resetAvailableCache());
  afterEach(() => vi.useRealTimers());

  it('dwa równoległe wywołania = jedno żądanie i ten sam wynik', async () => {
    const f = vi.fn<() => Promise<Response>>(async () => okResponse(fixture));
    const [a, b] = await Promise.all([loadAvailable(f), loadAvailable(f)]);
    expect(f).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(String(f.mock.calls[0]![0])).toMatch(/\/available\.json$/);
  });

  it('poprawny plik daje 5 zmiennych', async () => {
    const r = await loadAvailable(async () => okResponse(fixture));
    expect(r?.version).toBe(1);
    expect(r?.variables).toHaveLength(5);
  });

  it('404 daje null, a kolejne wywołanie nie robi nowego żądania', async () => {
    const f = vi.fn<() => Promise<Response>>(async () => notFound);
    expect(await loadAvailable(f)).toBeNull();
    expect(await loadAvailable(f)).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('błąd sieci daje null', async () => {
    const f = vi.fn<() => Promise<Response>>(async () => {
      throw new TypeError('network');
    });
    expect(await loadAvailable(f)).toBeNull();
    expect(await loadAvailable(f)).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('zły kształt lub version 2 daje null', async () => {
    expect(await loadAvailable(async () => okResponse('{"foo":1}'))).toBeNull();
    resetAvailableCache();
    expect(await loadAvailable(async () => okResponse('{"version":2,"variables":[]}'))).toBeNull();
    resetAvailableCache();
    expect(await loadAvailable(async () => okResponse('{"version":1,"variables":{}}'))).toBeNull();
  });

  it('zły JSON daje null', async () => {
    const bad = { ok: true, status: 200, json: async () => JSON.parse('{') } as unknown as Response;
    expect(await loadAvailable(async () => bad)).toBeNull();
  });

  it('wpis bez id jest odrzucony, pozostałe zachowane', async () => {
    const data = JSON.parse(fixture);
    delete data.variables[0].id;
    const r = await loadAvailable(async () => okResponse(JSON.stringify(data)));
    expect(r?.variables).toHaveLength(4);
    expect(r?.variables.every((v) => typeof v.id === 'string')).toBe(true);
  });

  it('timeout 8 s daje null', async () => {
    vi.useFakeTimers();
    const f = vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {}));
    const p = loadAvailable(f);
    await vi.advanceTimersByTimeAsync(7999);
    expect(peekAvailable()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(2);
    expect(await p).toBeNull();
    expect(peekAvailable()).toBeNull();
  });

  it('resetAvailableCache pozwala na nowe żądanie, peekAvailable zwraca undefined przed i wynik po', async () => {
    const f = vi.fn<() => Promise<Response>>(async () => okResponse(fixture));
    expect(peekAvailable()).toBeUndefined();
    const r = await loadAvailable(f);
    expect(peekAvailable()).toBe(r);
    resetAvailableCache();
    expect(peekAvailable()).toBeUndefined();
    await loadAvailable(f);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('plik ok. 2000 pozycji (tylko pow/gmi) jest wczytany w całości (KOREKTA 18.11)', async () => {
    const variables = Array.from({ length: 2000 }, (_, i) => ({
      id: String(1000 + i),
      n: `Wskaźnik ${i}`,
      u: 'osoba',
      s: '11',
      c: 'Ludność > Struktura',
      lv: i % 2 ? ['pow', 'gmi'] : ['pow'],
      y: [2022, 2023, 2024],
    }));
    const body = JSON.stringify({ version: 1, generatedAt: '2026-11-18T00:00:00Z', variables });
    const r = await loadAvailable(async () => okResponse(body));
    expect(r?.variables).toHaveLength(2000);
    expect(r?.variables.some((v) => v.lv.includes('woj'))).toBe(false);
  });
});
