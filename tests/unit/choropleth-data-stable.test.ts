import { describe, expect, it, vi } from 'vitest';

const feat = (teryt: string) => ({ type: 'Feature', properties: { teryt }, geometry: { type: 'Polygon', coordinates: [] } });

// Stałe obiekty jak w prawdziwym loadGeoData (cache): te same referencje przy każdym wywołaniu.
const geo = {
  wojFeatures: { type: 'FeatureCollection', features: [feat('12'), feat('14')] },
  powFeatures: { type: 'FeatureCollection', features: [feat('1201'), feat('1202'), feat('1401')] },
  gmiFeatures: { type: 'FeatureCollection', features: [] },
};
vi.mock('@/view/map/layers/admin', async (orig) => ({
  ...(await orig<typeof import('@/view/map/layers/admin')>()),
  loadGeoData: () => geo,
}));

import {
  choroplethLayerFactory,
  choroplethNoDataLayerFactory,
  selectedOutlineLayerFactory,
} from '@/view/map/layers/choropleth';

const colors = { kalka: [0, 0, 0, 255], arkusz: [255, 255, 255, 255], tusz: [0, 0, 0, 255] } as never;

function ctxWith(classByTeryt: Record<string, string | number>, selected: string | null = null) {
  return {
    topoData: {},
    colors,
    drillState: { selected },
    choropleth: {
      level: 'pow',
      classByTeryt,
      classes: [],
      scheme: 'sequential',
      activeScope: { activeWojTeryt: '12', activePowTeryt: null },
    },
  } as never;
}

describe('stabilne referencje data warstw (W20-CN04)', () => {
  it('brak danych: ten sam classByTeryt i zakres = ta sama referencja data', () => {
    const cls = { '1201': 'no-data', '1202': 2 };
    const a = choroplethNoDataLayerFactory.create(ctxWith(cls)) as any;
    const b = choroplethNoDataLayerFactory.create(ctxWith(cls)) as any;
    expect(b.props.data).toBe(a.props.data);
  });

  it('brak danych: inny classByTeryt = inna referencja data', () => {
    const a = choroplethNoDataLayerFactory.create(ctxWith({ '1201': 'no-data' })) as any;
    const b = choroplethNoDataLayerFactory.create(ctxWith({ '1201': 'no-data' })) as any;
    expect(b.props.data).not.toBe(a.props.data);
  });

  it('obrys: ta sama wybrana jednostka = ta sama referencja data, inna = inna', () => {
    const cls = {};
    const a = selectedOutlineLayerFactory.create(ctxWith(cls, '1201')) as any;
    const b = selectedOutlineLayerFactory.create(ctxWith(cls, '1201')) as any;
    const c = selectedOutlineLayerFactory.create(ctxWith(cls, '1202')) as any;
    expect(b.props.data).toBe(a.props.data);
    expect(c.props.data).not.toBe(a.props.data);
  });

  it('warstwa kolorów: data to stała referencja z loadGeoData dla tego samego poziomu', () => {
    const a = choroplethLayerFactory.create(ctxWith({ '1201': 1 })) as any;
    const b = choroplethLayerFactory.create(ctxWith({ '1201': 2 })) as any;
    expect(a.props.data).toBe(geo.powFeatures);
    expect(b.props.data).toBe(a.props.data);
  });
});
