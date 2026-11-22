import { expect, test } from '@playwright/test';

const consent = () => {
  localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
};

test.describe('@S25 linki do stron miejsc', () => {
  test('@S25 /mapa?u=12 ma kanoniczny adres strony województwa', async ({ page }) => {
    await page.addInitScript(consent);
    await page.goto('/mapa?e2e&u=12');
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://faktografia.eu/wojewodztwo/malopolskie');
  });

  test('@S25 /mapa bez u: kanoniczny /mapa i brak żądania seo-paths.json', async ({ page }) => {
    await page.addInitScript(consent);
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('seo-paths.json')) requests.push(r.url());
    });
    await page.goto('/mapa?e2e');
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://faktografia.eu/mapa');
    await page.waitForFunction(() => (window as unknown as { __atlas?: { ready?: boolean } }).__atlas?.ready === true);
    expect(requests).toEqual([]);
  });

  test('@S25 profil powiatu ma link „Strona miejsca” do strony z tym samym H1', async ({ page }) => {
    await page.addInitScript(consent);
    await page.goto('/mapa?e2e&u=1206&l=pow');
    const link = page.getByRole('link', { name: /Strona miejsca/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/powiat/krakowski');
    await link.click();
    await expect(page).toHaveURL(/\/powiat\/krakowski$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('krakowski');
  });

  test('@S25 stopka ma link „Miejsca” do spisu', async ({ page }) => {
    await page.addInitScript(consent);
    await page.goto('/o-projekcie');
    const link = page.getByRole('contentinfo').getByRole('link', { name: 'Miejsca' });
    await expect(link).toHaveAttribute('href', '/miejsca');
    await link.click();
    await expect(page).toHaveURL(/\/miejsca$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Miejsca' })).toBeVisible();
  });
});
