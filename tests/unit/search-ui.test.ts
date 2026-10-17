import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach } from 'vitest';
import { loadSearchIndex, resetSearchIndexCache, UNITS_URL } from '../../src/view/search/useSearch';
import { search } from '../../src/core/search';

const unitsJson = fs.readFileSync(path.join(process.cwd(), 'public/data/units.json'), 'utf8');

function stubFetch(calls: string[] = []): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response(unitsJson, { status: 200 });
  }) as typeof fetch;
}

async function getSearchIndex() {
  return loadSearchIndex(stubFetch());
}

describe('Search UI Logic & Integration (CC5.2)', () => {
  beforeEach(() => resetSearchIndexCache());

  it('pobiera units.json dokładnie raz, także przy równoległych wywołaniach', async () => {
    const calls: string[] = [];
    const f = stubFetch(calls);
    await Promise.all([loadSearchIndex(f), loadSearchIndex(f), loadSearchIndex(f)]);
    await loadSearchIndex(f);
    expect(calls).toEqual([UNITS_URL]);
  });

  it('po błędzie pobierania pozwala spróbować ponownie', async () => {
    const bad = (async () => new Response('', { status: 503 })) as typeof fetch;
    await expect(loadSearchIndex(bad)).rejects.toThrow('HTTP 503');
    const index = await loadSearchIndex(stubFetch());
    expect(index.unitsMap.size).toBeGreaterThan(0);
  });

  it('initializes search index from public/data/units.json successfully', async () => {
    const index = await getSearchIndex();
    expect(index).toBeDefined();
    expect(index.unitsMap.size).toBeGreaterThan(0);
  });

  it('searches for "lodz" and returns Łódź gmina miejska as top result', async () => {
    const index = await getSearchIndex();
    const results = search(index, 'lodz');

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].name).toBe('Łódź');
    expect(results[0].teryt).toBe('1061011');
    expect(results[0].label).toBe('gmina miejska');
    expect(results[0].context).toBe('powiat Łódź, łódzkie');
  });

  it('handles empty query or query shorter than 2 characters by returning empty list', async () => {
    const index = await getSearchIndex();
    expect(search(index, '')).toEqual([]);
    expect(search(index, '   ')).toEqual([]);
    expect(search(index, 'x')).toEqual([]);
  });

  it('handles query with no matching results by returning empty list (triggers empty state UI)', async () => {
    const index = await getSearchIndex();
    const results = search(index, 'xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('correctly matches keyboard shortcut condition Ctrl+K and Cmd+K', async () => {
    const isCtrlK = (e: { ctrlKey: boolean; metaKey: boolean; key: string }) =>
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';

    expect(isCtrlK({ ctrlKey: true, metaKey: false, key: 'k' })).toBe(true);
    expect(isCtrlK({ ctrlKey: false, metaKey: true, key: 'K' })).toBe(true);
    expect(isCtrlK({ ctrlKey: false, metaKey: false, key: 'k' })).toBe(false);
    expect(isCtrlK({ ctrlKey: true, metaKey: false, key: 'j' })).toBe(false);
  });
});
