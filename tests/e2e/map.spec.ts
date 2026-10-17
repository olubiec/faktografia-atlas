import { test, expect } from '@playwright/test';

test.describe('Map Component (CC4.1b)', () => {
  test('empty MapLibre style with kalka background color - no external tile requests', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      try {
        const parsed = new URL(url);
        // Any host other than localhost / 127.0.0.1 is external
        if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1' && !url.startsWith('data:') && !url.startsWith('blob:')) {
          externalRequests.push(url);
        }
      } catch {
        // Ignore invalid URLs
      }
    });

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    expect(externalRequests).toEqual([]);
  });

  test('test seam window.__atlas exists only with ?e2e and reports correct state', async ({ page }) => {
    await page.goto('/');
    const atlasWithoutE2e = await page.evaluate(() => (window as any).__atlas);
    expect(atlasWithoutE2e).toBeUndefined();

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState).toBeDefined();
    expect(atlasState.ready).toBe(true);
    expect(atlasState.layers).toContain('woj-layer');
    expect(atlasState.layers).toContain('country-layer');
    expect(atlasState.viewState.longitude).toBeGreaterThanOrEqual(14);
    expect(atlasState.viewState.longitude).toBeLessThanOrEqual(24);
    expect(atlasState.viewState.latitude).toBeGreaterThanOrEqual(49);
    expect(atlasState.viewState.latitude).toBeLessThanOrEqual(55);
  });

  test('theme toggle updates window.__atlas.theme without page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const initialTheme = await page.evaluate(() => (window as any).__atlas.theme);

    const themeButton = page.locator('header button', { hasText: 'Motyw:' }).first();
    await expect(themeButton).toBeVisible();

    // Cycle through themes until theme in __atlas changes
    for (let i = 0; i < 3; i++) {
      await themeButton.click();
      const currentTheme = await page.evaluate(() => (window as any).__atlas.theme);
      if (currentTheme !== initialTheme) {
        break;
      }
    }

    const newTheme = await page.evaluate(() => (window as any).__atlas.theme);
    expect(newTheme).not.toBe(initialTheme);
  });

  test('keyboard controls (+, -, arrows) pan and zoom map, aria-label="Mapa Polski"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const mapContainer = page.locator('[aria-label="Mapa Polski"]');
    await expect(mapContainer).toBeVisible();

    await mapContainer.focus();

    const startLon = await page.evaluate(() => (window as any).__atlas.viewState.longitude);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    const lonAfterRight = await page.evaluate(() => (window as any).__atlas.viewState.longitude);
    expect(lonAfterRight).not.toBe(startLon);

    const startZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    await page.keyboard.press('+');
    await page.waitForTimeout(300);

    const zoomAfterPlus = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(zoomAfterPlus).toBeGreaterThan(startZoom);

    await page.keyboard.press('-');
    await page.waitForTimeout(300);

    const zoomAfterMinus = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(zoomAfterMinus).toBeLessThan(zoomAfterPlus);
  });

  test('no horizontal scroll at 390px viewport width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);
  });
});
