import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import valuesSampleFixture from '../fixtures/library/values-sample.json' with { type: 'json' };

test.describe('Test całej ścieżki „Biblioteka GUS” (@S21)', () => {
  test.beforeEach(async ({ page }) => {
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

    await page.route('**/values/103.json', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    });
  });

  test('pełna ścieżka na komputerze: nagłówek → /biblioteka → szukanie → ranking i CSV → wskaźnik niepobrany', async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Wejście z nagłówka
    await page.goto('/');
    const desktopLink = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    await expect(desktopLink).toBeVisible();
    await desktopLink.click();

    await expect(page).toHaveURL(/\/biblioteka$/);

    // Progi §7: wejście na /biblioteka = dokładnie 1 żądanie spisu index.json
    // i 0 żądań do /data/values/ oraz /data/profiles/ z głównej mapy
    const indexRequestsOnEntry = requests.filter((url) => url.includes('index.json'));
    const mainValuesRequests = requests.filter((url) => url.includes('/data/values/'));
    const mainProfilesRequests = requests.filter((url) => url.includes('/data/profiles/'));

    expect(indexRequestsOnEntry.length).toBe(1);
    expect(mainValuesRequests.length).toBe(0);
    expect(mainProfilesRequests.length).toBe(0);

    // 2. Wyszukanie wskaźnika pobranego (101: Liczba ludności ogółem)
    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');

    const resultRow = page
      .getByTestId('library-results')
      .getByText('Struktura ludności: Liczba ludności ogółem');
    await expect(resultRow).toBeVisible();
    await resultRow.click();

    await expect(page).toHaveURL(/\/biblioteka\/101$/);

    // 3. Sprawdzenie rankingu
    await expect(page.locator('h1')).toContainText('Liczba ludności ogółem');
    const highestSection = page.getByRole('list', { name: '10 najwyżej' });
    await expect(highestSection.getByText('powiat dzierżoniowski')).toBeVisible();

    // Progi §7 dla wskaźnika: dokładnie 1 żądanie wartości values/101.json
    const values101Requests = requests.filter((url) => url.includes('/values/101.json'));
    expect(values101Requests.length).toBe(1);
    expect(requests.filter((url) => url.includes('/data/values/')).length).toBe(0);

    // 4. Pobranie CSV
    const csvButton = page.getByRole('button', { name: 'Pobierz CSV' });
    await expect(csvButton).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await csvButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.csv');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    if (stream) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
    }
    const csvContent = Buffer.concat(chunks).toString('utf-8');
    // Sprawdzenie polskiego formatu CSV: BOM UTF-8 (\uFEFF) oraz separator ;
    expect(csvContent.startsWith('\uFEFF')).toBe(true);
    expect(csvContent).toContain('TERYT;Nazwa;Poziom;');

    // 5. Powrót do biblioteki i przejście do wskaźnika niepobranego (103: Ludność w wieku poprodukcyjnym)
    const backLink = page.getByRole('link', { name: '‹ Powrót do biblioteki' });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/\/biblioteka$/);

    await searchInput.fill('poprodukcyjnym');
    const unreadyRow = page
      .getByTestId('library-results')
      .getByText('Struktura ludności: Ludność w wieku poprodukcyjnym');
    await expect(unreadyRow).toBeVisible();
    await unreadyRow.click();

    await expect(page).toHaveURL(/\/biblioteka\/103$/);

    // Sprawdzenie komunikatu o braku pobrania i przycisku zamówienia
    await expect(page.getByText('Ten wskaźnik jeszcze nie został pobrany')).toBeVisible();
    const orderBtn = page.getByRole('link', { name: 'Zamów ten wskaźnik' });
    await expect(orderBtn).toBeVisible();
    const orderHref = await orderBtn.getAttribute('href');
    expect(orderHref).toContain('github.com');
    expect(orderHref).toContain('zamowienie-wskaznika.yml');
  });

  test('pełna ścieżka na telefonie (390 px): nagłówek → /biblioteka → szukanie → ranking → CSV → wskaźnik niepobrany', async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Wejście z nagłówka mobilnego
    await page.goto('/');
    const menuBtn = page.locator('header button[aria-label="Menu"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const mobileLink = page.locator('header').getByRole('link', { name: 'Biblioteka' });
    await expect(mobileLink).toBeVisible();

    // Sprawdzenie pola dotykowego (≥ 44 px)
    const mobileLinkBox = await mobileLink.boundingBox();
    expect(mobileLinkBox).not.toBeNull();
    expect(mobileLinkBox!.width).toBeGreaterThanOrEqual(44);
    expect(mobileLinkBox!.height).toBeGreaterThanOrEqual(44);

    await mobileLink.click();
    await expect(page).toHaveURL(/\/biblioteka$/);

    // Progi §7: wejście na /biblioteka = 1 żądanie spisu, 0 żądań do głównej mapy
    const indexRequestsOnEntry = requests.filter((url) => url.includes('index.json'));
    const mainValuesRequests = requests.filter((url) => url.includes('/data/values/'));
    const mainProfilesRequests = requests.filter((url) => url.includes('/data/profiles/'));

    expect(indexRequestsOnEntry.length).toBe(1);
    expect(mainValuesRequests.length).toBe(0);
    expect(mainProfilesRequests.length).toBe(0);

    // 2. Wyszukanie wskaźnika pobranego
    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');

    const resultRow = page
      .getByTestId('library-results')
      .getByText('Struktura ludności: Liczba ludności ogółem');
    await expect(resultRow).toBeVisible();
    await resultRow.click();

    await expect(page).toHaveURL(/\/biblioteka\/101$/);

    // 3. Sprawdzenie rankingu i pobrania CSV
    await expect(page.locator('h1')).toContainText('Liczba ludności ogółem');

    // Progi §7: 1 żądanie wartości values/101.json
    const values101Requests = requests.filter((url) => url.includes('/values/101.json'));
    expect(values101Requests.length).toBe(1);

    const csvButton = page.getByRole('button', { name: 'Pobierz CSV' });
    await expect(csvButton).toBeVisible();

    const csvBox = await csvButton.boundingBox();
    expect(csvBox).not.toBeNull();
    expect(csvBox!.height).toBeGreaterThanOrEqual(44);

    const downloadPromise = page.waitForEvent('download');
    await csvButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');

    // 4. Powrót i wybór wskaźnika niepobranego
    const backLink = page.getByRole('link', { name: '‹ Powrót do biblioteki' });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/\/biblioteka$/);

    await searchInput.fill('poprodukcyjnym');
    const unreadyRow = page
      .getByTestId('library-results')
      .getByText('Struktura ludności: Ludność w wieku poprodukcyjnym');
    await expect(unreadyRow).toBeVisible();
    await unreadyRow.click();

    await expect(page).toHaveURL(/\/biblioteka\/103$/);

    await expect(page.getByText('Ten wskaźnik jeszcze nie został pobrany')).toBeVisible();
    const orderBtn = page.getByRole('link', { name: 'Zamów ten wskaźnik' });
    await expect(orderBtn).toBeVisible();
    const orderBox = await orderBtn.boundingBox();
    expect(orderBox).not.toBeNull();
    expect(orderBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('brak poziomego przewijania przy 390 px i 360 px', async ({ page }) => {
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 800 });

      // Strona główna biblioteki
      await page.goto('/biblioteka');
      await expect(page.getByTestId('library-results')).toBeVisible();
      await page.waitForLoadState('networkidle');
      let noScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noScroll, `Horizontal scroll detected on /biblioteka at ${width}px`).toBe(true);

      // Strona wskaźnika pobranego
      await page.goto('/biblioteka/101');
      await expect(page.locator('h1')).toBeVisible();
      await page.waitForLoadState('networkidle');
      noScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noScroll, `Horizontal scroll detected on /biblioteka/101 at ${width}px`).toBe(true);

      // Strona wskaźnika niepobranego
      await page.goto('/biblioteka/103');
      await expect(page.getByText('Ten wskaźnik jeszcze nie został pobrany')).toBeVisible();
      await page.waitForLoadState('networkidle');
      noScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(noScroll, `Horizontal scroll detected on /biblioteka/103 at ${width}px`).toBe(true);
    }
  });

  test('brak błędów dostępności axe w trybie jasnym i ciemnym na /biblioteka, /biblioteka/101, /biblioteka/103', async ({
    page,
  }) => {
    const routes = [
      { path: '/biblioteka', readySelector: '[data-testid="library-results"]' },
      { path: '/biblioteka/101', readySelector: 'h1' },
      { path: '/biblioteka/103', readySelector: 'a:has-text("Zamów ten wskaźnik")' },
    ];

    for (const { path, readySelector } of routes) {
      // Light mode
      await page.goto(path);
      await expect(page.locator(readySelector)).toBeVisible();
      let results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `Axe violations on ${path} (light)`).toEqual([]);

      // Dark mode
      await page.addInitScript(() => {
        localStorage.setItem('faktografia-theme', 'dark');
      });
      await page.goto(path);
      await expect(page.locator(readySelector)).toBeVisible();
      results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `Axe violations on ${path} (dark)`).toEqual([]);
    }
  });

  test('najwyżej jedno czerwone zakreślenie na ekranie', async ({ page }) => {
    await page.goto('/biblioteka');
    await expect(page.getByTestId('library-results')).toBeVisible();
    const annotationsOnLib = page.locator('svg.rough-annotation');
    expect(await annotationsOnLib.count()).toBeLessThanOrEqual(1);

    await page.goto('/biblioteka/101');
    await expect(page.locator('h1')).toBeVisible();
    const annotationsOnVar = page.locator('svg.rough-annotation');
    expect(await annotationsOnVar.count()).toBeLessThanOrEqual(1);
  });

  test('działa poprawnie przy prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/biblioteka');
    const searchInput = page.locator('#library-search-input');
    await searchInput.fill('ludnosc');

    const resultRow = page
      .getByTestId('library-results')
      .getByText('Struktura ludności: Liczba ludności ogółem');
    await expect(resultRow).toBeVisible();
    await resultRow.click();

    await expect(page).toHaveURL(/\/biblioteka\/101$/);
    await expect(page.locator('h1')).toContainText('Liczba ludności ogółem');
  });
});
