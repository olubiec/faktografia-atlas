import { test, expect } from '@playwright/test';

test.describe('Drill Down Map Navigation (CC4.2)', () => {
  test('direct navigation with ?u=02 (voivodeship) zooms in and shows powiat layer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const initialZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);

    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('02');
    expect(atlasState.layers).toContain('pow-layer');
    expect(atlasState.layers).toContain('woj-layer');
    expect(atlasState.layers).toContain('country-layer');
    expect(atlasState.viewState.zoom).toBeGreaterThan(initialZoom);

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).toBeVisible();
  });

  test('direct navigation with ?u=0201 (powiat) shows gmi-layer while keeping parent layers', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=0201&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('0201');
    expect(atlasState.layers).toContain('gmi-layer');
    expect(atlasState.layers).toContain('pow-layer');
    expect(atlasState.layers).toContain('woj-layer');
    expect(atlasState.layers).toContain('country-layer');

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).toBeVisible();
  });

  test('invalid ?u= code is ignored and defaults to country view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=invalid999&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBeNull();
    expect(atlasState.layers).toEqual(['woj-layer', 'country-layer', 'choropleth-layer']);

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).not.toBeVisible();
  });

  test('Back ("Wróć") button steps back level by level and updates URL parameter ?u=', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=0201&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).toBeVisible();

    // Step 1: Back from powiat (0201) to voivodeship (02)
    await backButton.click();
    await page.waitForTimeout(200);

    let atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('02');
    expect(atlasState.layers).toContain('pow-layer');
    expect(atlasState.layers).not.toContain('gmi-layer');

    let urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).toContain('u=02');
    expect(urlParams).toContain('e2e');

    // Step 2: Back from voivodeship (02) to country (null)
    await backButton.click();
    await page.waitForFunction(() => (window as any).__atlas?.selected === null);

    atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBeNull();
    expect(atlasState.layers).toEqual(['woj-layer', 'country-layer', 'choropleth-layer']);

    urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).not.toContain('u=');
    expect(urlParams).toContain('e2e');

    // Back button is hidden at country level
    await expect(backButton).not.toBeVisible();
  });

  test('Back button has minimum 44px touch target and is keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).toBeVisible();

    const box = await backButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }

    // Keyboard navigation
    await backButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBeNull();
  });
});
