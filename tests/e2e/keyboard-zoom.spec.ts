import { test, expect, type Page } from '@playwright/test';

const zoomOf = (page: Page) => page.evaluate(() => (window as any).__atlas.viewState.zoom as number);

test.describe('Zoom mapy klawiszami (@S16)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating !== true);
  });

  test('+ i - działają bez fokusu na mapie (@S16)', async ({ page }) => {
    const start = await zoomOf(page);
    await page.keyboard.press('+');
    await expect.poll(() => zoomOf(page)).toBeCloseTo(start + 0.5, 1);
    await page.keyboard.press('-');
    await expect.poll(() => zoomOf(page)).toBeCloseTo(start, 1);
  });

  test('+ w polu wyszukiwania nie zmienia zoomu (@S16)', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(input).toBeVisible();
    const start = await zoomOf(page);
    await page.keyboard.press('+');
    await page.waitForTimeout(300);
    expect(Math.abs((await zoomOf(page)) - start)).toBeLessThan(0.01);
  });

  test('z fokusem na mapie + daje dokładnie jeden krok (@S16)', async ({ page }) => {
    const start = await zoomOf(page);
    await page.locator('[aria-label="Mapa Polski"]').focus();
    await page.keyboard.press('+');
    await expect.poll(() => zoomOf(page)).toBeCloseTo(start + 0.5, 1);
    await page.waitForTimeout(300);
    expect(Math.abs((await zoomOf(page)) - (start + 0.5))).toBeLessThan(0.01);
  });
});
