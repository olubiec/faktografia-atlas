import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// U10: „Pobierz i udostępnij” jest ukryte; „Kopiuj link” zostaje. ?share=1 przywraca przycisk.
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
];

const shareButton = (page: Page) => page.getByRole('button', { name: /Pobierz i udostępnij/ });

for (const vp of VIEWPORTS) {
  test.describe(`U10 ukryte udostępnianie, ${vp.width}px`, () => {
    test.use({ viewport: vp });

    test('mapa: panel wskaźnika nie ma przycisku „Pobierz i udostępnij”', async ({ page }) => {
      await openMap(page, '?e2e&i=density&l=pow');
      await expect(page.locator('main, #root').first()).toBeVisible();
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await expect(shareButton(page)).toHaveCount(0);
    });

    test('profil miejsca: brak „Pobierz i udostępnij”, jest „Kopiuj link”', async ({ page }) => {
      await openMap(page, '?e2e&u=12&sheet=full');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await expect(page.getByText('Kopiuj link').first()).toBeVisible();
      await expect(shareButton(page)).toHaveCount(0);
    });

    test('Porównaj: brak „Pobierz i udostępnij”, jest „Kopiuj link”', async ({ page }) => {
      await page.goto('/porownaj?c=1465,1261');
      await expect(page.getByTestId('compare-share')).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('Kopiuj link')).toBeVisible();
      await expect(shareButton(page)).toHaveCount(0);
    });

    test('Rankingi: brak „Pobierz i udostępnij”, jest „Kopiuj link”', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.getByText(/lista jednostek/i)).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('Kopiuj link')).toBeVisible();
      await expect(shareButton(page)).toHaveCount(0);
    });

    test('z ?share=1 przycisk wraca i otwiera okno (Rankingi)', async ({ page }) => {
      await page.goto('/rankingi?share=1');
      const btn = shareButton(page);
      await expect(btn).toBeVisible({ timeout: 20000 });
      await btn.click();
      await expect(page.getByRole('dialog', { name: 'Pobierz i udostępnij' })).toBeVisible();
    });
  });
}
