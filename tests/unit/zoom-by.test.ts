import { describe, expect, it } from 'vitest';
import { planCamera } from '../../src/core/map/camera-plan';
import { keyZoomDelta, zoomByTarget } from '../../src/core/map/zoom-by';
import type { ViewState } from '../../src/core/map/view';

const LIMITS = { minZoom: 4, maxZoom: 12 };
const at = (zoom: number): ViewState => ({ longitude: 19, latitude: 52, zoom });

describe('zoomByTarget (cel kroku przycisków i klawiszy)', () => {
  it('zoomBy(1) przy zoomie 6 daje cel 7, a plan ma czas > 0', () => {
    const to = zoomByTarget(at(6), 1, LIMITS);
    expect(to).not.toBeNull();
    expect(to?.zoom).toBe(7);
    const plan = planCamera(at(6), to as ViewState, { viewportWidthPx: 1000, reducedMotion: false });
    expect(plan.to.zoom).toBe(7);
    expect(plan.durationMs).toBeGreaterThan(0);
  });

  it('środek widoku zostaje bez zmian', () => {
    expect(zoomByTarget(at(6), -1, LIMITS)).toEqual(at(5));
  });

  it('na granicy nic nie robi (null) w obu kierunkach', () => {
    expect(zoomByTarget(at(LIMITS.maxZoom), 1, LIMITS)).toBeNull();
    expect(zoomByTarget(at(LIMITS.minZoom), -1, LIMITS)).toBeNull();
  });

  it('cel jest obcięty do granicy', () => {
    expect(zoomByTarget(at(LIMITS.maxZoom - 0.5), 1, LIMITS)?.zoom).toBe(LIMITS.maxZoom);
    expect(zoomByTarget(at(LIMITS.minZoom + 0.5), -1, LIMITS)?.zoom).toBe(LIMITS.minZoom);
  });

  it('reduced-motion: plan kroku ma czas 0 (ustawienie od razu)', () => {
    const to = zoomByTarget(at(6), 1, LIMITS) as ViewState;
    const plan = planCamera(at(6), to, { viewportWidthPx: 1000, reducedMotion: true });
    expect(plan.durationMs).toBe(0);
    expect(plan.to.zoom).toBe(7);
  });
});

describe('keyZoomDelta (klawisze + / = / -)', () => {
  it('+ i = przybliżają o 0,5, - oddala o 0,5', () => {
    expect(keyZoomDelta('+')).toBe(0.5);
    expect(keyZoomDelta('=')).toBe(0.5);
    expect(keyZoomDelta('-')).toBe(-0.5);
  });

  it('inne klawisze nie zmieniają zoomu', () => {
    expect(keyZoomDelta('ArrowUp')).toBeNull();
    expect(keyZoomDelta('a')).toBeNull();
  });

  it('klawisz + daje animowany cel zoom + 0,5 (plan z czasem > 0)', () => {
    const to = zoomByTarget(at(6), keyZoomDelta('+') as number, LIMITS) as ViewState;
    expect(to.zoom).toBe(6.5);
    const plan = planCamera(at(6), to, { viewportWidthPx: 1000, reducedMotion: false });
    expect(plan.durationMs).toBeGreaterThan(0);
  });
});
