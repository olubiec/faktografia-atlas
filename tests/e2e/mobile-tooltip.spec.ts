import { test, expect } from '@playwright/test';

test.describe('Mobile Unit Tooltip (W2.9 / @S15)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Pre-set analytics consent to denied so ConsentBar doesn't obscure the bottom of the viewport
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
  });

  test('first tap on a voivodeship shows dymek with "Otwórz profil" button, ?u= remains unchanged @S15', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Tap central Poland (upper-middle of map area)
    const tapX = Math.round(box.width / 2);
    const tapY = Math.round(box.height * 0.35);

    await canvas.click({ position: { x: tapX, y: tapY } });

    // Verify dymek appears with "Otwórz profil" button
    const tooltip = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
    await expect(tooltip).toBeVisible();

    // Verify URL does not have ?u= parameter set yet
    const urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).not.toContain('u=');

    // Verify window.__atlas.selected is still null
    const selected = await page.evaluate(() => (window as any).__atlas.selected);
    expect(selected).toBeNull();
  });

  test('second tap on the same voivodeship opens profile @S15', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const tapX = Math.round(box.width / 2);
    const tapY = Math.round(box.height * 0.35);

    // First tap -> shows dymek
    await canvas.click({ position: { x: tapX, y: tapY } });
    const tooltip = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
    await expect(tooltip).toBeVisible();

    // Second tap on same coordinates -> opens profile
    await canvas.click({ position: { x: tapX, y: tapY } });

    await page.waitForFunction(() => (window as any).__atlas?.selected != null);
    const selected = await page.evaluate(() => (window as any).__atlas.selected);
    expect(selected).not.toBeNull();

    const urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).toContain('u=');
  });

  test('clicking "Otwórz profil" button opens profile @S15', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const tapX = Math.round(box.width / 2);
    const tapY = Math.round(box.height * 0.35);

    // First tap -> shows dymek
    await canvas.click({ position: { x: tapX, y: tapY } });

    const openProfileBtn = page.getByRole('button', { name: 'Otwórz profil' });
    await expect(openProfileBtn).toBeVisible();

    // Click "Otwórz profil" button
    await openProfileBtn.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected != null);
    const selected = await page.evaluate(() => (window as any).__atlas.selected);
    expect(selected).not.toBeNull();
  });

  test('tapping empty space on map hides dymek @S15', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const tapX = Math.round(box.width / 2);
    const tapY = Math.round(box.height * 0.35);

    // First tap -> shows dymek
    await canvas.click({ position: { x: tapX, y: tapY } });

    const tooltip = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
    await expect(tooltip).toBeVisible();

    // Tap near top-left corner of map canvas (outside Poland in Baltic Sea)
    await canvas.click({ position: { x: 15, y: 15 } });

    await expect(tooltip).not.toBeVisible();
  });

  test('dymek fits within screen bounds without horizontal scroll on 360px and 390px viewports @S15', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 740 });
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const canvas = page.locator('.maplibregl-canvas');
      const box = await canvas.boundingBox();
      if (!box) continue;

      // Tap near left edge of Poland (e.g. Lubuskie / Zachodniopomorskie)
      await canvas.click({ position: { x: Math.round(box.width * 0.25), y: Math.round(box.height * 0.35) } });
      let tooltip = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
      await expect(tooltip).toBeVisible();

      let isNotHorizontallyScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(isNotHorizontallyScrollable).toBe(true);

      // Tap near right edge of Poland (e.g. Podlaskie / Lubelskie)
      await canvas.click({ position: { x: Math.round(box.width * 0.75), y: Math.round(box.height * 0.35) } });
      tooltip = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
      await expect(tooltip).toBeVisible();

      isNotHorizontallyScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(isNotHorizontallyScrollable).toBe(true);
    }
  });

  test('"Otwórz profil" button has minimum 44px touch target size @S15', async ({ page }) => {
    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const tapX = Math.round(box.width / 2);
    const tapY = Math.round(box.height * 0.35);

    await canvas.click({ position: { x: tapX, y: tapY } });

    const openProfileBtn = page.getByRole('button', { name: 'Otwórz profil' });
    await expect(openProfileBtn).toBeVisible();

    const btnBox = await openProfileBtn.boundingBox();
    expect(btnBox).not.toBeNull();
    if (btnBox) {
      expect(btnBox.height).toBeGreaterThanOrEqual(44);
      expect(btnBox.width).toBeGreaterThanOrEqual(44);
    }
  });
});
