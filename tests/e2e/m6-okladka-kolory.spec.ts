import { test, expect } from '@playwright/test';

// M6: okładka nie przenosi przygaszenia z animacji tła, więc przy odsłonięciu mapy nie ma skoku jasności.
for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test.describe(`@M6 okładka bez przygaszenia ${size.width}px`, () => {
    test.use({ viewport: size });

    test('wszystkie województwa na okładce dochodzą do pełnej jasności', async ({ page }) => {
      await page.goto('/?e2e');
      await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
      // Tło ma w tle przygaszone komórki (animacja); okładka je wygasza.
      await page.getByRole('link', { name: 'Otwórz mapę' }).click();
      const paths = page.locator('[data-slot="map-cover"] svg path');
      await expect(paths).toHaveCount(16);
      await expect
        .poll(async () => paths.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')), {
          timeout: 3000,
        })
        .toBe(true);
    });
  });
}
