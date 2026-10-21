import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Search Command Dialog (CC5.2)', () => {
  test('lista jednostek jest pobierana raz i wspólnie przez mapę i wyszukiwarkę', async ({ page }) => {
    const unitsRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/data/units.json')) unitsRequests.push(req.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Mapa pobiera listę jednostek przy starcie (osobny plik, nie część kodu); wyszukiwarka używa tej samej pamięci.
    expect(unitsRequests).toHaveLength(1);

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('lodz');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await searchInput.fill('zakop');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
    expect(unitsRequests).toHaveLength(1);
  });

  test('opens search modal via Ctrl+K and closes via Esc, restoring focus', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchTrigger = page.locator('header button').first();
    await searchTrigger.focus();
    await expect(searchTrigger).toBeFocused();

    // Otwarcie przez Ctrl+K
    await page.keyboard.press('Control+k');

    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();

    // Zamknięcie przez Esc
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();

    // Sprawdzenie przywrócenia fokusa na przycisk wyzwalający
    await expect(searchTrigger).toBeFocused();
  });

  test('opens search modal via clicking header search button or home page input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Kliknięcie w przycisk wyszukiwania w nagłówku
    const searchTrigger = page.locator('header button').first();
    await searchTrigger.click();

    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();

    // Kliknięcie w pole wyszukiwania na stronie głównej
    const homeSearchInput = page.locator('#home-search-field');
    await homeSearchInput.click();
    await expect(searchInput).toBeVisible();
  });

  test('searches for "lodz" and selects Łódź gmina miejska on Enter, updating URL', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    // Wpisanie "lodz"
    await searchInput.fill('lodz');

    // Weryfikacja obecności Łodzi w wynikach
    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('Łódź');
    await expect(firstResult).toContainText('gmina miejska');

    // Zatwierdzenie pierwszego wyniku (gmina miejska Łódź) klawiszem Enter
    await page.keyboard.press('Enter');

    // Weryfikacja zamknięcia okna i przejścia do jednostki ?u=1061011
    await expect(searchInput).not.toBeVisible();
    await expect(page).toHaveURL(/\/\?u=1061011/);
  });

  test('supports ArrowDown keyboard navigation between search results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('lodz');

    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();

    // Przejście strzałką w dół do drugiego wyniku (powiat Łódź)
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(searchInput).not.toBeVisible();
    await expect(page).toHaveURL(/\/\?u=1061/);
  });

  test('displays empty state message when no results match', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('xyznonexistent123');

    const emptyState = page.locator('div[role="dialog"] [cmdk-empty]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('Brak wyników dla „xyznonexistent123”');
  });

  test('takes full screen on mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchTrigger = page.locator('header button').first();
    await searchTrigger.click();

    const dialogContent = page.locator('div[role="dialog"]');
    await expect(dialogContent).toBeVisible();

    const box = await dialogContent.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(390);
    expect(box!.height).toBe(844);
  });

  test('axe accessibility audit passes on open search dialog with results', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('lodz');
    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
