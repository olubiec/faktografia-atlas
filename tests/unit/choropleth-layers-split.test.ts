import { describe, expect, it, vi } from 'vitest';

const feat = (teryt: string) => ({ type: 'Feature', properties: { teryt }, geometry: { type: 'Polygon', coordinates: [] } });

// Małe dane zamiast pełnej topologii: 4 powiaty, dwa w województwie 12, dwa w 14.
vi.mock('@/view/map/layers/admin', async (orig) => ({
  ...(await orig<typeof import('@/view/map/layers/admin')>()),
  loadGeoData: () => ({
    wojFeatures: { type: 'FeatureCollection', features: [] },
    powFeatures: { type: 'FeatureCollection', features: [feat('1201'), feat('1202'), feat('1401'), feat('1402')] },
    gmiFeatures: { type: 'FeatureCollection', features: [] },
  }),
}));

import { choroplethLayerFactory, choroplethNoDataLayerFactory } from '@/view/map/layers/choropleth';

const colors = { kalka: [0, 0, 0, 255], arkusz: [255, 255, 255, 255], tusz: [0, 0, 0, 255] } as never;

function ctxWith(classByTeryt: Record<string, string | number>, activeWojTeryt: string | null = '12') {
  return {
    topoData: {},
    colors,
    choropleth: {
      level: 'pow',
      classByTeryt,
      classes: [],
      scheme: 'sequential',
      activeScope: { activeWojTeryt, activePowTeryt: null },
    },
  } as never;
}

describe('podział warstw choropleth (FIX6A)', () => {
  it('warstwa kolorów nie ma rozszerzenia wzoru ani getFillPattern', () => {
    const layer = choroplethLayerFactory.create(ctxWith({ '1201': 'no-data' })) as any;
    expect(layer.id).toBe('choropleth-layer');
    expect(layer.props.extensions ?? []).toHaveLength(0);
    expect(layer.props.getFillPattern).toBeUndefined();
  });

  it('warstwa kreskowania zawiera tylko cechy no-data w zakresie', () => {
    const layer = choroplethNoDataLayerFactory.create(
      ctxWith({ '1201': 'no-data', '1202': 3 })
    ) as any;
    expect(layer.id).toBe('choropleth-nodata-layer');
    expect(layer.props.data.features.map((f: any) => f.properties.teryt)).toEqual(['1201']);
    expect(layer.props.extensions).toHaveLength(1);
    expect(layer.props.pickable).toBe(false);
  });

  it('brak cech no-data w zakresie = brak warstwy kreskowania', () => {
    expect(choroplethNoDataLayerFactory.create(ctxWith({ '1201': 1, '1202': 2 }))).toBeNull();
  });

  it('cechy poza zakresem nie trafiają do kreskowania', () => {
    // 1401 i 1402 (poza woj. 12) nie mają danych, ale nie są w zakresie.
    const layer = choroplethNoDataLayerFactory.create(ctxWith({ '1201': 1, '1202': 2 })) as any;
    expect(layer).toBeNull();
    const only = choroplethNoDataLayerFactory.create(ctxWith({ '1201': 'no-data', '1202': 2 })) as any;
    expect(only.props.data.features.map((f: any) => f.properties.teryt)).not.toContain('1401');
  });
});
