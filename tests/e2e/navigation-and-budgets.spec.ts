import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' },
];

for (const vp of VIEWPORTS) {
  test.describe(`Pełna podróż po portalu i budżety zapytań (${vp.name})`, () => {
    test(`nawigacja przód/tył i budżet 0 zbędnych żądań sieciowych`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Licznik pobrań indeksu biblioteki (zliczamy po obserwacji, bez mockowania)
      let libraryIndexRequests = 0;
      page.on('request', (req) => {
        if (/\/library\/index\.json/.test(req.url())) libraryIndexRequests++;
      });

      // Ścieżka historii budowana z faktycznych adresów (klik w pojedynek może
      // zastąpić wpis zamiast dodać nowy - sprawdzamy to po długości historii).
      const trail: string[] = [];
      const path = () => {
        const u = new URL(page.url());
        return u.pathname + u.search;
      };

      // 1. Wejście na stronę główną
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await expect(page).toHaveURL(/\/(\?.*)?$/);
      trail.push(path());

      // 2. Przejście do /porownaj
      await page.goto('/porownaj');
      await expect(page).toHaveURL(/\/porownaj/);
      trail.push(path());

      // 3. Wybór gotowego pojedynku
      const comparisonBtn = page.getByRole('button', { name: /Warszawa vs Kraków/i });
      if (await comparisonBtn.isVisible()) {
        const lenBefore = await page.evaluate(() => window.history.length);
        await comparisonBtn.click();
        await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
        await expect(page.getByTestId('comparison-result')).toBeVisible();
        const lenAfter = await page.evaluate(() => window.history.length);
        if (lenAfter > lenBefore) trail.push(path());
        else trail[trail.length - 1] = path();
      }

      // 4. Przejście do /rankingi
      await page.goto('/rankingi');
      await expect(page).toHaveURL(/\/rankingi/);
      await expect(page.getByText(/mediana/i)).toBeVisible();
      trail.push(path());

      // 5. Przejście do /biblioteka
      await page.goto('/biblioteka');
      await expect(page).toHaveURL(/\/biblioteka/);
      trail.push(path());

      // 6. Seria Wstecz: adres zawsze zgodny z zapisaną ścieżką
      for (let i = trail.length - 2; i >= 0; i--) {
        await page.goBack();
        await expect.poll(path).toBe(trail[i]);
      }

      // 7. Seria Dalej: odtworzenie ścieżki w przód
      for (let i = 1; i < trail.length; i++) {
        await page.goForward();
        await expect.poll(path).toBe(trail[i]);
      }
      await expect(page).toHaveURL(/\/biblioteka/);

      // 8. Budżet żądań w obrębie jednej sesji SPA (bez przeładowania dokumentu):
      // powrót do wcześniej odwiedzonej biblioteki nie pobiera indeksu ponownie.
      await page.goto('/rankingi');
      await expect(page.getByText(/mediana/i)).toBeVisible();
      await page.evaluate(() => ((window as any).__sameDoc = true));
      const libLink = page.getByRole('link', { name: /Biblioteka/i }).first();
      if (!(await libLink.isVisible())) {
        // Na telefonie nawigacja jest schowana pod przyciskiem Menu
        await page.getByRole('button', { name: 'Menu' }).click();
      }
      await libLink.click();
      await expect(page).toHaveURL(/\/biblioteka/);
      await expect.poll(() => libraryIndexRequests).toBe(1);
      await page.waitForLoadState('networkidle');

      const before = libraryIndexRequests;
      await page.goBack();
      await expect(page).toHaveURL(/\/rankingi/);
      await page.goForward();
      await expect(page).toHaveURL(/\/biblioteka/);
      await page.waitForLoadState('networkidle');
      // dokument ten sam (nawigacja SPA), a powrót nie dołożył żadnego żądania
      expect(await page.evaluate(() => (window as any).__sameDoc)).toBe(true);
      expect(libraryIndexRequests - before).toBe(0);
    });
  });
}
