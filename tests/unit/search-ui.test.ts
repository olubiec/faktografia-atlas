import { describe, expect, it } from 'vitest';
import { getSearchIndex } from '../../src/view/search/useSearch';
import { search } from '../../src/core/search';

describe('Search UI Logic & Integration (CC5.2)', () => {
  it('initializes search index from public/data/units.json successfully', () => {
    const index = getSearchIndex();
    expect(index).toBeDefined();
    expect(index.unitsMap.size).toBeGreaterThan(0);
  });

  it('searches for "lodz" and returns Łódź gmina miejska as top result', () => {
    const index = getSearchIndex();
    const results = search(index, 'lodz');

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].name).toBe('Łódź');
    expect(results[0].teryt).toBe('1061011');
    expect(results[0].label).toBe('gmina miejska');
    expect(results[0].context).toBe('powiat Łódź, łódzkie');
  });

  it('handles empty query or query shorter than 2 characters by returning empty list', () => {
    const index = getSearchIndex();
    expect(search(index, '')).toEqual([]);
    expect(search(index, '   ')).toEqual([]);
    expect(search(index, 'x')).toEqual([]);
  });

  it('handles query with no matching results by returning empty list (triggers empty state UI)', () => {
    const index = getSearchIndex();
    const results = search(index, 'xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('correctly matches keyboard shortcut condition Ctrl+K and Cmd+K', () => {
    const isCtrlK = (e: { ctrlKey: boolean; metaKey: boolean; key: string }) =>
      (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';

    expect(isCtrlK({ ctrlKey: true, metaKey: false, key: 'k' })).toBe(true);
    expect(isCtrlK({ ctrlKey: false, metaKey: true, key: 'K' })).toBe(true);
    expect(isCtrlK({ ctrlKey: false, metaKey: false, key: 'k' })).toBe(false);
    expect(isCtrlK({ ctrlKey: true, metaKey: false, key: 'j' })).toBe(false);
  });
});
