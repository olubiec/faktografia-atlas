import { test, expect } from '@playwright/test';

test.describe('Unit Profile Sheet (CC7.2b)', () => {
  test.beforeEach(async ({ page }) => {
    // Rejestracja atrap (mocks) danych wskaźników
    await page.route('**/data/values/*.json', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/data\/values\/(.+)\.json$/);
      const indicatorId = match ? match[1] : 'population';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          indicatorId,
          years: [2021, 2022],
          values: {
            '1217011': [26000, 27000],
            '1217': [60000, 62000],
            '12': [3400000, 3420000],
          },
          fetchedAt: '2025-01-01T00:00:00Z',
        }),
      });
    });
  });

  test('selecting unit via ?u=1217011 opens profile sheet with Zakopane and sets profileOpen seam', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.profileOpen).toBe(true);
    expect(atlasState.selected).toBe('1217011');

    const header = page.locator('h2', { hasText: 'Zakopane' });
    await expect(header).toBeVisible();
  });

  test('close button and Escape key close sheet while ?u= parameter remains', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Test 1: Zamknięcie przyciskiem x
    const closeButton = page.locator('button[aria-label="Zamknij"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);
    let atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.profileOpen).toBe(false);

    let urlSearch = await page.evaluate(() => window.location.search);
    expect(urlSearch).toContain('u=1217011');

    // Ponowne otwarcie wybranego TERYT poprzez ponowne nawigowanie
    await page.goto('/?e2e&u=1217011');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Test 2: Zamknięcie klawiszem Escape
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

    atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.profileOpen).toBe(false);

    urlSearch = await page.evaluate(() => window.location.search);
    expect(urlSearch).toContain('u=1217011');
  });

  test('mobile viewport (390px) renders bottom sheet while desktop (1440px) renders side sheet', async ({
    page,
  }) => {
    // Wersja mobilna (390 px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    const headerMobile = page.locator('h2', { hasText: 'Zakopane' });
    await expect(headerMobile).toBeVisible();

    // Wersja na komputer (1440 px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    const headerDesktop = page.locator('h2', { hasText: 'Zakopane' });
    await expect(headerDesktop).toBeVisible();
  });

  test('missing value files opens sheet with no-data message and without console errors', async ({
    page,
  }) => {
    const appConsoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('404') &&
        !text.includes('Failed to load resource')
      ) {
        appConsoleErrors.push(text);
      }
    });

    // Anulowanie żądań po pliki wartości (imitacja braku plików / 404)
    await page.unroute('**/data/values/*.json');
    await page.route('**/data/values/*.json', async (route) => {
      await route.fulfill({ status: 404, body: 'Not found' });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const header = page.locator('h2', { hasText: 'Zakopane' });
    await expect(header).toBeVisible();

    // Sprawdzenie obecności tekstu "brak danych"
    const noDataText = page.locator('text=brak danych').first();
    await expect(noDataText).toBeVisible();

    expect(appConsoleErrors).toEqual([]);
  });
});
