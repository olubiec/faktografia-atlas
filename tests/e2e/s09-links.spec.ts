import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

// S09: linki do stron miejsc z mapy, stopki i adresu kanonicznego /mapa (docs/SEO.md D6, D9).
const denyConsent = () =>
  localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));

test.describe('@S25 @S09 linki wewnętrzne do stron miejsc', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(denyConsent);
  });

  test('profil powiatu → „Strona miejsca” prowadzi do strony z tym samym H1', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e&u=1206');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const heading = page.locator('h2', { hasText: 'Powiat krakowski' });
    await expect(heading).toBeVisible();
    const unitName = (await heading.first().innerText()).trim();

    const link = page.getByRole('link', { name: /Strona miejsca/ });
    await expect(link).toHaveAttribute('href', '/powiat/krakowski');
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await link.click();
    await expect(page).toHaveURL(/\/powiat\/krakowski$/);
    await expect(page.locator('h1')).toHaveText(unitName);
  });

  test('/mapa?u=12 ma adres kanoniczny strony województwa, /mapa – sam siebie', async ({ page }) => {
    await page.goto('/mapa?u=12');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://faktografia.eu/wojewodztwo/malopolskie',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

    await page.goto('/mapa');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://faktografia.eu/mapa');
  });

  test('stopka ma link „Miejsca” do /miejsca, a spis ma 16 województw', async ({ page }) => {
    await page.goto('/o-projekcie');
    const link = page.getByRole('contentinfo').getByRole('link', { name: 'Miejsca' });
    await expect(link).toHaveAttribute('href', '/miejsca');
    await link.click();
    await expect(page).toHaveURL(/\/miejsca$/);
    await expect(page.locator('h1')).toHaveText('Miejsca w Polsce');
    await expect(page.locator('main h2')).toHaveCount(16);
    await expect(page.getByRole('link', { name: 'Województwo małopolskie' })).toHaveAttribute(
      'href',
      '/wojewodztwo/malopolskie',
    );
    await expect(page.getByRole('link', { name: 'Powiat krakowski' })).toHaveAttribute('href', '/powiat/krakowski');
  });

  test('wejście na /mapa: bez żądania seo-paths.json i bez drugiego units.json (próg PRODUKT §7)', async ({ page }) => {
    test.setTimeout(90000);
    const requests: string[] = [];
    page.on('request', (req) => requests.push(new URL(req.url()).pathname));
    await openMap(page, '?e2e&u=1206');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await expect(page.getByRole('link', { name: /Strona miejsca/ })).toBeVisible();
    expect(requests.filter((p) => p.includes('seo-paths'))).toEqual([]);
    expect(requests.filter((p) => p.endsWith('/data/units.json'))).toHaveLength(1);
  });
});
