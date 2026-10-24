import { test, expect } from '@playwright/test';

test.describe('Tile Reveal Sequence and Faded Background (@S16)', () => {
  test('direct navigation with ?u=12 on initial mount has reveal progress immediately 1 (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.reveal).toBeDefined();
    expect(atlasState.reveal.progress).toBe(1);
    expect(atlasState.reveal.running).toBe(false);
  });

  test('drilling down into voivodeship triggers reveal sequence with progress 0 -> 1 in <= 1s (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('u', '12');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    const revealState = await page.evaluate(() => (window as any).__atlas?.reveal);
    expect(revealState).toBeDefined();

    await page.waitForFunction(() => (window as any).__atlas?.reveal?.progress === 1, { timeout: 1500 });

    const finalState = await page.evaluate(() => (window as any).__atlas?.reveal);
    expect(finalState.progress).toBe(1);
    expect(finalState.running).toBe(false);
  });

  test('units outside active voivodeship are drawn and do not react to hover (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('12');
    expect(atlasState.layers).toContain('choropleth-layer');

    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);

    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).not.toBeVisible();
  });

  test('prefers-reduced-motion results in reveal progress = 1 immediately (@S16)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.reveal.progress).toBe(1);
    expect(atlasState.reveal.running).toBe(false);
  });
});
