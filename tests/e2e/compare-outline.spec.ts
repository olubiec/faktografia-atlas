import { test, expect } from '@playwright/test';

test.describe('Obrys porównania znika po zamknięciu porównania (@S18)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
  });

  test('porównanie dwóch gmin obrysowuje dwie jednostki, zamknięcie czyści obrys i parametr compare', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=1465011&c=1465011,1465021&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    await expect
      .poll(() => page.evaluate(() => (window as any).__atlas?.outlinedIds?.length))
      .toBe(2);

    const clearButton = page.locator('button[aria-label="Wyczyść drugie miejsce"]').first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Po zamknięciu znika obrys porównania; zostaje tylko obrys wybranej jednostki A (istniejące zachowanie).
    await expect.poll(() => page.evaluate(() => (window as any).__atlas?.outlinedIds)).toEqual(['1465011']);
    expect(new URL(page.url()).searchParams.has('c')).toBe(false);
  });
});
