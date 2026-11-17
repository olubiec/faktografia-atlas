import { describe, expect, it } from 'vitest';
import { shiftForLayout } from '../../src/view/map/hooks/useMapViewState';

describe('korekta kamery przy zmianie układu (FIX3)', () => {
  const v = { longitude: 19, latitude: 52, zoom: 6 };
  it('bez zmiany szerokości nic się nie przesuwa', () => {
    expect(shiftForLayout(v, 0)).toBe(v);
  });
  it('mapa zwęża się o 440 px: środek idzie na zachód o 220 px', () => {
    const out = shiftForLayout(v, 440);
    expect(out.longitude).toBeCloseTo(19 - (220 * 360) / (512 * 64), 6);
    expect(out.latitude).toBe(52);
    expect(out.zoom).toBe(6);
  });
  it('mapa się poszerza: przesunięcie w drugą stronę', () => {
    expect(shiftForLayout(v, -440).longitude).toBeGreaterThan(19);
  });
});
