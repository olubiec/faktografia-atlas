import { beforeEach, describe, expect, it } from 'vitest';
import {
  getFillTransitionState,
  resetFillTransition,
  resolveFillTransition,
} from '@/core/map/fill-transition';

describe('resolveFillTransition (W20-CN01)', () => {
  beforeEach(() => resetFillTransition());

  it('pierwsze wywołanie wyłącza przejście', () => {
    expect(resolveFillTransition('woj', 300)).toEqual({ ms: 0, changed: true });
  });

  it('ten sam klucz zwraca czas bazowy', () => {
    resolveFillTransition('woj', 300);
    expect(resolveFillTransition('woj', 300)).toEqual({ ms: 300, changed: false });
  });

  it('zmiana klucza wyłącza przejście', () => {
    resolveFillTransition('woj', 300);
    expect(resolveFillTransition('pow', 300)).toEqual({ ms: 0, changed: true });
  });

  it('powrót do wcześniejszego klucza daje 0 tylko raz, potem czas bazowy', () => {
    resolveFillTransition('woj', 300);
    resolveFillTransition('pow', 300);
    expect(resolveFillTransition('woj', 300).ms).toBe(0);
    expect(resolveFillTransition('woj', 300).ms).toBe(300);
  });

  it('baseMs = 0 zawsze daje 0', () => {
    expect(resolveFillTransition('woj', 0).ms).toBe(0);
    expect(resolveFillTransition('woj', 0).ms).toBe(0);
    expect(resolveFillTransition('pow', 0).ms).toBe(0);
  });

  it('stan testowy pokazuje ostatni klucz i czas', () => {
    resolveFillTransition('woj', 300);
    resolveFillTransition('woj', 300);
    expect(getFillTransitionState()).toEqual({ ms: 300, dataKey: 'woj' });
  });

  it('revealRunning wyłącza przejście, także gdy klucz bez zmian (W20-CN02)', () => {
    resolveFillTransition('woj', 300);
    expect(resolveFillTransition('woj', 300, { revealRunning: true }).ms).toBe(0);
  });

  it('revealRunning: false działa jak w CN01 (W20-CN02)', () => {
    resolveFillTransition('woj', 300);
    expect(resolveFillTransition('woj', 300, { revealRunning: false }).ms).toBe(300);
  });
});
