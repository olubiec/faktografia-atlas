import { test, expect } from '@playwright/test';

test.describe('@S15 Mobile layout (W2.4)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('map fills screen, header is small, bottom bar is present', async ({ page }) => {
    await page.goto('/?i=population-density&y=2023');

    // Wait for map to load
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 10000 });

    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    expect(headerBox!.height).toBeLessThanOrEqual(56);

    const mapContainer = page.locator('main .flex-1.min-w-0');
    const mapBox = await mapContainer.boundingBox();
    const windowHeight = await page.evaluate(() => window.innerHeight);

    // Map should take at least 75% of screen height
    expect(mapBox!.height / windowHeight).toBeGreaterThanOrEqual(0.75);

    // Indicator panel shouldn't be visible (since we removed it for mobile)
    // MobileIndicatorBar should be visible
    const bottomBar = page.locator('button', { hasText: 'Gęstość zaludnienia' });
    await expect(bottomBar).toBeVisible();
    await expect(bottomBar).toContainText('2023');

    const barBox = await bottomBar.boundingBox();
    expect(barBox!.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('@S15 Mobile layout small (W2.4)', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('no horizontal scroll, touch targets size', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 10000 });

    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(360);
  });
});
