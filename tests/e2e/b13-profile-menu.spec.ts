import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// B13: profil miejsca – „Zmień wskaźnik” otwiera to samo okno „Wybierz dane” co mapa.
const SIZES = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];

async function ready(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await openMap(page, '?e2e&u=1217011&sheet=full');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

for (const size of SIZES) {
  test.describe(`@B13 profil: Zmień wskaźnik ${size.width}px`, () => {
    test.use({ viewport: size });

    test('wybór w oknie ustawia to samo i co na mapie, wiersze podstawowe się rozwijają', async ({ page }) => {
      await ready(page);
      const change = page.getByRole('button', { name: 'Zmień wskaźnik' }).first();
      await expect(change).toBeVisible({ timeout: 20_000 });
      expect((await change.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(page.getByRole('button', { name: /Dodaj wskaźnik$/ }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Przywróć podstawowe' })).toHaveCount(0);

      const before = new URL(page.url()).searchParams.get('i');
      await change.click();
      const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('bezrobocie');
      await dialog.getByRole('button', { name: /bezrobocia/i }).first().click();
      await expect(dialog).toBeHidden();
      await page.waitForFunction((b) => new URL(location.href).searchParams.get('i') !== b, before);
      const now = new URL(page.url()).searchParams.get('i');
      await page.waitForFunction((i) => (window as any).__atlas?.choropleth?.indicatorId === i, now);

      const row = page.getByTestId('profile-indicator-list').getByRole('button', { expanded: false }).filter({ hasNotText: /^Dodaj wskaźnik$/ }).first();
      await row.click();
      await expect(page.getByTestId('profile-indicator-list').getByRole('button', { expanded: true }).first()).toBeVisible();
    });
  });
}
