import { describe, expect, it } from 'vitest';
import { createFrameBudget } from '../../src/core/map/frame-budget';

const feed = (b: ReturnType<typeof createFrameBudget>, n: number, dt: number) => {
  for (let i = 0; i < n; i++) b.record(dt);
};

describe('budżet klatek (PM01)', () => {
  it('płynne klatki = full, wolne = lite', () => {
    const a = createFrameBudget();
    feed(a, 30, 16.7);
    expect(a.level()).toBe('full');
    const b = createFrameBudget();
    feed(b, 30, 50);
    expect(b.level()).toBe('lite');
  });
  it('powrót do full dopiero po 60 dobrych klatkach (histereza)', () => {
    const b = createFrameBudget();
    feed(b, 30, 50);
    feed(b, 30 + 30, 16.7); // 30 klatek zapełnia okno, kolejne 30 to jeszcze za mało
    expect(b.level()).toBe('lite');
    feed(b, 40, 16.7);
    expect(b.level()).toBe('full');
  });
  it('odstęp 2000 ms (karta w tle) nie zmienia poziomu', () => {
    const b = createFrameBudget();
    feed(b, 30, 16.7);
    feed(b, 10, 2000);
    expect(b.level()).toBe('full');
  });
  it('reset przywraca full', () => {
    const b = createFrameBudget();
    feed(b, 30, 50);
    b.reset();
    expect(b.level()).toBe('full');
  });
  it('własne progi są respektowane', () => {
    const b = createFrameBudget({ window: 10, slowP95Ms: 20 });
    feed(b, 10, 25);
    expect(b.level()).toBe('lite');
  });
});
