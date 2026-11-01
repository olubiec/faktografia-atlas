import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Strona /biblioteka: szukanie, kategorie, filtry i stan w URL (@S21)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });
  });

  test('wpisanie „ludnosc” zawęża listę i zapisuje ?q=', async ({ page }) => {
    await page.goto('/biblioteka');
    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');

    await expect(page).toHaveURL(/.*[?&]q=ludnosc/);

    const results = page.getByTestId('library-results');
    await expect(results.getByText('Struktura ludności: Liczba ludności ogółem')).toBeVisible();
    await expect(results.getByText('Struktura ludności: Ludność w wieku produkcyjnym')).toBeVisible();
  });

  test('wejście w dział zapisuje ?k=', async ({ page }) => {
    await page.goto('/biblioteka');

    const categoryTiles = page.getByTestId('category-tiles');
    const ludnoscButton = categoryTiles.getByRole('button', { name: /Ludność/i });
    await ludnoscButton.click();

    await expect(page).toHaveURL(/.*[?&]k=1/);
    await expect(categoryTiles.getByText('Struktura ludności')).toBeVisible();
  });

  test('wklejenie adresu z ?k=…&q=… odtwarza ten sam widok', async ({ page }) => {
    await page.goto('/biblioteka?k=1&q=ogolem&l=5&p=1');

    const searchInput = page.locator('#library-search-input');
    await expect(searchInput).toHaveValue('ogolem');

    const filters = page.getByTestId('library-filters');
    const levelPowiaty = filters.getByRole('button', { name: /Powiaty/i });
    await expect(levelPowiaty).toHaveAttribute('aria-pressed', 'true');

    const checkboxOnlyReady = page.locator('#library-filter-only-ready');
    await expect(checkboxOnlyReady).toBeChecked();

    const results = page.getByTestId('library-results');
    await expect(results.getByText('Struktura ludności: Liczba ludności ogółem')).toBeVisible();
    await expect(results.getByText('Struktura ludności: Ludność w wieku produkcyjnym')).toBeHidden();
  });

  test('przycisk „wstecz” w przeglądarce wraca do poprzedniego stanu', async ({ page }) => {
    await page.goto('/biblioteka');

    const categoryTiles = page.getByTestId('category-tiles');
    await categoryTiles.getByRole('button', { name: /Ludność/i }).click();
    await expect(page).toHaveURL(/.*[?&]k=1/);

    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ogolem');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/.*[?&]q=ogolem/);

    await page.evaluate(() => window.history.back());
    await expect(searchInput).toHaveValue('');
    await expect(page).toHaveURL(/.*[?&]k=1/);
  });

  test('wybór wskaźnika z podpowiedzi wyszukiwarki (onPick) nawiguje do /biblioteka/:id', async ({ page }) => {
    await page.goto('/biblioteka');

    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('Mediana');

    const suggestion = page.getByRole('option', { name: /Mediana wieku/i });
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    await expect(page).toHaveURL(/\/biblioteka\/104$/);
  });

  test('telefon 390 px i 360 px bez poziomego przewijania', async ({ page }) => {
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/biblioteka?k=1&q=ludnosc');

      const noHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noHorizontalScroll, `Horizontal scroll detected at ${width}px`).toBe(true);
    }
  });

  test('w całej ścieżce dokładnie 1 żądanie spisu index.json', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.goto('/biblioteka');

    const categoryTiles = page.getByTestId('category-tiles');
    await categoryTiles.getByRole('button', { name: /Ludność/i }).click();
    await expect(page).toHaveURL(/.*[?&]k=1/);

    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');
    await expect(page).toHaveURL(/[?&]q=ludnosc/);
    await page.keyboard.press('Escape');

    const filters = page.getByTestId('library-filters');
    const levelPowiaty = filters.getByRole('button', { name: /Powiaty/i });
    await levelPowiaty.click();
    await expect(page).toHaveURL(/[?&]l=/);

    await page.evaluate(() => window.history.back());
    await expect(page).toHaveURL(/.*[?&]k=1/);

    const indexRequests = requests.filter((url) => url.includes('index.json'));
    expect(indexRequests.length).toBe(1);
  });

  test('brak błędów dostępności axe w trybie jasnym i ciemnym', async ({ page }) => {
    await page.goto('/biblioteka?k=1&q=ludnosc');
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /biblioteka?k=1&q=ludnosc (light)').toEqual([]);

    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });
    await page.goto('/biblioteka?k=1&q=ludnosc');
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /biblioteka?k=1&q=ludnosc (dark)').toEqual([]);
  });

  test('telefon 360x740: wyszukiwarka, popularne wyszukiwania, kompaktowy pasek filtrów i pierwsze wyniki na pierwszym ekranie (@W16-M04)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/biblioteka');

    // Wyszukiwarka widoczna
    const searchInput = page.locator('#library-search-input');
    await expect(searchInput).toBeVisible();

    // Przyciski „Popularne wyszukiwania” widoczne
    const popularSection = page.getByTestId('popular-searches');
    await expect(popularSection).toBeVisible();
    await expect(popularSection.getByRole('button', { name: 'Ludność' })).toBeVisible();

    // Kompaktowy pasek filtrów
    const filterToggle = page.getByTestId('library-filters-mobile-toggle');
    await expect(filterToggle).toBeVisible();
    await expect(filterToggle).toContainText('Filtry (aktywne: 0)');

    // Pierwsze wyniki listy są widoczne na pierwszym ekranie (y < 740)
    const results = page.getByTestId('library-results');
    const firstItem = results.locator('li').first();
    await expect(firstItem).toBeVisible();
    const box = await firstItem.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y, 'Pierwszy wynik powinien być na pierwszym ekranie telefonu (< 740 px)').toBeLessThan(740);
  });

  test('telefon 360x740: przycisk „Popularne wyszukiwania” zawęża listę i aktualizuje ?q= (@W16-M04)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/biblioteka');

    const popularSection = page.getByTestId('popular-searches');
    const ludnoscBtn = popularSection.getByRole('button', { name: 'Ludność' });
    await ludnoscBtn.click();

    await expect(page).toHaveURL(/.*[?&]q=/);
    const searchInput = page.locator('#library-search-input');
    await expect(searchInput).toHaveValue('Ludność');

    const results = page.getByTestId('library-results');
    await expect(results.getByText('Struktura ludności: Liczba ludności ogółem')).toBeVisible();
  });

  test('telefon 360x740: rozwinięcie paska filtrów i wybór poziomu aktualizuje licznik (aktywne: 1) (@W16-M04)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/biblioteka');

    const filterToggle = page.getByTestId('library-filters-mobile-toggle');
    await expect(filterToggle).toContainText('Filtry (aktywne: 0)');

    // Rozwiń pasek filtrów
    await filterToggle.click();
    await expect(filterToggle).toContainText('Filtry (aktywne: 0) ▴');

    // Wybierz poziom Powiaty
    const filters = page.getByTestId('library-filters');
    const powBtn = filters.getByRole('button', { name: /Powiaty/i });
    await powBtn.click();

    // Licznik aktywnych filtrów zaktualizowany do 1
    await expect(filterToggle).toContainText('Filtry (aktywne: 1)');
    await expect(page).toHaveURL(/.*[?&]l=5/);
  });

  test('stopka SiteFooter jest widoczna na 1440x900 i 360x740 (@W16-M04)', async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 360, height: 740 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/biblioteka');

      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();
      await expect(footer.getByText('Faktografia Atlas to niezależna')).toBeVisible();
    }
  });
});
