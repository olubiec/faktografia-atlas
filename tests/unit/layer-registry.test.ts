import { describe, it, expect } from 'vitest';
import adminTopo from '../../public/geo/admin.topo.json';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import { getDrillState } from '../../src/core/map/drill';
import {
  getLayerFactories,
  createMapLayers,
  getMapColorsFromCss,
} from '../../src/view/map/layers';
import type { Unit, UnitIndex } from '../../src/core/units/types';

describe('Layer Registry (CC4.R)', () => {
  const index: UnitIndex = buildIndex(unitsData as Unit[]);
  const colors = getMapColorsFromCss();

  it('getLayerFactories() zwraca fabryki w stałej kolejności z Unikalnymi ID', () => {
    const factories = getLayerFactories();
    expect(Array.isArray(factories)).toBe(true);
    expect(factories.length).toBeGreaterThanOrEqual(4);

    const ids = factories.map((f) => f.id);
    expect(ids).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);
  });

  it('tworzy warstwy zachowując id i kolejność w zależności od stanu drill', () => {
    // Stan domyślny (kraj)
    const countryDrill = getDrillState(null, index);
    const countryLayers = createMapLayers(adminTopo, colors, countryDrill);
    expect(countryLayers.map((l) => l.id)).toEqual(['woj-layer', 'country-layer']);

    // Stan województwa (np. '02')
    const wojDrill = getDrillState('02', index);
    const wojLayers = createMapLayers(adminTopo, colors, wojDrill);
    expect(wojLayers.map((l) => l.id)).toEqual(['woj-layer', 'pow-layer', 'country-layer']);

    // Stan powiatu (np. '0201')
    const powDrill = getDrillState('0201', index);
    const powLayers = createMapLayers(adminTopo, colors, powDrill);
    expect(powLayers.map((l) => l.id)).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);

    // Stan gminy (np. '0201011')
    const gmiDrill = getDrillState('0201011', index);
    const gmiLayers = createMapLayers(adminTopo, colors, gmiDrill);
    expect(gmiLayers.map((l) => l.id)).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);
  });
});
