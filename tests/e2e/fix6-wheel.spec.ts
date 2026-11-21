import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Płynne kółko myszy – @FIX6C.

type Atlas = { ready: boolean; viewState: { zoom: number } };
const zoomOf = (page: Page) =>
  page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas.viewState.zoom);

test.describe('Kółko myszy (@FIX6C)', () => {
  test.setTimeout(60_000);

  test('3 zdarzenia kółka: płynny, monotoniczny dojazd bez skoków (@FIX6C)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
    await page.waitForTimeout(1000);
    await page.mouse.move(720, 450);
    // próbkowanie zoomu co klatkę rAF
    await page.evaluate(() => {
      const w = window as unknown as { __atlas: Atlas; __zs: number[] };
      w.__zs = [];
      const tick = () => {
        w.__zs.push(w.__atlas.viewState.zoom);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    for (let i = 0; i < 3; i += 1) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1500);
    const end = await zoomOf(page);
    const zs = await page.evaluate(() => (window as unknown as { __zs: number[] }).__zs);
    // początek serii to jeszcze nieodświeżony stan widoku: liczymy od pierwszej zmiany
    const first = zs.findIndex((z) => z !== zs[0]);
    const samples = zs.slice(first);
    const start = samples[0];
    expect(end - start).toBeGreaterThanOrEqual(0.4);
    expect(end - start).toBeLessThanOrEqual(1.5);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] - 1e-9);
      expect(samples[i] - samples[i - 1]).toBeLessThanOrEqual(0.25);
    }
    await page.waitForTimeout(300);
    expect(await zoomOf(page)).toBeCloseTo(end, 6);
  });
});
