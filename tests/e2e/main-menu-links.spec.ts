import { test, expect } from '@playwright/test';

// Zadanie P1-G: hamburger na telefonie zawiera wszystkie podstrony.
const MENU_LABELS = ['Biblioteka', 'Rankingi', 'Porównaj', 'O projekcie', 'Skąd są dane', 'Prywatność'];

// Linki w nagłówku widoczne po otwarciu menu (bez logo, które nie ma tekstu).
async function visibleMenuLabels(page: import('@playwright/test').Page) {
  const texts = await page.locator('header a:visible').allTextContents();
  return texts.map((t) => t.trim()).filter((t) => t !== '');
}

for (const viewport of [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
]) {
  test.describe(`Menu telefonu ${viewport.width}×${viewport.height} (P1-G, @S21)`, () => {
    test.use({ viewport });

    test('po otwarciu hamburgera jest 6 linków w kolejności, każdy min. 44 px (@S21)', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Menu' }).click();

      await expect.poll(() => visibleMenuLabels(page)).toEqual(MENU_LABELS);

      const links = page.locator('header a:visible').filter({ hasText: /\S/ });
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const box = await links.nth(i).boundingBox();
        expect(box, `link ${i}`).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('menu nie powoduje poziomego przewijania strony (@S21)', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Menu' }).click();
      await expect.poll(() => visibleMenuLabels(page)).toEqual(MENU_LABELS);

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });

    test('dotknięcie Prywatność otwiera /prywatnosc i zamyka menu (@S21)', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.locator('header a:visible', { hasText: 'Prywatność' }).click();

      await expect(page).toHaveURL(/\/prywatnosc$/);
      await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('header a:visible', { hasText: 'Prywatność' })).toHaveCount(0);
    });

    test('Esc zamyka menu (@S21)', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Menu' }).click();
      await expect.poll(() => visibleMenuLabels(page)).toEqual(MENU_LABELS);

      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
    });
  });
}
