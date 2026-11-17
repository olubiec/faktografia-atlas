import { describe, expect, it } from 'vitest';
import {
  parseSelection,
  resolveSelection,
  serializeSelection,
  toggleIndicator,
} from '../../src/core/compare/indicator-selection';

const ALL = ['a', 'b', 'c'];

describe('indicator-selection', () => {
  it('parse: brak lub pusty parametr = wszystkie (null)', () => {
    expect(parseSelection(null)).toBeNull();
    expect(parseSelection('')).toBeNull();
  });
  it('parse: lista po przecinku, bez duplikatów i spacji', () => {
    expect(parseSelection('a, b,a')).toEqual(['a', 'b']);
  });
  it('serialize: wszystkie zaznaczone = null, inaczej lista w kolejności', () => {
    expect(serializeSelection(['c', 'b', 'a'], ALL)).toBeNull();
    expect(serializeSelection(['c', 'a'], ALL)).toBe('a,c');
  });
  it('round-trip', () => {
    expect(parseSelection(serializeSelection(['b'], ALL))).toEqual(['b']);
  });
  it('resolve: null i nieznane id dają wszystkie, znane filtruje', () => {
    expect(resolveSelection(null, ALL)).toEqual(ALL);
    expect(resolveSelection(['x'], ALL)).toEqual(ALL);
    expect(resolveSelection(['c', 'x'], ALL)).toEqual(['c']);
  });
  it('toggle: odznacza i zaznacza, zachowując kolejność', () => {
    expect(toggleIndicator(ALL, 'b', ALL)).toEqual(['a', 'c']);
    expect(toggleIndicator(['a', 'c'], 'b', ALL)).toEqual(ALL);
  });
});
