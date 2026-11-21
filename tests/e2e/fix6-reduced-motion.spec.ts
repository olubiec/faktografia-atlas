import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Ograniczony ruch: kamera skacze bez jazdy – @FIX6G.

type Atlas = {
  ready: boolean;
  selected: string | null;
  viewState: { longitude: number; latitude: number; zoom: number };
  camera: { animating: boolean; trace: { zoom: number }[] };
};
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);

test.describe('Reduced motion kamery (@FIX6G)', () => {
  test.setTimeout(90_000);

  test('wejście w województwo to skok: ślad ≤ 2, brak animacji po 100 ms (@FIX6G)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
    const before = (await atlas(page)).viewState.zoom;

    const trigger = page.locator('#home-search-field');
    if (await trigger.isVisible()) await trigger.click();
    else await page.keyboard.press('Control+k');
    const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(input).toBeVisible();
    await input.fill('małopolskie');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
    await page.keyboard.press('Enter');

    await page.waitForFunction(() => (window as unknown as { __atlas: Atlas }).__atlas.selected !== null);
    await page.waitForTimeout(100);
    const a = await atlas(page);
    expect(a.camera.animating).toBe(false);
    // Bez jazdy: tylko widok wyjściowy i skok na cel (powtórzenie celu to zapis spoczynku, nie klatka).
    const distinct = new Set(a.camera.trace.map((v) => v.zoom));
    expect(distinct.size).toBeLessThanOrEqual(2);
    expect(a.camera.trace.length).toBeLessThanOrEqual(3);
    expect(a.viewState.zoom).toBeGreaterThan(before + 0.5);
    if (a.camera.trace.length > 0) {
      expect(a.camera.trace[a.camera.trace.length - 1].zoom).toBeCloseTo(a.viewState.zoom, 6);
    }
  });
});
