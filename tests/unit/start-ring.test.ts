import { describe, expect, it } from 'vitest';
import { ringWindow, wrapIndex } from '../../src/core/start/ring';

describe('karuzela w nieskończoność (ring)', () => {
  it('wrapIndex zawija w obie strony', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(12, 5)).toBe(2);
    expect(wrapIndex(3, 0)).toBe(0);
  });

  it('okno wokół pierwszej pozycji sięga na koniec listy', () => {
    const w = ringWindow(100, 0, 2);
    expect(w.map((s) => s.index)).toEqual([98, 99, 0, 1, 2]);
    expect(w.map((s) => s.offset)).toEqual([-2, -1, 0, 1, 2]);
  });

  it('okno przy małym pierścieniu nie powtarza pozycji', () => {
    const w = ringWindow(3, 1, 6);
    expect(w.map((s) => s.index).sort()).toEqual([0, 1, 2]);
    expect(ringWindow(1, 0, 6)).toEqual([{ offset: 0, index: 0 }]);
    expect(ringWindow(0, 0, 6)).toEqual([]);
  });
});
