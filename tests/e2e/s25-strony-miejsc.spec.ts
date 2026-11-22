import { expect, test } from '@playwright/test';

// S07 (fala W25): statyczne strony miejsc z `pnpm build`, serwowane przez `vite preview`.
test.describe('Strony miejsc @S25', () => {
  test.describe('bez JavaScriptu', () => {
    test.use({ javaScriptEnabled: false });

    test('/powiat/krakowski zwraca 200 z nagłówkiem H1 i przyciskiem do mapy', async ({ page }) => {
      const response = await page.goto('/powiat/krakowski');
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText('Powiat krakowski');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://faktografia.eu/powiat/krakowski');
      const button = page.getByRole('link', { name: 'Otwórz na mapie' });
      await expect(button).toHaveAttribute('href', '/mapa?u=1206&l=pow');
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      await expect(page.locator('script[type="module"]')).toHaveCount(0);
    });
  });

  test('„Otwórz na mapie” otwiera mapę z zaznaczonym powiatem', async ({ page }) => {
    await page.goto('/powiat/krakowski');
    const button = page.getByRole('link', { name: 'Otwórz na mapie' });
    // Szew testowy window.__atlas działa tylko z parametrem ?e2e – dopisujemy go do adresu przycisku.
    await button.evaluate((a: HTMLAnchorElement) => {
      a.href = `${a.getAttribute('href')}&e2e`;
    });
    await button.click();
    await expect(page).toHaveURL(/\/mapa\?u=1206&l=pow/);
    await page.waitForFunction(() => (window as unknown as { __atlas?: { ready: boolean } }).__atlas?.ready === true);
    await page.waitForFunction(
      () => (window as unknown as { __atlas?: { selected: string | null } }).__atlas?.selected === '1206',
    );
  });
});
