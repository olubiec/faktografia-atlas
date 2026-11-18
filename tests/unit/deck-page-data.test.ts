import { describe, expect, it } from 'vitest';
import type { DeckPage, PageKind } from '../../src/core/share/deck';
import {
  PAGE_DATA_RULES,
  addIndicatorToPage,
  canAddData,
  canRemoveData,
  isSingleIndicator,
  removeIndicatorFromPage,
  replaceIndicator,
  seedIndicators,
} from '../../src/core/share/deck-page-data';

const page = (kind: PageKind, indicatorIds: string[]): DeckPage => ({ id: 'p1', kind, indicatorIds });
const many = (n: number) => Array.from({ length: n }, (_, i) => `i${i}`);
const KINDS: PageKind[] = ['map', 'ranking', 'bignumber', 'trend', 'histogram', 'versus', 'table', 'profile', 'compare'];

describe('deck-page-data', () => {
  it('mapa przyjmuje dokładnie jeden wskaźnik', () => {
    const map = page('map', ['a']);
    expect(addIndicatorToPage(map, 'x')).toBe(map);
    expect(replaceIndicator(map, 'x').indicatorIds).toEqual(['x']);
    expect(isSingleIndicator('map')).toBe(true);
    expect(isSingleIndicator('table')).toBe(false);
  });

  it('tabela: dopisuje na końcu, duplikat bez zmian, 21. nie wchodzi', () => {
    const t = page('table', ['a', 'b']);
    expect(addIndicatorToPage(t, 'c').indicatorIds).toEqual(['a', 'b', 'c']);
    expect(addIndicatorToPage(t, 'a')).toBe(t);
    const full = page('table', many(20));
    expect(addIndicatorToPage(full, 'zzz')).toBe(full);
  });

  it('replaceIndicator nie rusza stron wielowskaźnikowych', () => {
    const t = page('table', ['a', 'b']);
    expect(replaceIndicator(t, 'x')).toBe(t);
  });

  it('removeIndicatorFromPage nie zejdzie poniżej minimum', () => {
    const one = page('table', ['a']);
    expect(removeIndicatorFromPage(one, 'a')).toBe(one);
    const two = page('table', ['a', 'b']);
    expect(removeIndicatorFromPage(two, 'a').indicatorIds).toEqual(['b']);
    expect(removeIndicatorFromPage(two, 'nie-ma')).toBe(two);
    const map = page('map', ['a']);
    expect(removeIndicatorFromPage(map, 'a')).toBe(map);
  });

  it('seedIndicators', () => {
    const mine7 = many(7);
    expect(seedIndicators('table', mine7, 'density')).toEqual(mine7);
    expect(seedIndicators('table', mine7, 'density')).not.toBe(mine7);
    expect(seedIndicators('bignumber', mine7, 'density')).toEqual(['density']);
    expect(seedIndicators('bignumber', mine7, null)).toEqual(['i0']);
    expect(seedIndicators('table', [], 'density')).toEqual(['density']);
    expect(seedIndicators('table', many(25), null)).toHaveLength(20);
    expect(seedIndicators('map', [], null)).toEqual([]);
    expect(seedIndicators('table', [], null)).toEqual([]);
  });

  it('canAddData / canRemoveData zgodne z regułami dla 9 rodzajów', () => {
    expect(Object.keys(PAGE_DATA_RULES).sort()).toEqual([...KINDS].sort());
    for (const kind of KINDS) {
      const { min, max } = PAGE_DATA_RULES[kind];
      expect(canAddData(page(kind, ['a']))).toBe(max > 1);
      expect(canRemoveData(page(kind, ['a']))).toBe(false);
      expect(canAddData(page(kind, many(max)))).toBe(false);
      expect(canRemoveData(page(kind, many(max)))).toBe(max > min);
    }
  });

  it('nie mutuje wejścia', () => {
    const t = page('table', ['a', 'b']);
    const snap = JSON.stringify(t);
    addIndicatorToPage(t, 'c');
    removeIndicatorFromPage(t, 'a');
    replaceIndicator(t, 'z');
    const mine = ['a', 'b'];
    seedIndicators('table', mine, 'x');
    expect(JSON.stringify(t)).toBe(snap);
    expect(mine).toEqual(['a', 'b']);
  });

  it('wskaźnik z biblioteki (b101) przechodzi jak każdy inny', () => {
    expect(addIndicatorToPage(page('table', ['a']), 'b101').indicatorIds).toEqual(['a', 'b101']);
    expect(replaceIndicator(page('map', ['a']), 'b101').indicatorIds).toEqual(['b101']);
  });
});
