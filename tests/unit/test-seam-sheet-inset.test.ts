import { describe, it, expect } from 'vitest';
import { installAtlasSeam } from '../../src/core/map/test-seam';
import type { AtlasState, WindowWithAtlas } from '../../src/core/map/test-seam';
import { setSheetInset } from '../../src/view/map/sheetInset';

const sampleState: AtlasState = {
  ready: true,
  layers: [],
  selected: null,
  viewState: { longitude: 19.9, latitude: 50.0, zoom: 7.5 },
  theme: 'light',
  choropleth: null,
  profileOpen: false,
};

describe('Szew testowy: sheetInset', () => {
  it('z ?e2e wystawia bieżący margines arkusza', () => {
    const win: WindowWithAtlas = { location: { search: '?e2e' } };
    installAtlasSeam(win, () => sampleState);
    setSheetInset(123);
    expect(win.__atlas?.sheetInset).toBe(123);
    setSheetInset(0);
    expect(win.__atlas?.sheetInset).toBe(0);
  });

  it('bez ?e2e nie ma __atlas', () => {
    const win: WindowWithAtlas = { location: { search: '' } };
    installAtlasSeam(win, () => sampleState);
    setSheetInset(50);
    expect(win.__atlas).toBeUndefined();
    setSheetInset(0);
  });
});
