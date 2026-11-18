import { beforeEach, describe, expect, it } from 'vitest';
import {
  getFillTransitionState,
  getLayerTransitions,
  noteFillLayer,
  resetFillTransition,
} from '@/core/map/fill-transition';

describe('stan koloru wypełnienia bez przejść GPU (CN)', () => {
  beforeEach(() => resetFillTransition());

  it('ms jest zawsze 0, a klucz to ostatni zapamiętany', () => {
    expect(getFillTransitionState()).toEqual({ ms: 0, dataKey: '' });
    noteFillLayer('choropleth-layer', 'woj', undefined);
    noteFillLayer('choropleth-layer', 'pow', undefined);
    expect(getFillTransitionState()).toEqual({ ms: 0, dataKey: 'pow' });
  });

  it('zapisuje największy czas przejścia warstwy (0 bez transitions)', () => {
    noteFillLayer('a', 'woj', undefined);
    noteFillLayer('b', 'woj', { getFillColor: 300 });
    noteFillLayer('a', 'pow', undefined);
    expect(getLayerTransitions()).toEqual([
      { id: 'b', transitionMs: 300 },
      { id: 'a', transitionMs: 0 },
    ]);
  });
});
