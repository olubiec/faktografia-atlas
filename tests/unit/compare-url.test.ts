import { describe, it, expect } from 'vitest';
import {
  readComparePair,
  writeCompareSearch,
  setA,
  setB,
  swapPair,
  clearSlot,
  levelsDiffer,
  type ComparePair,
} from '../../src/core/compare/compare-url';
import { buildIndex } from '../../src/core/units/units';
import type { Unit, UnitLevel } from '../../src/core/units/types';

const unit = (teryt: string, level: UnitLevel, parent: string | null): Unit => ({
  teryt,
  bdlId: null,
  name: teryt,
  level,
  parent,
  bbox: [0, 0, 0, 0],
  centroid: [0, 0],
});

// Mały indeks: województwo, dwa powiaty, gmina.
const index = buildIndex([
  unit('14', 'woj', null),
  unit('1261', 'pow', '12'),
  unit('0264', 'pow', '02'),
  unit('1261011', 'gmi', '1261'),
]);

const none: ComparePair = { a: null, b: null };

describe('compare-url', () => {
  it('odczyt/zapis okrągły: oba, tylko A, tylko B, żadne', () => {
    const pairs: ComparePair[] = [
      { a: '1261', b: '0264' },
      { a: '1261', b: null },
      { a: null, b: '0264' },
      none,
    ];
    for (const pair of pairs) {
      expect(readComparePair(writeCompareSearch(pair))).toEqual(pair);
    }
    expect(writeCompareSearch(none)).toBe('');
    expect(writeCompareSearch({ a: '14', b: null })).toBe('?c=14');
    expect(writeCompareSearch({ a: null, b: '14' })).toBe('?c=,14');
    expect(writeCompareSearch({ a: '1261', b: '0264' })).toBe('?c=1261,0264');
  });

  it('?c=14 = tylko A, ?c=,14 = tylko B, więcej niż 2 → pierwsze 2', () => {
    expect(readComparePair('?c=14')).toEqual({ a: '14', b: null });
    expect(readComparePair('?c=,14')).toEqual({ a: null, b: '14' });
    expect(readComparePair('?c=1,2,3')).toEqual({ a: '1', b: '2' });
    expect(readComparePair('')).toEqual(none);
    expect(readComparePair('?x=1')).toEqual(none);
  });

  it('nieznany TERYT z indeksem → null', () => {
    expect(readComparePair('?c=1261,9999', index)).toEqual({ a: '1261', b: null });
    expect(readComparePair('?c=9999,0264', index)).toEqual({ a: null, b: '0264' });
  });

  it('duplikat ?c=14,14 → b null; setA/setB zamieniają zamiast duplikować', () => {
    expect(readComparePair('?c=14,14')).toEqual({ a: '14', b: null });
    const pair = { a: '1261', b: '0264' };
    expect(setA(pair, '0264')).toEqual({ a: '0264', b: '1261' });
    expect(setB(pair, '1261')).toEqual({ a: '0264', b: '1261' });
    expect(setA(pair, '14')).toEqual({ a: '14', b: '0264' });
    expect(setB(pair, '14')).toEqual({ a: '1261', b: '14' });
    expect(setA({ a: '1261', b: null }, '1261')).toEqual({ a: '1261', b: null });
  });

  it('swapPair dwa razy = identyczność', () => {
    const pair = { a: '1261', b: null };
    expect(swapPair(pair)).toEqual({ a: null, b: '1261' });
    expect(swapPair(swapPair(pair))).toEqual(pair);
  });

  it('clearSlot zeruje tylko wskazane miejsce', () => {
    const pair = { a: '1261', b: '0264' };
    expect(clearSlot(pair, 'a')).toEqual({ a: null, b: '0264' });
    expect(clearSlot(pair, 'b')).toEqual({ a: '1261', b: null });
    expect(pair).toEqual({ a: '1261', b: '0264' });
  });

  it('levelsDiffer: powiat+gmina true, dwa powiaty false, jedno puste false', () => {
    expect(levelsDiffer({ a: '1261', b: '1261011' }, index)).toBe(true);
    expect(levelsDiffer({ a: '1261', b: '0264' }, index)).toBe(false);
    expect(levelsDiffer({ a: '1261', b: null }, index)).toBe(false);
    expect(levelsDiffer({ a: '1261', b: '9999' }, index)).toBe(false);
  });

  it('TERYT z wiodącym zerem zostaje stringiem', () => {
    const pair = readComparePair('?c=0264,02');
    expect(pair).toEqual({ a: '0264', b: '02' });
    expect(writeCompareSearch(pair)).toBe('?c=0264,02');
  });
});
