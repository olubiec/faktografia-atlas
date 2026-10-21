import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { countryBounds, initialViewState } from '../../src/core/map/view';
import type { Unit } from '../../src/core/units/types';

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
  const mercatorLat = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
  const x = width / 2 + (tileSize * Math.pow(2, zoom) * (lon - centerLon)) / 360;
  const centerY = mercatorLat(centerLat);
  const pointY = mercatorLat(lat);
  const y = height / 2 + (tileSize * Math.pow(2, zoom) * (centerY - pointY)) / (2 * Math.PI);
  return [x, y];
}

test.describe('Map Zoom Out (@S14)', () => {
  const unitsPath = path.resolve('public/data/units.json');
  const units: Unit[] = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));
  const bounds = countryBounds(units);
  const [west, south, east, north] = bounds;

  const testViewports = [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ];

  for (const { width, height } of testViewports) {
    test(`allows zooming out to show full country with >= 3% margin on ${width}x${height} (@S14)`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const mapContainer = page.locator('[aria-label="Mapa Polski"]');
      await mapContainer.focus();

      // Oddalamy do oporu (- obniża zoom o 0.5, więc 6 naciśnięć obniża o 3.0, co natrafia na minZoom)
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('-');
      }
      await mapContainer.hover();
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(200);

      const viewState = await page.evaluate(() => (window as any).__atlas.viewState);
      const fitZoom = initialViewState(bounds, width, height).zoom;

      expect(viewState.zoom).toBeLessThanOrEqual(fitZoom);

      const corners: [number, number][] = [
        [west, south],
        [west, north],
        [east, south],
        [east, north],
      ];

      for (const [lon, lat] of corners) {
        const [x, y] = projectMercator(
          lon,
          lat,
          viewState.longitude,
          viewState.latitude,
          viewState.zoom,
          width,
          height
        );

        expect(x).toBeGreaterThanOrEqual(width * 0.03);
        expect(x).toBeLessThanOrEqual(width * 0.97);
        expect(y).toBeGreaterThanOrEqual(height * 0.03);
        expect(y).toBeLessThanOrEqual(height * 0.97);
      }
    });
  }

  test('recalculates minZoom when resizing viewport from 1440x900 to 390x844 (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const mapContainer = page.locator('[aria-label="Mapa Polski"]');
    await mapContainer.focus();

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('-');
    }
    await page.waitForTimeout(200);

    // Zmiana rozmiaru okna na telefon 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    await mapContainer.focus();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('-');
    }
    await page.waitForTimeout(200);

    const viewState = await page.evaluate(() => (window as any).__atlas.viewState);
    const fitZoom390 = initialViewState(bounds, 390, 844).zoom;

    expect(viewState.zoom).toBeLessThanOrEqual(fitZoom390);

    const corners: [number, number][] = [
      [west, south],
      [west, north],
      [east, south],
      [east, north],
    ];

    for (const [lon, lat] of corners) {
      const [x, y] = projectMercator(
        lon,
        lat,
        viewState.longitude,
        viewState.latitude,
        viewState.zoom,
        390,
        844
      );

      expect(x).toBeGreaterThanOrEqual(390 * 0.03);
      expect(x).toBeLessThanOrEqual(390 * 0.97);
      expect(y).toBeGreaterThanOrEqual(844 * 0.03);
      expect(y).toBeLessThanOrEqual(844 * 0.97);
    }
  });
});
