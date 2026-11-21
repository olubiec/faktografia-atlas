import { test, expect } from '@playwright/test';

// C02: „Otwórz mapę” przechodzi do /mapa od razu, bez własnej animacji zamykania obrysu.
for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test.describe(`@C02 wejście do mapy ${size.width}px`, () => {
    test.use({ viewport: size });

    test('adres /mapa w czasie < 300 ms i mapa się rysuje', async ({ page }) => {
      await page.goto('/?e2e');
      await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
      const link = page.getByRole('link', { name: 'Otwórz mapę' });
      await link.click();
      await page.waitForURL(/\/mapa/, { timeout: 300 });
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    });

    test('reducedMotion: natychmiast', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/?e2e');
      await page.getByRole('link', { name: 'Otwórz mapę' }).click();
      await page.waitForURL(/\/mapa/, { timeout: 300 });
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    });
  });
}

test('@C02 w trakcie przejścia obrys nie ma skali > 1,1', async ({ page }) => {
  await page.goto('/?e2e');
  await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
  await page.evaluate(() => {
    (window as any).__scales = [];
    const tick = () => {
      const el = document.querySelector('[data-slot="start-background"] > div');
      if (el) (window as any).__scales.push(new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
      requestAnimationFrame(tick);
    };
    tick();
  });
  await page.getByRole('link', { name: 'Otwórz mapę' }).click();
  await page.waitForURL(/\/mapa/);
  const scales: number[] = await page.evaluate(() => (window as any).__scales);
  expect(scales.length).toBeGreaterThan(0);
  expect(Math.max(...scales)).toBeLessThanOrEqual(1.1);
});
