import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import valuesSampleFixture from '../fixtures/library/values-sample.json' with { type: 'json' };

test.describe('Strona wskaźnika /biblioteka/:id (@S21)', () => {
  test('pokazuje ranking z poprawną kolejnością i zmiana roku zmienia ranking bez nowego żądania', async ({
    page,
  }) => {
    let valuesRequestCount = 0;

    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.route('**/values/101.json', (route) => {
      valuesRequestCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(valuesSampleFixture),
      });
    });

    await page.goto('/biblioteka/101');

    // Nagłówek i ścieżka kategorii
    const heading = page.locator('h1', {
      hasText: 'Struktura ludności: Liczba ludności ogółem',
    });
    await expect(heading).toBeVisible();

    await expect(
      page.getByText('Ludność › Struktura ludności')
    ).toBeVisible();

    await expect(page.getByText('Jednostka: osoba')).toBeVisible();

    // Domyślny rok: 2024 (najnowszy)
    const yearSelect = page.locator('#year-select');
    await expect(yearSelect).toBeVisible();
    await expect(yearSelect).toHaveValue('2024');

    // Sprawdź wartości dla 2024: powiat dzierżoniowski 210, głogowski 160, bolesławiecki 110
    const highestSection = page.getByRole('list', { name: '10 najwyżej' });
    await expect(highestSection.getByText('powiat dzierżoniowski')).toBeVisible();
    await expect(highestSection.getByText('210')).toBeVisible();

    expect(valuesRequestCount).toBe(1);

    // Zmień rok na 2022
    await yearSelect.selectOption('2022');

    // Sprawdź zaktualizowane wartości dla 2022
    await expect(highestSection.getByText('200')).toBeVisible();

    // Żadne dodatkowe żądanie do values/101.json nie powinno zostać wysłane
    expect(valuesRequestCount).toBe(1);
  });

  test('wejście = dokładnie 1 żądanie spisu i 1 żądanie wartości', async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.route('**/values/101.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(valuesSampleFixture),
      });
    });

    await page.goto('/biblioteka/101');
    await page.waitForLoadState('networkidle');

    const indexRequests = requests.filter((url) => url.includes('index.json'));
    const valuesRequests = requests.filter((url) => url.includes('/values/'));
    const profilesRequests = requests.filter((url) =>
      url.includes('/profiles/')
    );

    expect(indexRequests.length).toBe(1);
    expect(valuesRequests.length).toBe(1);
    expect(profilesRequests.length).toBe(0);
  });

  test('wskaźnik niepobrany -> komunikat i przycisk „Zamów ten wskaźnik”', async ({
    page,
  }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.route('**/values/103.json', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    });

    await page.goto('/biblioteka/103');

    const message = page.getByText('Ten wskaźnik jeszcze nie został pobrany');
    await expect(message).toBeVisible();

    const orderButton = page.getByRole('link', {
      name: 'Zamów ten wskaźnik',
    });
    await expect(orderButton).toBeVisible();

    const href = await orderButton.getAttribute('href');
    expect(href).toContain('github.com');
    expect(href).toContain('zamowienie-wskaznika.yml');
  });

  test('nieistniejące id -> komunikat i odnośnik do /biblioteka', async ({
    page,
  }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.goto('/biblioteka/999');

    const heading = page.getByRole('heading', {
      name: 'Nie znaleziono wskaźnika',
    });
    await expect(heading).toBeVisible();

    const backLinks = page.getByRole('link', { name: 'Powrót do biblioteki' });
    await expect(backLinks.first()).toBeVisible();
  });

  test('brak poziomego przewijania przy 390 px i 360 px', async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.route('**/values/101.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(valuesSampleFixture),
      });
    });

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/biblioteka/101');
      await page.waitForLoadState('networkidle');

      const noHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(
        noHorizontalScroll,
        `Horizontal scroll detected at ${width}px`
      ).toBe(true);
    }
  });

  test('brak błędów dostępności axe w trybie jasnym i ciemnym', async ({
    page,
  }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.route('**/values/101.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(valuesSampleFixture),
      });
    });

    // Tryb jasny
    await page.goto('/biblioteka/101');
    await expect(page.locator('h1')).toBeVisible();
    let results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      'Axe violations on /biblioteka/101 (light)'
    ).toEqual([]);

    // Tryb ciemny
    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });
    await page.goto('/biblioteka/101');
    await expect(page.locator('h1')).toBeVisible();
    results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      'Axe violations on /biblioteka/101 (dark)'
    ).toEqual([]);
  });
});
