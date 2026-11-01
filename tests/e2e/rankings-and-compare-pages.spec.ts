import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Rankings and Compare Pages (@W16-M02)', () => {
  test('nawigacja między /, /rankingi, /porownaj i /biblioteka na komputerze (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Strona główna
    await page.goto('/');
    const nav = page.locator('header nav');
    const linkMap = nav.getByRole('link', { name: 'Mapa' });
    const linkRankings = nav.getByRole('link', { name: 'Rankingi' });
    const linkCompare = nav.getByRole('link', { name: 'Porównaj' });
    const linkLibrary = nav.getByRole('link', { name: 'Biblioteka' });

    await expect(linkMap).toBeVisible();
    await expect(linkRankings).toBeVisible();
    await expect(linkCompare).toBeVisible();
    await expect(linkLibrary).toBeVisible();
    await expect(linkMap).toHaveAttribute('aria-current', 'page');
    await expect(linkRankings).not.toHaveAttribute('aria-current', 'page');

    // 2. Przejście do /rankingi
    await linkRankings.click();
    await expect(page).toHaveURL(/\/rankingi/);
    await expect(linkRankings).toHaveAttribute('aria-current', 'page');
    await expect(linkMap).not.toHaveAttribute('aria-current', 'page');

    // 3. Weryfikacja podstrony /rankingi: mediana, najwyżej/najniżej, lista jednostek
    await expect(page.getByText('Mediana', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Najwyżej/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Najniżej/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Lista jednostek/i })).toBeVisible();

    // Mini-mapa SVG jest obecna
    const miniMap = page.locator('[data-slot="mini-map-container"] svg');
    await expect(miniMap).toBeVisible();

    // Filtrowanie jednostek przez wyszukiwarkę
    const searchInput = page.getByRole('searchbox', { name: 'Szukaj jednostki' });
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Kraków');
    await expect(page.locator('table').getByText('Kraków').first()).toBeVisible();

    // 4. Przejście do /porownaj
    await linkCompare.click();
    await expect(page).toHaveURL(/\/porownaj/);
    await expect(linkCompare).toHaveAttribute('aria-current', 'page');

    // 5. Weryfikacja podstrony /porownaj: 6 gotowych pojedynków i kliknięcie
    const duelBtn = page.getByTestId('duel-warszawa-krakow');
    await expect(duelBtn).toBeVisible();
    await duelBtn.click();

    // Ładowanie mapek i tabeli po kliknięciu pojedynku
    await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
    const compareMaps = page.locator('[data-slot="compare-maps"]');
    await expect(compareMaps).toBeVisible();
    const compareTable = page.locator('[data-slot="compare-table"]');
    await expect(compareTable).toBeVisible();

    // 6. Przejście do /biblioteka
    await linkLibrary.click();
    await expect(page).toHaveURL(/\/biblioteka/);
    await expect(linkLibrary).toHaveAttribute('aria-current', 'page');

    // 7. Powrót do /
    await linkMap.click();
    await expect(page).toHaveURL(/\/(?:\?.*)?$/);
    await expect(linkMap).toHaveAttribute('aria-current', 'page');
  });

  test('nawigacja i działanie na telefonie (360x740)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });

    // 1. Wejście na /
    await page.goto('/');

    const menuBtn = page.locator('header button[aria-label="Menu"]');
    await expect(menuBtn).toBeVisible();

    // Otwarcie menu
    await menuBtn.click();
    const mobileRankingsLink = page.locator('header').getByRole('link', { name: 'Rankingi' });
    await expect(mobileRankingsLink).toBeVisible();

    // Przejście na /rankingi
    await mobileRankingsLink.click();
    await expect(page).toHaveURL(/\/rankingi/);

    // Sprawdzenie braku przewijania poziomego na telefonie
    const scrollWidthRankings = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidthRankings = await page.evaluate(() => window.innerWidth);
    expect(scrollWidthRankings).toBeLessThanOrEqual(innerWidthRankings);

    // Sprawdzenie widoczności elementów na /rankingi
    await expect(page.getByText('Mediana', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Najwyżej/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Najniżej/i })).toBeVisible();

    // Przejście na /porownaj przez menu mobilne
    await menuBtn.click();
    const mobileCompareLink = page.locator('header').getByRole('link', { name: 'Porównaj' });
    await expect(mobileCompareLink).toBeVisible();
    await mobileCompareLink.click();
    await expect(page).toHaveURL(/\/porownaj/);

    // Sprawdzenie braku poziomego przewijania na /porownaj
    const scrollWidthCompare = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidthCompare = await page.evaluate(() => window.innerWidth);
    expect(scrollWidthCompare).toBeLessThanOrEqual(innerWidthCompare);

    // Kliknięcie gotowego pojedynku
    const duelBtn = page.getByTestId('duel-warszawa-krakow');
    await expect(duelBtn).toBeVisible();
    await duelBtn.click();

    // Sprawdzenie, że mapki i tabela załadowały się poprawnie na mobile
    await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();

    // Brak poziomego przewijania z załadowaną tabelą i mapkami
    const scrollWidthLoaded = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidthLoaded = await page.evaluate(() => window.innerWidth);
    expect(scrollWidthLoaded).toBeLessThanOrEqual(innerWidthLoaded);
  });

  test('pola dotykowe linków w nawigacji mają co najmniej 44x44 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const links = ['Mapa', 'Rankingi', 'Porównaj', 'Biblioteka', 'O projekcie', 'Skąd są dane'];
    for (const name of links) {
      const link = page.locator('header nav').getByRole('link', { name });
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('brak błędów dostępności axe na /rankingi i /porownaj', async ({ page }) => {
    // /rankingi
    await page.goto('/rankingi');
    await page.waitForLoadState('networkidle');
    const resultsRankings = await new AxeBuilder({ page })
      .disableRules(['region'])
      .analyze();
    expect(resultsRankings.violations).toEqual([]);

    // /porownaj
    await page.goto('/porownaj');
    await page.waitForLoadState('networkidle');
    const resultsCompare = await new AxeBuilder({ page })
      .disableRules(['region'])
      .analyze();
    expect(resultsCompare.violations).toEqual([]);
  });
});
