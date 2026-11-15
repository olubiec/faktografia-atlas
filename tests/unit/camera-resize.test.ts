import { describe, it, expect } from 'vitest';
import { resizeCameraAction } from '@/core/map/camera-resize';

const base = {
  hasLocalityTarget: false,
  fittedKey: 'a' as string | null,
  nextKey: 'a',
  isResize: false,
  animating: false,
  userMoved: false,
};

describe('resizeCameraAction', () => {
  it('cel miejscowości ma pierwszeństwo przed resztą', () => {
    expect(resizeCameraAction({ ...base, hasLocalityTarget: true, fittedKey: null })).toBe('locality');
  });

  it('brak dopasowania wcześniej to start', () => {
    expect(resizeCameraAction({ ...base, fittedKey: null })).toBe('init');
  });

  it('zmiana klucza to animacja do nowego celu', () => {
    expect(resizeCameraAction({ ...base, nextKey: 'b' })).toBe('animate');
  });

  it('zmiana rozmiaru w trakcie animacji przelicza cel (retarget)', () => {
    expect(resizeCameraAction({ ...base, isResize: true, animating: true })).toBe('retarget');
  });

  it('zmiana rozmiaru bez animacji skacze od razu (instant)', () => {
    expect(resizeCameraAction({ ...base, isResize: true })).toBe('instant');
  });

  it('zmiana rozmiaru po ruchu użytkownika nic nie robi', () => {
    expect(resizeCameraAction({ ...base, isResize: true, userMoved: true })).toBe('none');
    expect(resizeCameraAction({ ...base, isResize: true, animating: true, userMoved: true })).toBe('none');
  });

  it('bez zmiany rozmiaru i klucza nic nie robi', () => {
    expect(resizeCameraAction(base)).toBe('none');
    expect(resizeCameraAction({ ...base, animating: true })).toBe('none');
  });
});
