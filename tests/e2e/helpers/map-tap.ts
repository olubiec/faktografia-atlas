import type { Locator, Page } from '@playwright/test';

// Centroidy województw z public/data/units.json (lon, lat) – środek widocznej jednostki.
export const VOIVODESHIP_CENTROIDS = {
  pomorskie: { lon: 18.0368, lat: 54.2914 },
  zachodniopomorskie: { lon: 15.5432, lat: 53.5852 },
  podlaskie: { lon: 22.9691, lat: 53.1853 },
} as const;

const merc = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));

/**
 * Punkt w płótnie mapy (px względem płótna) dla współrzędnych geograficznych,
 * liczony z kamery wystawionej w window.__atlas.mapView (rzut Web Mercator, kafel 512 px).
 */
export async function canvasPoint(
  page: Page,
  canvas: Locator,
  lon: number,
  lat: number
): Promise<{ x: number; y: number }> {
  await page.waitForFunction(() => (window as any).__atlas?.mapView);
  const view = await page.evaluate(() => (window as any).__atlas.mapView);
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Brak płótna mapy');
  const world = 512 * Math.pow(2, view.zoom);
  return {
    x: Math.round(box.width / 2 + (world * (lon - view.longitude)) / 360),
    y: Math.round(box.height / 2 + (world * (merc(view.latitude) - merc(lat))) / (2 * Math.PI)),
  };
}
