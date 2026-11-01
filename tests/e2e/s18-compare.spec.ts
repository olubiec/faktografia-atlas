import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Comparison and Mobile View Flow W2.17 (@S18)', () => {
  test('@s18 compare flow on desktop and mobile: URL c=, two outlines, copy link', async ({
    page,
  }) => {
    // 1. Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    expect(page.url()).toContain('c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.selected === '12,14' &&
        (window as any).__atlas?.profileOpen === true
    );

    const atlasStateDesktop: any = await page.evaluate(() => (window as any).__atlas);
    expect(atlasStateDesktop).toBeDefined();
    expect(atlasStateDesktop.selected).toBe('12,14');

    // Sprawdzenie obecności mapek i tabeli w zakładce Porównaj
    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();

    // Sprawdzenie przycisku "Kopiuj link" w stopce profilu
    const copyBtn = page.locator('button', { hasText: 'Kopiuj link' }).first();
    await expect(copyBtn).toBeVisible();
    const copyBox = await copyBtn.boundingBox();
    expect(copyBox).not.toBeNull();
    if (copyBox) {
      expect(copyBox.height).toBeGreaterThanOrEqual(44);
    }

    await copyBtn.click();
    expect(page.url()).toContain('c=12,14');

    // 2. Mobile (360x740)
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const atlasStateMobile360: any = await page.evaluate(() => (window as any).__atlas);
    expect(atlasStateMobile360.selected).toBe('12,14');

    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-sticky-header"]')).toBeVisible();

    const scrollWidth360 = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth360 = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth360).toBeLessThanOrEqual(clientWidth360);
  });

  test('@s18 no horizontal scroll at 360px and 390px viewports in application', async ({
    page,
  }) => {
    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e=1&u=12&c=12,14');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    }
  });

  test('@s18 touch targets >= 44px, axe checks and prefers-reduced-motion', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    await expect(page.locator('[data-slot="profile-compare"]')).toBeVisible();

    const axeResults = await new AxeBuilder({ page })
      .include('[data-slot="profile-compare"]')
      .analyze();
    expect(axeResults.violations).toEqual([]);

    const buttons = page.locator('[data-slot="profile-compare"] button:visible');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.width >= 44 || box.height >= 44).toBe(true);
      }
    }

    const annotations = page.locator('.rough-annotation');
    const annCount = await annotations.count();
    expect(annCount).toBeLessThanOrEqual(1);
  });
});
