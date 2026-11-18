import { describe, it, expect } from 'vitest';
import adminTopo from '../../public/geo/admin.topo.json';
import { getMapColorsFromCss, getLayerFactories } from '../../src/view/map/layers';
import { selectedOutlineLayerFactory } from '../../src/view/map/layers/choropleth';
import type { OutlineLayerContext } from '../../src/view/map/layers/choropleth';

const GMINA = '0201011';
const colors = getMapColorsFromCss();

function makeCtx(over: Partial<OutlineLayerContext> = {}): OutlineLayerContext {
  return {
    topoData: adminTopo,
    colors,
    drillState: { selected: GMINA } as OutlineLayerContext['drillState'],
    viewState: { longitude: 0, latitude: 0, zoom: 5 },
    mapWidthPx: 1000,
    reducedMotion: false,
    ...over,
  };
}

// deck.gl trzyma propsy warstwy w `props`; alfa to czwarty element koloru linii.
function lineAlpha(ctx: OutlineLayerContext): number {
  const layer = selectedOutlineLayerFactory.create(ctx) as any;
  return (layer.props.getLineColor as number[])[3];
}

describe('obrys wybranej jednostki gaśnie z przybliżeniem (QC302)', () => {
  it('przy małej skali (gmina, zoom kraju) alfa = 0', () => {
    expect(lineAlpha(makeCtx({ viewState: { longitude: 0, latitude: 0, zoom: 5 } }))).toBe(0);
  });

  it('przy dużej skali alfa = 255', () => {
    expect(lineAlpha(makeCtx({ viewState: { longitude: 0, latitude: 0, zoom: 12 } }))).toBe(255);
  });

  it('przy pośredniej skali alfa jest pomiędzy 0 a 255', () => {
    const a = lineAlpha(makeCtx({ viewState: { longitude: 0, latitude: 0, zoom: 6.6 } }));
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(255);
  });

  it('reducedMotion=true → przejście 0, false → 300', () => {
    const on = selectedOutlineLayerFactory.create(makeCtx({ reducedMotion: true })) as any;
    const off = selectedOutlineLayerFactory.create(makeCtx({ reducedMotion: false })) as any;
    expect(on.props.transitions.getLineColor).toBe(0);
    expect(off.props.transitions.getLineColor).toBe(300);
  });

  it('id warstwy bez zmian, a kolejność w rejestrze nietknięta', () => {
    const layer = selectedOutlineLayerFactory.create(makeCtx());
    expect(layer?.id).toBe('selected-outline-layer');
    expect(getLayerFactories().map((f) => f.id)).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);
  });

  it('brak zaznaczonej jednostki → brak warstwy', () => {
    expect(selectedOutlineLayerFactory.create(makeCtx({ drillState: undefined }))).toBeNull();
  });
});
