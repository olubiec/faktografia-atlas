import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Comparison and Mobile View Flow W2.17 (@S18)', () => {
  test('@s18 compare flow on desktop and mobile: URL c=, two outlines, copy link (3x in a row)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    for (let rep = 1; rep <= 3; rep++) {
      // 1. Desktop (1440x900)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/?e2e=1&u=12&c=12,14');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      expect(page.url()).toContain('c=12,14');

      await page.waitForFunction(
        () => (window as any).__atlas?.selected === '12,14' && (window as any).__atlas?.profileOpen === true
      );

      const atlasStateDesktop: any = await page.evaluate(() => (window as any).__atlas);
      expect(atlasStateDesktop).toBeDefined();
      expect(atlasStateDesktop.selected).toBe('12,14');

      // Check "Kopiuj link" button in profile footer
      const copyBtn = page.locator('button', { hasText: 'Kopiuj link' }).first();
      await expect(copyBtn).toBeVisible();
      const copyBox = await copyBtn.boundingBox();
      expect(copyBox).not.toBeNull();
      if (copyBox) {
        expect(copyBox.height).toBeGreaterThanOrEqual(44);
      }

      await copyBtn.click();
      expect(page.url()).toContain('c=12,14');

      // 2. Mobile (390x844)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?e2e=1&u=12&c=12,14');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const atlasStateMobile390: any = await page.evaluate(() => (window as any).__atlas);
      expect(atlasStateMobile390.selected).toBe('12,14');

      const scrollWidth390 = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth390 = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth390).toBeLessThanOrEqual(innerWidth390);

      // 3. Mobile (360x740)
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto('/?e2e=1&u=12&c=12,14');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const atlasStateMobile360: any = await page.evaluate(() => (window as any).__atlas);
      expect(atlasStateMobile360.selected).toBe('12,14');

      const scrollWidth360 = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth360 = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth360).toBeLessThanOrEqual(innerWidth360);
    }
  });

  test('@s18 no horizontal scroll at 360px and 390px viewports in application', async ({ page }) => {
    test.setTimeout(60000);

    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e=1&u=12&c=12,14');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    }
  });

  test('@s18 touch targets >= 44px, axe checks and prefers-reduced-motion', async ({ page }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);

    const buttons = page.locator('button:visible');
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
