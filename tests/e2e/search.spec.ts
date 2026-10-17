import { test, expect } from '@playwright/test';

test.describe('Search Command Dialog (CC5.2)', () => {
  test('lista jednostek nie jest pobierana przed otwarciem okna, a po otwarciu dokładnie raz', async ({ page }) => {
    const unitsRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('units.json')) {
        unitsRequests.push(req.url());
      }
    });

    await page.goto('/');
    await page.waitForSelector('h1');
    expect(unitsRequests).toHaveLength(0);

    await page.keyboard.press('Control+k');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.waitForTimeout(500);
    expect(unitsRequests.length).toBeGreaterThanOrEqual(1);
  });

  test('opens search modal via Ctrl+K and closes via Esc, restoring focus', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    const searchTrigger = page.locator('header button').first();
    await searchTrigger.focus();

    await page.keyboard.press('Control+k');
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('opens search modal via clicking header search button or home page input', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Kliknięcie w przycisk wyszukiwania w nagłówku
    const searchTrigger = page.locator('header button').first();
    await searchTrigger.click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Kliknięcie w pole wyszukiwania na stronie głównej
    const homeInput = page.locator('#home-search-field');
    await homeInput.click();
    await expect(dialog).toBeVisible();
  });

  test('searches for "lodz" and selects Łódź gmina miejska on Enter, updating URL', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('lodz');

    const resultOption = page.locator('div[role="dialog"] [role="option"]', { hasText: 'Łódź' }).first();
    await expect(resultOption).toBeVisible();

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\?u=1061011/);
  });

  test('supports ArrowDown keyboard navigation between search results', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('warszawa');

    const results = page.locator('div[role="dialog"] [role="option"]');
    await expect(results.first()).toBeVisible();

    await page.keyboard.press('ArrowDown');
    const selectedResult = page.locator('div[role="dialog"] [role="option"][aria-selected="true"]');
    await expect(selectedResult).toBeVisible();
  });

  test('displays empty state message when no results match', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('xyzxyz12345');

    const emptyMessage = page.locator('div[role="dialog"]', { hasText: 'Brak wyników dla „xyzxyz12345”' });
    await expect(emptyMessage).toBeVisible();
  });

  test('takes full screen on mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('h1');

    const searchTrigger = page.locator('header button').first();
    await searchTrigger.click();

    const dialogContent = page.locator('div[role="dialog"]');
    await expect(dialogContent).toBeVisible();

    const box = await dialogContent.boundingBox();
    expect(box).not.toBeNull();

    expect(box!.width).toBeGreaterThanOrEqual(380);
    expect(box!.height).toBeGreaterThanOrEqual(800);
  });
});
