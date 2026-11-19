import { describe, it, expect } from 'vitest';
import adminTopo from '../../public/geo/admin.topo.json';
import { getMapColorsFromCss, createMapLayers, registerLayerFactory } from '../../src/view/map/layers';
import { selectedOutlineLayerFactory } from '../../src/view/map/layers/choropleth';
import type { DrillState } from '../../src/core/map/drill';

// AtlasMap rejestruje obrys przy imporcie; test robi to samo (rejestr jest per plik testowy).
registerLayerFactory(selectedOutlineLayerFactory);

const colors = getMapColorsFromCss();
const drill = { selected: '0201011' } as DrillState;

// Alfa obrysu gminy z warstw zbudowanych przez rejestr (tak jak w aplikacji).
function outlineAlpha(zoom: number, mapWidthPx?: number): number {
  const layers = createMapLayers(
    adminTopo,
    colors,
    drill,
    undefined,
    { longitude: 0, latitude: 0, zoom },
    undefined,
    undefined,
    mapWidthPx
  );
  const outline = layers.find((l) => l.id === 'selected-outline-layer') as any;
  return (outline.props.getLineColor as number[])[3];
}

describe('szerokość mapy dociera do obrysu (QC303)', () => {
  it('z szerokością mapy obrys gminy przy zoomie kraju jest wygaszony (alfa 0)', () => {
    expect(outlineAlpha(5, 1000)).toBe(0);
  });

  it('z szerokością mapy obrys przy dużym zoomie jest pełny (alfa 255)', () => {
    expect(outlineAlpha(12, 1000)).toBe(255);
  });

  it('bez szerokości mapy obrys nie gaśnie (jak dotąd)', () => {
    expect(outlineAlpha(5)).toBe(255);
  });
});
