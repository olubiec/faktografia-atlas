import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MOTION,
  createMotion,
  cycleIndex,
  glowAt,
  pointerMove,
  projectLonLat,
  ringToPath,
  simplifyLine,
  tickMotion,
  waveAt,
  type MotionOptions,
  type Point,
} from '../../src/core/start/idle-motion';

const opts: MotionOptions = { idleMs: 4000, jumpMs: 2000, smoothMs: 300, reducedMotion: false };
const reduced: MotionOptions = { ...opts, reducedMotion: true };

// Prosty, powtarzalny generator liczb (stałe ziarno), żeby test nie zależał od Math.random.
function seeded(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('tryb losowy i reakcja na kursor', () => {
  it('na starcie, bez żadnego ruchu, jest tryb losowy z punktem zainteresowania', () => {
    const s = createMotion(0, opts, seeded([0.2, 0.7]));
    expect(s.mode).toBe('random');
    expect(s.focus).toEqual([0.2, 0.7]);
  });

  it('ruch kursora przełącza na reakcję i ustawia cel w miejscu kursora', () => {
    let s = createMotion(0, opts, seeded([0.5]));
    s = pointerMove(s, [0.9, 0.1], 1000, opts);
    expect(s.mode).toBe('react');
    expect(s.target).toEqual([0.9, 0.1]);
  });

  it('bez ruchu kursora przez idleMs wraca do trybu losowego, wcześniej nie', () => {
    const rand = seeded([0.3, 0.6, 0.1, 0.8]);
    let s = createMotion(0, opts, rand);
    s = pointerMove(s, [0.9, 0.9], 1000, opts);
    s = tickMotion(s, 1000 + opts.idleMs - 1, opts, rand);
    expect(s.mode).toBe('react');
    expect(s.target).toEqual([0.9, 0.9]);
    s = tickMotion(s, 1000 + opts.idleMs, opts, rand);
    expect(s.mode).toBe('random');
    expect(s.target).not.toEqual([0.9, 0.9]);
  });

  it('kolejny ruch kursora po powrocie do losowego znów daje reakcję', () => {
    const rand = seeded([0.3, 0.6]);
    let s = createMotion(0, opts, rand);
    s = pointerMove(s, [0.9, 0.9], 0, opts);
    s = tickMotion(s, 5000, opts, rand);
    expect(s.mode).toBe('random');
    s = pointerMove(s, [0.1, 0.2], 5100, opts);
    expect(s.mode).toBe('react');
    expect(s.target).toEqual([0.1, 0.2]);
    // Ruch odnawia odliczanie bezczynności.
    s = tickMotion(s, 5100 + opts.idleMs - 1, opts, rand);
    expect(s.mode).toBe('react');
  });

  it('w trybie losowym co jumpMs wybiera nowy cel, a między skokami cel stoi', () => {
    const rand = seeded([0.1, 0.1, 0.4, 0.4, 0.7, 0.7]);
    let s = createMotion(0, opts, rand);
    const first = s.target;
    s = tickMotion(s, opts.jumpMs - 1, opts, rand);
    expect(s.target).toEqual(first);
    s = tickMotion(s, opts.jumpMs, opts, rand);
    expect(s.target).toEqual([0.4, 0.4]);
  });

  it('punkt zainteresowania płynnie zbliża się do celu i go nie przeskakuje', () => {
    let s = createMotion(0, opts, seeded([0, 0]));
    s = pointerMove(s, [1, 0], 0, opts);
    let prev = s.focus![0];
    for (let t = 16; t <= 2000; t += 16) {
      s = tickMotion(s, t, opts, seeded([0.5]));
      expect(s.focus![0]).toBeGreaterThanOrEqual(prev);
      expect(s.focus![0]).toBeLessThanOrEqual(1);
      prev = s.focus![0];
    }
    expect(prev).toBeGreaterThan(0.99);
  });

  it('wygładzanie nie zależy od liczby klatek (te same 600 ms dają ten sam wynik)', () => {
    const a0 = pointerMove(createMotion(0, opts, seeded([0, 0])), [1, 0], 0, opts);
    let a = a0;
    for (let t = 10; t <= 600; t += 10) a = tickMotion(a, t, opts, seeded([0]));
    let b = a0;
    for (let t = 50; t <= 600; t += 50) b = tickMotion(b, t, opts, seeded([0]));
    expect(a.focus![0]).toBeCloseTo(b.focus![0], 6);
  });
});

describe('prefers-reduced-motion', () => {
  it('stan początkowy jest statyczny i bez punktu zainteresowania', () => {
    const s = createMotion(0, reduced, seeded([0.5]));
    expect(s.mode).toBe('static');
    expect(s.focus).toBeNull();
  });

  it('ruch kursora i kolejne klatki nie zwracają żadnego ruchu', () => {
    let s = createMotion(0, reduced, seeded([0.5]));
    s = pointerMove(s, [0.5, 0.5], 100, reduced);
    s = tickMotion(s, 5000, reduced, seeded([0.5]));
    expect(s.mode).toBe('static');
    expect(s.focus).toBeNull();
    expect(s.target).toBeNull();
  });

  it('włączenie reduced-motion w trakcie sesji zatrzymuje ruch', () => {
    let s = createMotion(0, opts, seeded([0.5]));
    s = tickMotion(s, 100, reduced, seeded([0.5]));
    expect(s.mode).toBe('static');
    expect(glowAt([0.5, 0.5], s.focus, 0.4)).toBe(0);
    expect(waveAt([0.5, 0.5], s.focus, 500, 2000, 0.6)).toBe(0);
  });
});

describe('podświetlenie, fala i wskaźniki', () => {
  it('glowAt maleje z odległością i jest 0 poza promieniem', () => {
    const f: Point = [0.5, 0.5];
    expect(glowAt([0.5, 0.5], f, 0.4)).toBeCloseTo(1, 9);
    expect(glowAt([0.7, 0.5], f, 0.4)).toBeCloseTo(0.5, 9);
    expect(glowAt([0.9, 0.5], f, 0.4)).toBe(0);
    expect(glowAt([0.6, 0.5], f, 0.4)).toBeGreaterThan(glowAt([0.8, 0.5], f, 0.4));
  });

  it('waveAt: pierścień jest w pobliżu frontu fali i znika daleko od niego', () => {
    const f: Point = [0, 0];
    const atFront = waveAt([0.3, 0], f, 1000, 2000, 0.6); // front w połowie zasięgu = 0,3
    const far = waveAt([0.05, 0], f, 1000, 2000, 0.6);
    expect(atFront).toBeGreaterThan(0.4);
    expect(far).toBeLessThan(0.01);
  });

  it('cycleIndex przełącza wskaźniki co okres i zawija na początek', () => {
    expect(cycleIndex(0, 5000, 4)).toBe(0);
    expect(cycleIndex(4999, 5000, 4)).toBe(0);
    expect(cycleIndex(5000, 5000, 4)).toBe(1);
    expect(cycleIndex(20000, 5000, 4)).toBe(0);
    expect(cycleIndex(100, 5000, 0)).toBe(0);
  });
});

describe('uproszczony obrys', () => {
  it('simplifyLine usuwa punkty leżące na prostej i zachowuje ostre zakręty', () => {
    const line: Point[] = [[0, 0], [1, 0.01], [2, 0], [3, 5], [4, 0]];
    const out = simplifyLine(line, 0.1);
    expect(out).toEqual([[0, 0], [2, 0], [3, 5], [4, 0]]);
  });

  it('mniejszy próg zostawia więcej punktów niż większy', () => {
    const wavy: Point[] = Array.from({ length: 50 }, (_, i) => [i, Math.sin(i / 3) * 2] as Point);
    expect(simplifyLine(wavy, 0.05).length).toBeGreaterThan(simplifyLine(wavy, 1).length);
  });

  it('ringToPath daje zamkniętą ścieżkę, a projectLonLat stawia północ wyżej', () => {
    expect(ringToPath([[0, 0], [10.04, 5]])).toBe('M0.0 0.0L10.0 5.0Z');
    expect(ringToPath([])).toBe('');
    expect(projectLonLat(14, 55)).toEqual([0, 0]);
    expect(projectLonLat(14, 50)[1]).toBeGreaterThan(projectLonLat(14, 54)[1]);
  });

  it('domyślne ustawienia mają sensowne czasy', () => {
    expect(DEFAULT_MOTION.idleMs).toBeGreaterThan(DEFAULT_MOTION.jumpMs);
    expect(DEFAULT_MOTION.reducedMotion).toBe(false);
  });
});
