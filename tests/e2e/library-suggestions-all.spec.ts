import { expect, test } from '@playwright/test';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Podpowiedzi biblioteki z całego spisu (@S21)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });
  });

  test('„Mediana” podpowiada wskaźnik niepobrany i prowadzi do jego strony (@S21)', async ({ page }) => {
    await page.goto('/biblioteka');
    await page.locator('#library-search-input').fill('Mediana');

    const option = page.getByRole('option').filter({ hasText: 'Mediana wieku' });
    await expect(option).toBeVisible();
    await expect(option).toContainText('do zamówienia');

    await option.click();
    await expect(page).toHaveURL(/\/biblioteka\/104/);
    await expect(page.getByText('Ten wskaźnik jeszcze nie został pobrany')).toBeVisible();
  });
});
