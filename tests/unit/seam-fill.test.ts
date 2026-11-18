import { describe, it, expect } from 'vitest';
import { installAtlasSeam } from '../../src/core/map/test-seam';
import type { AtlasState, WindowWithAtlas } from '../../src/core/map/test-seam';

const state: AtlasState = {
  ready: true,
  layers: [],
  selected: null,
  viewState: { longitude: 19.9, latitude: 52, zoom: 5 },
  theme: 'light',
  choropleth: null,
  profileOpen: false,
};

describe('Szew testowy: przejście koloru (fill)', () => {
  it('z ?e2e zwraca fill o kształcie { ms, dataKey }', () => {
    const win: WindowWithAtlas = { location: { search: '?e2e' } };
    installAtlasSeam(win, () => state);
    const fill = win.__atlas?.fill;
    expect(fill).toBeDefined();
    expect(typeof fill?.ms).toBe('number');
    expect(typeof fill?.dataKey).toBe('string');
  });

  it('bez ?e2e nie ma __atlas', () => {
    const win: WindowWithAtlas = { location: { search: '' } };
    installAtlasSeam(win, () => state);
    expect(win.__atlas).toBeUndefined();
  });
});
