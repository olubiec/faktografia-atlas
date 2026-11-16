import { test, expect, type Page } from '@playwright/test';

// N-34: /rankingi reagują na zmianę adresu z zewnątrz (link stopki, Wstecz) (@S21)
async function footerRankings(page: Page, mobile: boolean) {
  const footer = page.locator('footer');
  await footer.scrollIntoViewIfNeeded();
  if (mobile) await footer.locator('summary', { hasText: 'Narzędzia' }).click();
  await footer.getByRole('link', { name: 'Rankingi' }).click();
}

for (const vp of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  const mobile = vp.width < 768;
  test.describe(`@S21 /rankingi: zmiana adresu z zewnątrz (${vp.width}px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
    });

    test('link „Rankingi” w stopce przywraca wybór domyślny', async ({ page }) => {
      await page.goto('/rankingi?i=unemployment-rate&l=pow');
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('unemployment-rate');
      await expect(page.getByLabel('Wybierz poziom')).toHaveValue('pow');
      await footerRankings(page, mobile);
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('density');
      await expect(page.getByLabel('Wybierz poziom')).toHaveValue('woj');
      await expect(page.locator('main ul li')).toHaveCount(10);
      await expect.poll(() => new URL(page.url()).search).toBe('');
      expect(new URL(page.url()).pathname).toBe('/rankingi');
    });

    test('Wstecz po zmianie przez link wraca do poprzedniego wskaźnika', async ({ page }) => {
      await page.goto('/rankingi?i=unemployment-rate');
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('unemployment-rate');
      await footerRankings(page, mobile);
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('density');
      await page.goBack();
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('unemployment-rate');
      await expect(page).toHaveURL(/i=unemployment-rate/);
      await expect(page.locator('main ul li')).toHaveCount(10);
    });

    test('pisanie w „Szukaj jednostki” nie gubi znaków, historii ani nie pobiera wartości', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      const before = await page.evaluate(() => history.length);
      const valueRequests: string[] = [];
      page.on('request', (r) => {
        if (/\/data\/values\//.test(r.url())) valueRequests.push(r.url());
      });
      const input = page.getByLabel('Szukaj jednostki');
      await input.click();
      await input.pressSequentially('lubel', { delay: 30 });
      await expect(input).toHaveValue('lubel');
      await expect(page).toHaveURL(/q=lubel/);
      expect(await page.evaluate(() => history.length)).toBe(before);
      expect(valueRequests).toHaveLength(0);
    });
  });
}
