import { expect, test } from '@playwright/test';
import { entryViewState } from '../../src/core/map/entry-frame';
import { posterRect } from '../../src/core/start/poster-frame';

type Atlas = { ready: boolean; camera: { animating: boolean; trace: { zoom: number; longitude: number; latitude: number }[] } };
const BBOX: [number, number, number, number] = [14.1234, 49.0069, 24.1455, 54.8353];

for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`@M3 wejście w mapę ${vp.width}px: start w kadrze plakatu, potem płynny dojazd`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await page.setViewportSize(vp);
    await page.goto('/?e2e');
    await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
    await page.getByRole('link', { name: 'Otwórz mapę' }).click();
    await expect(page).toHaveURL(/\/mapa/);
    await expect(page.locator('html')).toHaveAttribute('data-atlas-ready', '1', { timeout: 20000 });
    await page.waitForFunction(() => {
      const a = (window as unknown as { __atlas?: Atlas }).__atlas;
      return !!a && !a.camera.animating;
    });
    const trace = await page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.trace);
    expect(trace.length).toBeGreaterThanOrEqual(5);

    // Pierwszy kadr = kadr plakatu przeliczony na kontener mapy.
    const box = (await page.locator('[tabindex="0"][aria-label="Mapa Polski"]').boundingBox())!;
    const expected = entryViewState(BBOX, posterRect(BBOX, vp.width, vp.height), {
      left: box.x, top: box.y, width: box.width, height: box.height,
    });
    expect(Math.abs(trace[0].zoom - expected.zoom)).toBeLessThan(0.02);
    expect(Math.abs(trace[0].longitude - expected.longitude)).toBeLessThan(0.1);
    expect(Math.abs(trace[0].latitude - expected.latitude)).toBeLessThan(0.1);

    // Ruch w jedną stronę (bez cofania zoomu w połowie).
    const dz = trace.slice(1).map((v, i) => v.zoom - trace[i].zoom);
    const sign = Math.sign(dz.find((d) => Math.abs(d) > 1e-6) ?? 0);
    expect(dz.every((d) => d * sign >= -1e-6)).toBe(true);
  });
}
