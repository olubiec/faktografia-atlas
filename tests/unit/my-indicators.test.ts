import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BASIC_INDICATORS,
  defaultMyIndicators,
  addIndicator,
  removeIndicator,
  moveIndicator,
  resetToBasic,
  isBasic,
} from '../../src/core/my-indicators/my-indicators';

const frozen = (list: readonly string[]) => Object.freeze([...list]);

describe('my-indicators', () => {
  it('BASIC_INDICATORS ma 7 pozycji, a każde id istnieje w config/indicators.json', async () => {
    const raw = await readFile(path.join(process.cwd(), 'config/indicators.json'), 'utf8');
    const ids = new Set((JSON.parse(raw) as { id: string }[]).map((i) => i.id));
    expect(BASIC_INDICATORS).toHaveLength(7);
    for (const id of BASIC_INDICATORS) expect(ids.has(id)).toBe(true);
  });

  it('defaultMyIndicators zwraca kopię podstawowej', () => {
    const list = defaultMyIndicators();
    expect(list).toEqual(BASIC_INDICATORS);
    expect(list).not.toBe(BASIC_INDICATORS);
  });

  it('addIndicator dopisuje na końcu, a ponowne dodanie nic nie zmienia', () => {
    const start = frozen(['population']);
    const next = addIndicator(start, 'density');
    expect(next).toEqual(['population', 'density']);
    expect(Object.is(addIndicator(next, 'density'), next)).toBe(true);
  });

  it('removeIndicator usuwa; nieistniejący id → ta sama referencja; pusta lista jest poprawna', () => {
    const start = frozen(['a', 'b']);
    expect(removeIndicator(start, 'a')).toEqual(['b']);
    expect(Object.is(removeIndicator(start, 'zzz'), start)).toBe(true);
    expect(removeIndicator(removeIndicator(start, 'a'), 'b')).toEqual([]);
  });

  it('moveIndicator: krawędź bez zmiany, środek zamienia z sąsiadem', () => {
    const start = frozen(['a', 'b', 'c']);
    expect(Object.is(moveIndicator(start, 'a', -1), start)).toBe(true);
    expect(Object.is(moveIndicator(start, 'c', 1), start)).toBe(true);
    expect(Object.is(moveIndicator(start, 'zzz', 1), start)).toBe(true);
    expect(moveIndicator(start, 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(moveIndicator(start, 'b', -1)).toEqual(['b', 'a', 'c']);
  });

  it('resetToBasic po usunięciu 3 daje 7 podstawowych w kolejności bazowej', () => {
    let list: readonly string[] = defaultMyIndicators();
    for (const id of BASIC_INDICATORS.slice(0, 3)) list = removeIndicator(list, id);
    expect(list).toHaveLength(4);
    expect(resetToBasic()).toEqual(BASIC_INDICATORS);
  });

  it('isBasic: true dla podstawowej, false po zmianie listy lub kolejności', () => {
    expect(isBasic(defaultMyIndicators())).toBe(true);
    expect(isBasic(removeIndicator(defaultMyIndicators(), 'avg-wage'))).toBe(false);
    expect(isBasic(moveIndicator(defaultMyIndicators(), 'density', 1))).toBe(false);
    expect(isBasic([])).toBe(false);
  });

  it('funkcje nie mutują zamrożonej tablicy wejściowej', () => {
    const start = frozen(['a', 'b', 'c']);
    expect(() => {
      addIndicator(start, 'd');
      removeIndicator(start, 'a');
      moveIndicator(start, 'b', 1);
    }).not.toThrow();
    expect(start).toEqual(['a', 'b', 'c']);
  });

  it('wskaźnik z biblioteki (b60614) da się dodać', () => {
    expect(addIndicator(defaultMyIndicators(), 'b60614').at(-1)).toBe('b60614');
  });
});
