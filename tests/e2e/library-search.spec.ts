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

    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');
    await page.keyboard.press('Escape');

    const filters = page.getByTestId('library-filters');
    const levelPowiaty = filters.getByRole('button', { name: /Powiaty/i });
    await levelPowiaty.click();

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
});
