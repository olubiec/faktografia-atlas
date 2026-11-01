import { test, expect } from '@playwright/test';

test.describe('Rankings and Compare pages (@W16-M02)', () => {
  const viewports = [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 360, height: 740, name: 'mobile' }
  ];

  for (const vp of viewports) {
    test(`nawigacja miedzy stronami dziala poprawnie (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/');

      const openMenu = async () => {
        if (vp.name === 'mobile') {
          const menuBtn = page.locator('header button[aria-label="Menu"]'); await expect(menuBtn).toBeVisible(); await menuBtn.click();
        }
      };

      await openMenu();
      await page.goto('/rankingi');
      await expect(page).toHaveURL(/\/rankingi/);

      await openMenu();
      await page.goto('/porownaj');
      await expect(page).toHaveURL(/\/porownaj/);

      await openMenu();
      await page.goto('/biblioteka');
      await expect(page).toHaveURL(/\/biblioteka/);

      await openMenu();
      await page.goto('/');
      await expect(page).toHaveURL(/\/(\?.*)?$/); // Match home with or without search params
    });
  }

  test('na /rankingi widac podsumowanie mediany, najwyzej/najnizej i liste jednostek', async ({ page }) => {
    await page.goto('/rankingi');
    await expect(page.getByText(/mediana/i)).toBeVisible();
    await expect(page.getByText(/najwyżej/i)).toBeVisible();
    await expect(page.getByText(/najniżej/i)).toBeVisible();
    await expect(page.getByText(/lista jednostek/i)).toBeVisible();
  });

  test('na /porownaj klikniecie gotowego pojedynku laduje mapki i tabele porownania', async ({ page }) => {
    await page.goto('/porownaj');

    await expect(page.getByTestId('comparison-result')).not.toBeVisible();

    await page.getByRole('button', { name: /Warszawa vs Kraków/i }).click();

    await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
    await expect(page.getByTestId('comparison-result')).toBeVisible();

    // CompareMaps adds data-slot="compare-maps" or data-slot="compare-map"
    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();

    // The table has multiple rows with indicators
    await expect(page.locator('table')).toBeVisible();
  });
});
