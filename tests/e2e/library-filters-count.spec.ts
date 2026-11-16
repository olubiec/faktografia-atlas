import { expect, test } from '@playwright/test';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Licznik filtrów biblioteki na telefonie (@S21)', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test.beforeEach(async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });
  });

  test('po wejściu licznik pokazuje 0, a wybór „Powiaty” podnosi go do 1 i ustawia l=5', async ({
    page,
  }) => {
    await page.goto('/biblioteka');

    const toggle = page.getByTestId('library-filters-mobile-toggle');
    await expect(toggle).toContainText('Filtry (aktywne: 0)');

    await toggle.click();
    await page
      .getByTestId('library-filters')
      .getByRole('button', { name: /Powiaty/i })
      .click();

    await expect(page).toHaveURL(/[?&]l=5/);
    await expect(toggle).toContainText('Filtry (aktywne: 1)');
  });
});
