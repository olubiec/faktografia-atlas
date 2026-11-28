import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' },
];

for (const vp of VIEWPORTS) {
  test.describe(`Pełna podróż po portalu i budżety zapytań (${vp.name})`, () => {
    test(`nawigacja przód/tył i budżet 0 zbędnych żądań sieciowych`, async ({ page }) => {
      // Podróż po całym portalu plus nowe kroki wyboru jednostek potrafią przekroczyć domyślne 30 s na wolnym CI.
      test.setTimeout(180000);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      let profileShardRequests = 0;
      await page.route('**/data/profiles/*.json', async (route) => {
        profileShardRequests++;
        await route.continue();
      });

      // 1. Wejście na stronę główną
      await openMap(page, '?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await expect(page).toHaveURL(/\/mapa(\?.*)?$/);

      // 2. Przejście do /porownaj
      await page.goto('/porownaj');
      await expect(page).toHaveURL(/\/porownaj/);
      // Strona ładuje się leniwie (B03): czekamy na jej treść, zanim sprawdzimy przycisk.
      await page.waitForLoadState('networkidle');

      // 3. Wybór gotowego pojedynku
      const comparisonBtn = page.getByRole('button', { name: /Warszawa vs Kraków/i });
      if (await comparisonBtn.isVisible()) {
        await comparisonBtn.click();
        await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
        await expect(page.getByTestId('comparison-result')).toBeVisible();
      }

      // 4. Przejście do rankingu na /zestawienia
      await page.goto('/zestawienia?i=population');
      await expect(page).toHaveURL(/\/zestawienia/);
      await expect(page.getByText(/mediana/i)).toBeVisible();

      // 5-6. Seria Wstecz w historii przeglądarki (strony Biblioteki już nie ma)
      await page.goBack();
      await expect(page).toHaveURL(/\/porownaj/);

      await page.goBack();
      await expect(page).toHaveURL(/\/mapa(\?.*)?$/);

      // 7. Seria Dalej w historii przeglądarki
      await page.goForward();
      await expect(page).toHaveURL(/\/porownaj/);

      // 8. Weryfikacja budżetu żądań profilu.
      // Aplikacja gwarantuje jedno pobranie pliku profilu na województwo w całej wizycie
      // (pamięć w JavaScript, docs/PRODUKT.md §7). Pełne przeładowanie strony tę pamięć
      // zeruje, a serwer podglądu wysyła `no-cache`, więc po `reload` nie mierzymy zera,
      // tylko co najwyżej jedno pobranie.
      // Zmiana wybranej jednostki bez przeładowania: tak samo jak robią to wyszukiwarka
      // i lista „Jednostki w:” (pushState + zdarzenie popstate), więc działa tak samo
      // na komputerze i na telefonie.
      const selectInApp = async (teryt: string) => {
        await page.evaluate((t) => {
          window.history.pushState({}, '', `/?e2e&u=${t}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, teryt);
        await page.waitForFunction((t) => (window as any).__atlas?.selected === t, teryt);
        await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      };

      // (a) profil jednostki A (województwo 14)
      await openMap(page, '?e2e&u=1465011');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      const afterA = profileShardRequests;
      expect(afterA).toBeGreaterThan(0);

      // (b) inna jednostka z tego samego województwa, bez przeładowania: licznik bez zmian
      await selectInApp('1461011');
      expect(profileShardRequests).toBe(afterA);

      // (c) jednostka z innego województwa: dokładnie jedno nowe żądanie
      await selectInApp('1261011');
      expect(profileShardRequests - afterA).toBe(1);

      // powrót do A klawiszem Wstecz: bez nowych żądań
      const afterOther = profileShardRequests;
      await page.goBack();
      await page.waitForFunction(() => (window as any).__atlas?.selected?.startsWith('14') === true);
      expect(profileShardRequests).toBe(afterOther);

      // (d) po pełnym przeładowaniu otwarcie profilu A to najwyżej jedno żądanie
      const beforeReload = profileShardRequests;
      await openMap(page, '?e2e&u=1465011');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      expect(profileShardRequests - beforeReload).toBeLessThanOrEqual(1);
    });
  });
}
