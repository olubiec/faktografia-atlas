import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { countryBounds, initialViewState, mapLimits } from '../../src/core/map/view';
import type { Unit } from '../../src/core/units/types';

// Web Mercator projection helper for testing viewState projection
function projectMercator(
  lon: number,
  lat: number,
  centerLon: number,
  centerLat: number,
  zoom: number,
  width: number,
  height: number,
  tileSize = 512
): [number, number] {
  const mercatorLat = (l: number) =>
    Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));

  const x =
    width / 2 + (tileSize * Math.pow(2, zoom) * (lon - centerLon)) / 360;
  const centerY = mercatorLat(centerLat);
  const pointY = mercatorLat(lat);
  const y =
    height / 2 + (tileSize * Math.pow(2, zoom) * (centerY - pointY)) / (2 * Math.PI);

  return [x, y];
}

describe('Map View Logic (src/core/map/view.ts)', () => {
  const unitsPath = path.resolve('public/data/units.json');
  const units: Unit[] = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));

  describe('countryBounds', () => {
    it('returns bounding box covering all 16 voivodeships', () => {
      const bounds = countryBounds(units);
      expect(bounds).toHaveLength(4);
      const [west, south, east, north] = bounds;

      expect(west).toBeLessThan(east);
      expect(south).toBeLessThan(north);

      const voivodeships = units.filter((u) => u.level === 'woj');
      expect(voivodeships).toHaveLength(16);

      voivodeships.forEach((voivodeship) => {
        const [cLon, cLat] = voivodeship.centroid;
        expect(cLon).toBeGreaterThanOrEqual(west);
        expect(cLon).toBeLessThanOrEqual(east);
        expect(cLat).toBeGreaterThanOrEqual(south);
        expect(cLat).toBeLessThanOrEqual(north);
      });
    });
  });

  describe('initialViewState', () => {
    const bounds = countryBounds(units);

    const testContainers = [
      { width: 800, height: 600 },
      { width: 1440, height: 900 },
      { width: 390, height: 400 },
    ];

    testContainers.forEach(({ width, height }) => {
      it(`fits country rectangle inside ${width}x${height} and fills >= 80% of smaller dimension`, () => {
        const viewState = initialViewState(bounds, width, height);

        expect(viewState).toHaveProperty('longitude');
        expect(viewState).toHaveProperty('latitude');
        expect(viewState).toHaveProperty('zoom');

        const [west, south, east, north] = bounds;

        const [xMin, yMax] = projectMercator(
          west,
          south,
          viewState.longitude,
          viewState.latitude,
          viewState.zoom,
          width,
          height
        );

        const [xMax, yMin] = projectMercator(
          east,
          north,
          viewState.longitude,
          viewState.latitude,
          viewState.zoom,
          width,
          height
        );

        // Fits inside container bounds (with minor floating point epsilon)
        expect(xMin).toBeGreaterThanOrEqual(-1e-4);
        expect(xMax).toBeLessThanOrEqual(width + 1e-4);
        expect(yMin).toBeGreaterThanOrEqual(-1e-4);
        expect(yMax).toBeLessThanOrEqual(height + 1e-4);

        const bboxWidthPx = xMax - xMin;
        const bboxHeightPx = yMax - yMin;
        const smallerDimension = Math.min(width, height);

        // Fills at least 80% of smaller dimension
        const maxFilled = Math.max(bboxWidthPx, bboxHeightPx);
        expect(maxFilled).toBeGreaterThanOrEqual(0.8 * smallerDimension);
      });
    });
  });

  describe('mapLimits', () => {
    it('returns maxBounds enlarged by 10% on each side, minZoomOffset -1 and maxZoom 12', () => {
      const testBounds: [number, number, number, number] = [14, 49, 24, 55];
      const limits = mapLimits(testBounds);

      const lonSpan = 24 - 14; // 10
      const latSpan = 55 - 49; // 6

      expect(limits.maxBounds).toEqual([
        14 - 0.1 * lonSpan,
        49 - 0.1 * latSpan,
        24 + 0.1 * lonSpan,
        55 + 0.1 * latSpan,
      ]);
      expect(limits.minZoomOffset).toBe(-1);
      expect(limits.maxZoom).toBe(12);
    });
  });
});
