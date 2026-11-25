import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildOutline } from '../../scripts/geo/start-outline.mjs';
import { countryBounds } from '../../src/core/map/view';
import { fitViewState, TOP_OVERLAY_PX } from '../../src/core/map/fit';
import { classColorToken, classify, legendBreaks } from '../../src/core/map/classes';
import { posterRect } from '../../src/core/start/poster-frame';
import { startFields, type StartFile } from '../../src/core/start/start-data';

// M1: plakat na `/` leży dokładnie tam, gdzie mapa rysuje Polskę w pierwszym kadrze.
const root = path.resolve(__dirname, '../..');
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const units = readJson('public/data/units.json');
const outline = readJson('public/geo/start-outline.json');
const start = readJson('public/data/start.json') as StartFile;
const bounds = countryBounds(units);

// Niezależny rzut Web Mercator: piksel ekranu dla punktu (lon, lat) przy widoku `v`.
function toPx(v: { longitude: number; latitude: number; zoom: number }, w: number, h: number, lon: number, lat: number) {
  const world = 512 * 2 ** v.zoom;
  const my = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
  return [
    w / 2 + ((lon - v.longitude) / 360) * world,
    h / 2 - ((my(lat) - my(v.latitude)) / (2 * Math.PI)) * world,
  ];
}

describe('M1 kadr plakatu = kadr mapy', () => {
  it('obrys ma bbox równy granicom kraju z mapy', () => {
    expect(outline.bbox).toHaveLength(4);
    outline.bbox.forEach((v: number, i: number) => expect(v).toBeCloseTo(bounds[i], 3));
  });

  it('generator daje Mercatora: proporcje viewBox = proporcje bbox w Mercatorze', () => {
    const [w, s, e, n] = outline.bbox as number[];
    const my = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
    const ratio = (((e - w) * Math.PI) / 180) / (my(n) - my(s));
    expect(outline.viewBox[0] / outline.viewBox[1]).toBeCloseTo(ratio, 2);
    expect(buildOutline).toBeTypeOf('function');
  });

  for (const [w, h] of [[390, 844], [1440, 900]]) {
    it(`prostokąt Polski różni się od kadru mapy o ≤ 2 px (${w}×${h})`, () => {
      const rect = posterRect(outline.bbox, w, h);
      const view = fitViewState(bounds, w, h, { top: TOP_OVERLAY_PX });
      const [x0, y0] = toPx(view, w, h, bounds[0], bounds[3]);
      const [x1, y1] = toPx(view, w, h, bounds[2], bounds[1]);
      expect(Math.abs(rect.left - x0)).toBeLessThanOrEqual(2);
      expect(Math.abs(rect.top - y0)).toBeLessThanOrEqual(2);
      expect(Math.abs(rect.left + rect.width - x1)).toBeLessThanOrEqual(2);
      expect(Math.abs(rect.top + rect.height - y1)).toBeLessThanOrEqual(2);
      // viewBox obrysu wypełnia prostokąt bez zniekształcenia
      expect(Math.abs(rect.width / rect.height - outline.viewBox[0] / outline.viewBox[1])).toBeLessThan(0.01);
    });
  }
});

describe('M1 kolory startu = klasy mapy', () => {
  it('każde województwo każdego z 4 wskaźników ma ten sam kolor co mapa', () => {
    for (const ind of start.indicators) {
      // Mapa liczy progi legendy przez legendBreaks (kwantyle + kalibracja), więc start też.
      const breaks = legendBreaks(Object.values(ind.values));
      const fromMap = new Map(
        Object.entries(ind.values).map(([t, v]) => [t, `var(${classColorToken(classify(v, breaks), breaks.length + 1, 'sequential', breaks)})`]),
      );
      for (const f of startFields(ind)) expect(f.color).toBe(fromMap.get(f.teryt));
    }
  });
});
