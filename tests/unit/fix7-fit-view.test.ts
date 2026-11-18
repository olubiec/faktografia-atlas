import { describe, it, expect } from 'vitest';
import { fitViewState, FIT_PADDING, TOP_OVERLAY_PX } from '../../src/core/map/fit';

// Obrys Polski (przybliżony, jak w aplikacji przed wczytaniem jednostek).
const POLAND: [number, number, number, number] = [14.12, 49.0, 24.15, 54.84];
const merc = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));

/** Rzut punktu na ekran (Web Mercator, kafel 512) dla danego widoku i rozmiaru kontenera. */
function project(lon: number, lat: number, v: { longitude: number; latitude: number; zoom: number }, w: number, h: number) {
  const world = 512 * Math.pow(2, v.zoom);
  return {
    x: w / 2 + (world * (lon - v.longitude)) / 360,
    y: h / 2 + (world * (merc(v.latitude) - merc(lat))) / (2 * Math.PI),
  };
}

describe('fitViewState: cała Polska mieści się w kontenerze', () => {
  for (const [w, h, name] of [
    [390, 731, 'telefon (portret)'],
    [1040, 836, 'desktop'],
    [1440, 900, 'szeroki desktop'],
  ] as const) {
    it(`${name} ${w}x${h}: bbox poza paskiem u góry, z marginesem`, () => {
      const v = fitViewState(POLAND, w, h, { top: TOP_OVERLAY_PX, bottom: 0 });
      const nw = project(POLAND[0], POLAND[3], v, w, h);
      const se = project(POLAND[2], POLAND[1], v, w, h);
      expect(nw.x).toBeGreaterThanOrEqual(FIT_PADDING / 2 - 1);
      expect(se.x).toBeLessThanOrEqual(w - FIT_PADDING / 2 + 1);
      expect(nw.y).toBeGreaterThanOrEqual(TOP_OVERLAY_PX - 1);
      expect(se.y).toBeLessThanOrEqual(h - FIT_PADDING / 2 + 1);
    });
  }

  it('dolny arkusz zabiera miejsce od dołu', () => {
    const h = 731;
    const v = fitViewState(POLAND, 390, h, { top: TOP_OVERLAY_PX, bottom: 200 });
    const se = project(POLAND[2], POLAND[1], v, 390, h);
    expect(se.y).toBeLessThanOrEqual(h - 200 + 1);
  });

  it('zoom zależy od rozmiaru kontenera (nie jest stały)', () => {
    const a = fitViewState(POLAND, 390, 731, { top: 64, bottom: 0 });
    const b = fitViewState(POLAND, 1440, 900, { top: 64, bottom: 0 });
    expect(b.zoom).toBeGreaterThan(a.zoom);
  });
});
