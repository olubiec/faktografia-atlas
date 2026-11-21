import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

// B13: „Kopiuj link” stale w nagłówku /mapa (komputer i telefon); nie ma go na `/`.
for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test.describe(`@B13 Kopiuj link ${size.width}px`, () => {
    test.use({ viewport: size });

    test('widoczny w nagłówku bez profilu, kopiuje adres i potwierdza', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      await openMap(page, '?e2e');
      const button = page.locator('header').getByRole('button', { name: /Kopiuj link/ });
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
      await button.click();
      await expect(page.locator('header').getByRole('button', { name: 'Skopiowano' })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.evaluate(() => location.href));
    });

    test('brak przycisku na stronie startowej', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('header').getByRole('button', { name: /Kopiuj link/ })).toHaveCount(0);
    });
  });
}
