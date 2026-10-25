import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Mobile Breadcrumbs Navigation (@S15)', () => {
  test('single-line breadcrumb height is <= 48px at 360px and 390px viewports (@S15)', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 740 });
      await page.goto('/?u=1603&e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const nav = page.locator('nav[aria-label="Ścieżka"]');
      await expect(nav).toBeVisible();

      const box = await nav.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeLessThanOrEqual(48);
      }

      // Check no horizontal scrollbar on page
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('clicking back arrow "‹" moves one level up (@S15)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?u=1603&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Close profile sheet if open so map controls are unobstructed
    const closeButton = page.locator('button[aria-label="Zamknij"]').first();
    await closeButton.click();
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

    const backButton = page.locator('nav[aria-label="Ścieżka"]').locator('button[aria-label="Wróć"]');
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === '16');
    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('16');

    const urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).toContain('u=16');
  });

  test('clicking "Polska" returns to country level (@S15)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?u=1603&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Close profile sheet if open so map controls are unobstructed
    const closeButton = page.locator('button[aria-label="Zamknij"]').first();
    await closeButton.click();
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

    const polskaButton = page.locator('nav[aria-label="Ścieżka"]').locator('button', { hasText: 'Polska' });
    await expect(polskaButton).toBeVisible();
    await polskaButton.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === null);
    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBeNull();

    const urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).not.toContain('u=');
  });

  test('touch targets on mobile are >= 44px (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?u=1603&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const nav = page.locator('nav[aria-label="Ścieżka"]');
    const backButton = nav.locator('button[aria-label="Wróć"]');
    await expect(backButton).toBeVisible();
    const backBox = await backButton.boundingBox();
    expect(backBox).not.toBeNull();
    if (backBox) {
      expect(backBox.width).toBeGreaterThanOrEqual(44);
      expect(backBox.height).toBeGreaterThanOrEqual(44);
    }

    const polskaButton = nav.locator('button', { hasText: 'Polska' });
    await expect(polskaButton).toBeVisible();
    const polskaBox = await polskaButton.boundingBox();
    expect(polskaBox).not.toBeNull();
    if (polskaBox) {
      expect(polskaBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('axe accessibility audit passes on mobile breadcrumbs (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?u=1603&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
