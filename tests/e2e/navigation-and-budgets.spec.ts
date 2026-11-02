import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' },
];

for (const vp of VIEWPORTS) {
  test.describe(`Pełna podróż po portalu i budżety zapytań (${vp.name})`, () => {
    test(`nawigacja przód/tył i budżet 0 zbędnych żądań sieciowych`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      let profileShardRequests = 0;
      await page.route('**/data/profiles/*.json', async (route) => {
        profileShardRequests++;
        await route.continue();
      });

      // 1. Wejście na stronę główną
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await expect(page).toHaveURL(/\/(\?.*)?$/);

      // 2. Przejście do /porownaj
      await page.goto('/porownaj');
      await expect(page).toHaveURL(/\/porownaj/);

      // 3. Wybór gotowego pojedynku
      const comparisonBtn = page.getByRole('button', { name: /Warszawa vs Kraków/i });
      if (await comparisonBtn.isVisible()) {
        await comparisonBtn.click();
        await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
        await expect(page.getByTestId('comparison-result')).toBeVisible();
      }

      // 4. Przejście do /rankingi
      await page.goto('/rankingi');
      await expect(page).toHaveURL(/\/rankingi/);
      await expect(page.getByText(/mediana/i)).toBeVisible();

      // 5. Przejście do /biblioteka
      await page.goto('/biblioteka');
      await expect(page).toHaveURL(/\/biblioteka/);

      // 6. Seria Wstecz w historii przeglądarki
      await page.goBack();
      await expect(page).toHaveURL(/\/rankingi/);
      await expect(page.getByText(/mediana/i)).toBeVisible();

      await page.goBack();
      if (await comparisonBtn.isVisible()) {
        await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
      }

      await page.goBack();
      await expect(page).toHaveURL(/\/porownaj/);

      await page.goBack();
      await expect(page).toHaveURL(/\/(\?.*)?$/);

      // 7. Seria Dalej w historii przeglądarki
      await page.goForward();
      await expect(page).toHaveURL(/\/porownaj/);

      // 8. Weryfikacja budżetu żądań - po załadowaniu profilu powrót do niego nie generuje powtórnych pobrań
      await page.goto('/?e2e&u=1465011');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const requestsBefore = profileShardRequests;
      // Ponowne odwiedzenie tego samego profilu
      await page.goto('/?e2e&u=1465011');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      expect(profileShardRequests - requestsBefore).toBe(0);
    });
  });
}
