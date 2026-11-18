import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

function ctxWith(level: 'woj' | 'pow', classByTeryt: Record<string, string | number>, extra: Record<string, unknown> = {}) {
  return {
    topoData: {},
    colors,
    choropleth: { level, classByTeryt, classes: [], scheme: 'sequential', activeScope: { activeWojTeryt: null, activePowTeryt: null }, ...extra },
  } as never;
}
const layer = (level: 'woj' | 'pow', cls: Record<string, string | number>, extra: Record<string, unknown> = {}) =>
  choroplethLayerFactory.create(ctxWith(level, cls, extra)) as any;

function mockReduced(reduced: boolean) {
  // Środowisko node: minimalne atrapy okna i stylów (kolory spadają na wartości domyślne).
  vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced }) });
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
}

describe('choropleth bez przejść GPU (CN)', () => {
  beforeEach(() => {
    resetFillTransition();
    mockReduced(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('warstwa nie ma klucza transitions z czasem > 0, na każdym poziomie', () => {
    for (const [level, cls] of [['woj', { '12': 1 }], ['woj', { '12': 2 }], ['pow', { '1201': 1 }]] as const) {
      const t = layer(level, cls).props.transitions;
      expect(Object.values(t ?? {}).filter((v) => typeof v === 'number' && v > 0)).toHaveLength(0);
    }
  });

  it('prefers-reduced-motion: także bez przejść', () => {
    mockReduced(true);
    expect(layer('woj', { '12': 1 }).props.transitions ?? {}).toEqual({});
  });
});

describe('animacja koloru na CPU (CN)', () => {
  beforeEach(() => {
    resetFillTransition();
    mockReduced(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  const unit = { properties: { teryt: '12' } };
  const revealResults = new Map([['12', { teryt: '12', order: 0, delay: 0, duration: 150 }]]);

  it('reveal w toku: alfa rośnie gładko od 64 do 255 zamiast skoku', () => {
    const alphaAt = (progress: number) =>
      layer('woj', { '12': 1 }, { reveal: { running: true, progress }, revealResults }).props.getFillColor(unit)[3];
    const a0 = alphaAt(0);
    const a1 = alphaAt(0.05);
    const a2 = alphaAt(0.1);
    expect(a0).toBe(64);
    expect(a1).toBeGreaterThan(a0);
    expect(a2).toBeGreaterThan(a1);
    expect(alphaAt(0.2)).toBe(255);
  });

  it('po zakończeniu reveal kolor pełny', () => {
    const c = layer('woj', { '12': 1 }, { reveal: { running: false, progress: 1 }, revealResults }).props.getFillColor(unit);
    expect(c[3]).toBe(255);
  });

  it('zmiana klasy: kolor miesza się z poprzednim, a po blend.progress=1 jest docelowy', () => {
    layer('woj', { '12': 1 }, { indicatorId: 'a', year: 1, classes: 5 }).props.getFillColor(unit);
    const from = layer('woj', { '12': 1 }, { indicatorId: 'a', year: 1, classes: 5 }).props.getFillColor(unit);
    const mk = (progress: number, running: boolean) =>
      layer('woj', { '12': 5 }, { indicatorId: 'b', year: 1, classes: 5, blend: { running, progress } }).props.getFillColor(unit);
    const start = mk(0, true);
    const mid = mk(0.5, true);
    const end = mk(1, false);
    expect(Array.from(start)).toEqual(Array.from(from));
    expect(Array.from(mid)).not.toEqual(Array.from(start));
    expect(Array.from(mid)).not.toEqual(Array.from(end));
  });

  it('reduced-motion: kolor natychmiast docelowy', () => {
    mockReduced(true);
    layer('woj', { '12': 1 }, { indicatorId: 'a', year: 1, classes: 5 }).props.getFillColor(unit);
    const end = layer('woj', { '12': 5 }, { indicatorId: 'b', year: 1, classes: 5, blend: { running: false, progress: 1 } }).props.getFillColor(unit);
    const mid = layer('woj', { '12': 5 }, { indicatorId: 'b', year: 1, classes: 5, blend: { running: true, progress: 0.3 } }).props.getFillColor(unit);
    expect(Array.from(mid)).toEqual(Array.from(end));
  });
});
