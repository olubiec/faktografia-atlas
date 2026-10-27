import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Strona /biblioteka: szkielet i miejsca podpięcia (@S21)', () => {
  test('pokazuje licznik zgodny z fixture oraz 4 szkielety kontenerów', async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    await page.goto('/biblioteka');

    // Nagłówek i licznik
    const heading = page.locator('h1', { hasText: 'Biblioteka wskaźników GUS' });
    await expect(heading).toBeVisible();

    const counter = page.getByText('12 wskaźników GUS, z czego 6 można już przeglądać');
    await expect(counter).toBeVisible();

    // 4 szkieletowe kontenery
    await expect(page.getByTestId('category-tiles')).toBeAttached();
    await expect(page.getByTestId('library-search-bar')).toBeAttached();
    await expect(page.getByTestId('library-filters')).toBeAttached();
    await expect(page.getByTestId('library-results')).toBeAttached();
  });

  test('404 spisu -> pokazuje komunikat „Biblioteka dopiero się buduje”', async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    });

    await page.goto('/biblioteka');

    const message = page.getByText('Biblioteka dopiero się buduje – pierwsze wskaźniki pojawią się wkrótce');
    await expect(message).toBeVisible();
  });

  test('błąd sieci -> komunikat z „Spróbuj ponownie” i ponowienie działa', async ({ page }) => {
    let failRequest = true;

    await page.route('**/index.json', (route) => {
      if (failRequest) {
        route.abort('failed');
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(indexFixture),
        });
      }
    });

    await page.goto('/biblioteka');

    const retryButton = page.getByRole('button', { name: 'Spróbuj ponownie' });
    await expect(retryButton).toBeVisible();

    // Upewnij się, że pole dotykowe ma przynajmniej 44x44 px
    const box = await retryButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Przestań powodować błąd i kliknij ponowienie
    failRequest = false;
    await retryButton.click();

    const counter = page.getByText('12 wskaźników GUS, z czego 6 można już przeglądać');
    await expect(counter).toBeVisible();
  });

  test('wejście na stronę = dokładnie 1 żądanie spisu i 0 żądań do values/ lub profiles/', async ({ page }) => {
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

    await page.goto('/biblioteka');
    await page.waitForLoadState('networkidle');

    const indexRequests = requests.filter((url) => url.includes('index.json'));
    const valuesRequests = requests.filter((url) => url.includes('/values/'));
    const profilesRequests = requests.filter((url) => url.includes('/profiles/'));

    expect(indexRequests.length).toBe(1);
    expect(valuesRequests.length).toBe(0);
    expect(profilesRequests.length).toBe(0);
  });

  test('brak poziomego przewijania przy 390 px i 360 px', async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/biblioteka');
      await page.waitForLoadState('networkidle');

      const noHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noHorizontalScroll, `Horizontal scroll detected at ${width}px`).toBe(true);
    }
  });

  test('brak błędów dostępności axe w trybie jasnym i ciemnym', async ({ page }) => {
    await page.route('**/index.json', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      });
    });

    // Tryb jasny
    await page.goto('/biblioteka');
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /biblioteka (light)').toEqual([]);

    // Tryb ciemny
    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });
    await page.goto('/biblioteka');
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /biblioteka (dark)').toEqual([]);
  });
});
