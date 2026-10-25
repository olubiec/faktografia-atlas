import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Compare Map Outlines (@S18)', () => {
  test('with ?c=12,14 window.__atlas shows two outlined units', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?c=12,14&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.layers).toContain('selected-outline-layer');
    expect(atlasState.selected).toBe('12,14');
    expect(atlasState.selected?.split(',')).toHaveLength(2);

    // Maximum 1 red pen circle annotation on screen
    const annotations = await page.locator('.rough-annotation').count();
    expect(annotations).toBeLessThanOrEqual(1);

    // Accessibility check
    const axeResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test('without ?c= shows single outlined unit when selected', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('12');
    expect(atlasState.layers).toContain('selected-outline-layer');
    expect(atlasState.selected?.split(',')).toHaveLength(1);
  });

  test('no horizontal scroll at 360px and 390px viewports with ?c=12,14', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/?c=12,14&e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const isNotHorizontallyScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(isNotHorizontallyScrollable).toBe(true);
    }
  });

  test('respects prefers-reduced-motion with ?c=12,14', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?c=12,14&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.reveal?.running).toBe(false);
    expect(atlasState.reveal?.progress).toBe(1);
  });
});
