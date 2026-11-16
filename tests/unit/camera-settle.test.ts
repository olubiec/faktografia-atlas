import { describe, it, expect } from 'vitest';
import { resizeCameraAction, SETTLE_WINDOW_MS } from '@/core/map/camera-resize';

const base = {
  hasLocalityTarget: false,
  fittedKey: 'a' as string | null,
  nextKey: 'a',
  isResize: true,
  animating: false,
  userMoved: false,
};

describe('resizeCameraAction: łagodny dojazd po animacji', () => {
  it('okno dojazdu to 1500 ms', () => {
    expect(SETTLE_WINDOW_MS).toBe(1500);
  });

  it('resize 200 ms po animacji daje settle', () => {
    expect(resizeCameraAction({ ...base, msSinceAnimationEnd: 200 })).toBe('settle');
  });

  it('resize 2000 ms po animacji daje instant', () => {
    expect(resizeCameraAction({ ...base, msSinceAnimationEnd: 2000 })).toBe('instant');
  });

  it('z reducedMotion wynik to instant', () => {
    expect(resizeCameraAction({ ...base, msSinceAnimationEnd: 200, reducedMotion: true })).toBe('instant');
  });

  it('po ruchu użytkownika nic się nie dzieje', () => {
    expect(resizeCameraAction({ ...base, msSinceAnimationEnd: 200, userMoved: true })).toBe('none');
  });

  it('w trakcie animacji cel jest podmieniany (retarget)', () => {
    expect(resizeCameraAction({ ...base, msSinceAnimationEnd: 200, animating: true })).toBe('retarget');
  });

  it('bez pola msSinceAnimationEnd wynik to instant', () => {
    expect(resizeCameraAction(base)).toBe('instant');
  });
});
