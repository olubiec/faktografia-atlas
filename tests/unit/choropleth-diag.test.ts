import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const feat = (teryt: string) => ({ type: 'Feature', properties: { teryt }, geometry: { type: 'Polygon', coordinates: [] } });

vi.mock('@/view/map/layers/admin', async (orig) => ({
  ...(await orig<typeof import('@/view/map/layers/admin')>()),
  loadGeoData: () => ({
    wojFeatures: { type: 'FeatureCollection', features: [feat('12'), feat('14')] },
    powFeatures: { type: 'FeatureCollection', features: [] },
    gmiFeatures: { type: 'FeatureCollection', features: [] },
  }),
}));

import {
  choroplethLayerFactory,
  choroplethNoDataLayerFactory,
  selectedOutlineLayerFactory,
  resolveTokenColor,
} from '@/view/map/layers/choropleth';
import { resetFillTransition } from '@/core/map/fill-transition';

const colors = { kalka: [0, 0, 0, 255], arkusz: [255, 255, 255, 255], tusz: [0, 0, 0, 255] } as never;
const ctx = (classByTeryt: Record<string, string | number>) =>
  ({
    topoData: {},
    colors,
    drillState: { selected: '12' },
    choropleth: { level: 'woj', classByTeryt, classes: [], scheme: 'sequential', activeScope: { activeWojTeryt: null, activePowTeryt: null } },
  }) as never;

function setSearch(search: string) {
  // Środowisko node: minimalne atrapy okna i stylów.
  vi.stubGlobal('window', { location: { search }, matchMedia: () => ({ matches: false }) });
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
}
const fillMs = (c: never) => (choroplethLayerFactory.create(c) as any).props.transitions.getFillColor;

describe('przełączniki ?diag= w warstwach choropleth (W20-CN05)', () => {
  beforeEach(() => {
    resetFillTransition();
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('notrans: przejście koloru 0 mimo tego samego klucza', () => {
    setSearch('');
    fillMs(ctx({ '12': 1 }));
    expect(fillMs(ctx({ '12': 2 }))).toBeGreaterThan(0);
    setSearch('?diag=notrans');
    expect(fillMs(ctx({ '12': 1 }))).toBe(0);
    expect(fillMs(ctx({ '12': 2 }))).toBe(0);
  });

  it('nohatch: brak warstwy kreskowania, a warstwa kolorów koloruje no-data na --linia', () => {
    setSearch('');
    expect(choroplethNoDataLayerFactory.create(ctx({ '12': 'no-data' }))).not.toBeNull();
    setSearch('?diag=nohatch');
    expect(choroplethNoDataLayerFactory.create(ctx({ '12': 'no-data' }))).toBeNull();
    const layer = choroplethLayerFactory.create(ctx({ '12': 'no-data' })) as any;
    const color = layer.props.getFillColor({ properties: { teryt: '12' } });
    expect(Array.from(color)).toEqual(Array.from(resolveTokenColor('--linia')));
  });

  it('nooutline: brak obrysu wybranej jednostki', () => {
    setSearch('');
    expect(selectedOutlineLayerFactory.create(ctx({}))).not.toBeNull();
    setSearch('?diag=nooutline');
    expect(selectedOutlineLayerFactory.create(ctx({}))).toBeNull();
  });

  it('bez diag zachowanie bez zmian, a console.info tylko przy zmianie wartości', () => {
    setSearch('?diag=nohatch');
    choroplethNoDataLayerFactory.create(ctx({ '12': 'no-data' }));
    choroplethNoDataLayerFactory.create(ctx({ '12': 'no-data' }));
    const calls = (console.info as any).mock.calls.filter((c: string[]) => String(c[0]).startsWith('[diag]'));
    expect(calls.length).toBeLessThanOrEqual(1);
    setSearch('');
    expect(choroplethNoDataLayerFactory.create(ctx({ '12': 'no-data' }))).not.toBeNull();
  });
});
