import { test, expect } from '@playwright/test';

test.describe('Mobile Profile Sheet Scroll', () => {
  for (const size of [{ width: 390, height: 844 }, { width: 360, height: 740 }]) {
    test(`scrolls to bottom at 40% height on ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/?e2e&u=12');

      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const sheet = page.locator('[role="dialog"][aria-label="Województwo małopolskie"]').first();
      await expect(sheet).toBeVisible({ timeout: 10000 });

      await page.waitForFunction(() => {
        const el = document.querySelector('[role="dialog"]');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const visibleRatio = (window.innerHeight - rect.y) / window.innerHeight;
        return visibleRatio >= 0.35 && visibleRatio <= 0.45;
      });

      const shareButton = sheet.getByRole('button', { name: /Kopiuj link/i });
      await shareButton.scrollIntoViewIfNeeded();
      await expect(shareButton).toBeVisible();

      const box = await sheet.boundingBox().catch(() => null);
      expect(box).not.toBeNull();
      if (box) {
        const visibleHeight = size.height - box.y;
        const heightPercentage = visibleHeight / size.height;
        expect(heightPercentage).toBeLessThan(0.5);
      }
    });
  }
});