import { expect, test } from '@playwright/test';

test.describe('@S25 statyczne strony miejsc', () => {
  test('@S25 powiat krakowski ma H1 i dane bez JavaScriptu', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const response = await page.goto('/powiat/krakowski');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('krakowski');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://faktografia.eu/powiat/krakowski');
    await context.close();
  });

  test('@S25 „Otwórz na mapie” otwiera mapę z zaznaczonym powiatem', async ({ page }) => {
    await page.goto('/powiat/krakowski');
    await page.getByRole('link', { name: 'Otwórz na mapie' }).click();
    await expect(page).toHaveURL(/\/mapa\?u=1206&l=pow/);
    await expect(page.getByLabel('Mapa Polski')).toBeVisible();
  });
});
