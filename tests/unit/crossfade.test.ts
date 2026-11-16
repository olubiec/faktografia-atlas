import { describe, it, expect } from 'vitest';
import { easeInOut, initialCrossfade, stepCrossfade } from '@/core/map/crossfade';

describe('crossfade poziomów', () => {
  it('pierwsze rysowanie jest od razu pełne, bez starej warstwy', () => {
    const f = stepCrossfade(initialCrossfade, 'woj:null:null', 1, false);
    expect(f.incoming).toBe(1);
    expect(f.showOutgoing).toBe(false);
  });

  it('zmiana zakresu zaczyna od 0 nawet gdy postęp jeszcze wynosi 1', () => {
    const a = stepCrossfade(initialCrossfade, 'woj:null:null', 1, false);
    const b = stepCrossfade(a.next, 'pow:12:null', 1, false);
    expect(b.incoming).toBe(0);
    expect(b.showOutgoing).toBe(true);
  });

  it('w trakcie animacji nowa warstwa rośnie, a stara zostaje pod spodem', () => {
    const a = stepCrossfade(initialCrossfade, 'woj:null:null', 1, false);
    const b = stepCrossfade(a.next, 'pow:12:null', 1, false);
    const c = stepCrossfade(b.next, 'pow:12:null', 0.5, false);
    expect(c.incoming).toBeGreaterThan(0);
    expect(c.incoming).toBeLessThan(1);
    expect(c.showOutgoing).toBe(true);
    const d = stepCrossfade(c.next, 'pow:12:null', 1, false);
    expect(d.incoming).toBe(1);
    expect(d.showOutgoing).toBe(false);
  });

  it('reduced motion: zmiana poziomu bez przejścia', () => {
    const a = stepCrossfade(initialCrossfade, 'woj:null:null', 1, true);
    const b = stepCrossfade(a.next, 'pow:12:null', 1, true);
    expect(b.incoming).toBe(1);
    expect(b.showOutgoing).toBe(false);
  });

  it('krzywa jest monotoniczna i trzyma końce', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    let prev = 0;
    for (let i = 1; i <= 20; i++) {
      const v = easeInOut(i / 20);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});
