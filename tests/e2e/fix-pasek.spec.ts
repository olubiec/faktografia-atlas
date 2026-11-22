import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

test.describe('Dolny pasek na telefonie (@fix-pasek)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  });

  test('pasek jest widoczny, przyklejony do dołu ekranu i rozwija się do góry (@fix-pasek)', async ({ page }) => {
    const bar = page.locator('[data-slot="mobile-indicator-bar"]');
    await expect(bar).toBeVisible();

    // Pasek leży w całości na ekranie i dotyka dolnej krawędzi (bez luki i bez przewijania strony).
    const box = await bar.boundingBox();
    expect(box).not.toBeNull();
    const viewportHeight = page.viewportSize()!.height;
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight);
    expect(box!.y + box!.height).toBeGreaterThanOrEqual(viewportHeight - 16);

    const button = bar.getByRole('button').first();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();

    const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
    await expect(sheet).toBeVisible();
    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    // Arkusz wyrasta od dołu: jego dolna krawędź jest przy dole ekranu, a góra wysoko nad paskiem.
    expect(sheetBox!.y).toBeLessThan(box!.y);
    expect(sheetBox!.y + sheetBox!.height).toBeGreaterThanOrEqual(viewportHeight - 1);
  });
});
