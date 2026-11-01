import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Compare Maps W2.22 (@S18)', () => {
  test('displays two mini maps with selected outlines matching unit TERYTs on desktop and mobile (@S18)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    // 1. Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const compareMaps = page.locator('[data-slot="compare-maps"]');
    await expect(compareMaps).toBeVisible();

    const miniMaps = page.locator('[data-slot="compare-map"]');
    await expect(miniMaps).toHaveCount(2);

    const mapA = page.locator('[data-selected="12"]');
    const mapB = page.locator('[data-selected="14"]');
    await expect(mapA).toBeVisible();
    await expect(mapB).toBeVisible();

    // Sprawdzenie czerwonego obrysu wybranej jednostki (var(--korekta))
    const selectedPathA = mapA.locator('path[data-selected="true"]');
    await expect(selectedPathA).toBeVisible();
    await expect(selectedPathA).toHaveAttribute('stroke', 'var(--korekta)');

    const selectedPathB = mapB.locator('path[data-selected="true"]');
    await expect(selectedPathB).toBeVisible();
    await expect(selectedPathB).toHaveAttribute('stroke', 'var(--korekta)');

    // 2. Mobile (360x740)
    await page.setViewportSize({ width: 360, height: 740 });
    await expect(compareMaps).toBeVisible();
    await expect(miniMaps).toHaveCount(2);

    // Brak poziomego przewijania
    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);
  });

  test('touch targets are at least 44px (@S18)', async ({ page }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const mapButtons = page.locator('[data-slot="compare-map"]');
    const count = await mapButtons.count();
    expect(count).toBe(2);

    for (let i = 0; i < count; i++) {
      const box = await mapButtons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('passes axe accessibility checks on compare maps (@S18)', async ({ page }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const results = await new AxeBuilder({ page })
      .include('[data-slot="compare-maps"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
