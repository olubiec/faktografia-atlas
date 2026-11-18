import { test, expect } from '@playwright/test';

// Obrys Polski (przybliżony); wystarczy do sprawdzenia, czy kraj mieści się w oknie mapy.
const POLAND = { w: 14.12, s: 49.0, e: 24.15, n: 54.84 };
const merc = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));

const SIZES = [
  { name: 'telefon', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const size of SIZES) {
  test(`@S21 FIX7 start: cała Polska widoczna w mapie (${size.name})`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true && (window as any).__atlas?.mapView);
    // Kamera ma się ustabilizować (start bez animacji, ale dajemy chwilę na ResizeObserver).
    await page.waitForTimeout(500);
    const { view, box } = await page.evaluate(() => {
      const el = document.querySelector('[aria-label="Mapa Polski"]') as HTMLElement;
      const r = el.getBoundingClientRect();
      return { view: (window as any).__atlas.mapView, box: { w: r.width, h: r.height } };
    });
    const world = 512 * Math.pow(2, view.zoom);
    const x = (lon: number) => box.w / 2 + (world * (lon - view.longitude)) / 360;
    const y = (lat: number) => box.h / 2 + (world * (merc(view.latitude) - merc(lat))) / (2 * Math.PI);
    expect(x(POLAND.w)).toBeGreaterThanOrEqual(0);
    expect(x(POLAND.e)).toBeLessThanOrEqual(box.w);
    expect(y(POLAND.n)).toBeGreaterThanOrEqual(0);
    expect(y(POLAND.s)).toBeLessThanOrEqual(box.h);
  });
}
