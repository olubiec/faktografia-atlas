import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import tokensJson from '../../config/tokens.json';

const feat = (teryt: string) => ({ type: 'Feature', properties: { teryt }, geometry: { type: 'Polygon', coordinates: [] } });

vi.mock('@/view/map/layers/admin', async (orig) => ({
  ...(await orig<typeof import('@/view/map/layers/admin')>()),
  loadGeoData: () => ({
    wojFeatures: { type: 'FeatureCollection', features: [feat('12'), feat('14')] },
    powFeatures: { type: 'FeatureCollection', features: [feat('1201'), feat('1401')] },
    gmiFeatures: { type: 'FeatureCollection', features: [] },
  }),
}));

import { choroplethLayerFactory } from '@/view/map/layers/choropleth';
import { resetFillTransition } from '@/core/map/fill-transition';

const colors = { kalka: [0, 0, 0, 255], arkusz: [255, 255, 255, 255], tusz: [0, 0, 0, 255] } as never;
const BASE = tokensJson.motion.base;

function ctxWith(level: 'woj' | 'pow', classByTeryt: Record<string, string | number>) {
  return {
    topoData: {},
    colors,
    choropleth: { level, classByTeryt, classes: [], scheme: 'sequential', activeScope: { activeWojTeryt: null, activePowTeryt: null } },
  } as never;
}
const ms = (level: 'woj' | 'pow', cls: Record<string, string | number>) =>
  (choroplethLayerFactory.create(ctxWith(level, cls)) as any).props.transitions.getFillColor;

function mockReduced(reduced: boolean) {
  // Środowisko node: minimalne atrapy okna i stylów (kolory spadają na wartości domyślne).
  vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced }) });
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
}

describe('przejście koloru choropleth (W20-CN01)', () => {
  beforeEach(() => {
    resetFillTransition();
    mockReduced(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('żaden wielokąt nie ma więcej niż jednego koloru podczas przejścia: zmiana zestawu cech = 0 ms, ten sam poziom = czas z tokenu', () => {
    expect(ms('woj', { '12': 1 })).toBe(0);
    expect(ms('woj', { '12': 2 })).toBe(BASE);
    expect(ms('pow', { '1201': 1 })).toBe(0);
    expect(ms('woj', { '12': 1 })).toBe(0);
  });

  it('prefers-reduced-motion: zawsze 0', () => {
    mockReduced(true);
    expect(ms('woj', { '12': 1 })).toBe(0);
    expect(ms('woj', { '12': 2 })).toBe(0);
    expect(ms('pow', { '1201': 1 })).toBe(0);
  });
});

describe('przejście koloru podczas reveal (W20-CN02)', () => {
  beforeEach(() => {
    resetFillTransition();
    mockReduced(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  const withReveal = (reveal: { running: boolean; progress: number }) => {
    const ctx = ctxWith('woj', { '12': 1 }) as any;
    ctx.choropleth.reveal = reveal;
    return (choroplethLayerFactory.create(ctx) as any).props.transitions.getFillColor;
  };

  it('reveal w toku: 0 ms, po zakończeniu: czas z tokenu', () => {
    withReveal({ running: false, progress: 1 });
    expect(withReveal({ running: true, progress: 0.4 })).toBe(0);
    expect(withReveal({ running: false, progress: 1 })).toBe(BASE);
  });
});
