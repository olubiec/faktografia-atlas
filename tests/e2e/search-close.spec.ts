import { test, expect } from '@playwright/test';

test.describe('Search Dialog Close and Focus behavior (CC13.5a)', () => {
  test('klik w pole otwarcia -> okno otwarte; klik w krzyżyk -> zamknięte i nadal zamknięte po 1 s, fokus na polu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeSearchInput = page.locator('#home-search-field');
    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    const closeButton = page.locator('button[aria-label="Zamknij wyszukiwarkę"]');

    // Kliknięcie w pole na stronie głównej
    await homeSearchInput.click();
    await expect(dialogSearchInput).toBeVisible();

    // Kliknięcie w krzyżyk zamknięcia
    await closeButton.click();
    await expect(dialogSearchInput).not.toBeVisible();

    // Odczekanie 1s i upewnienie się, że okno się nie otworzyło ponownie
    await page.waitForTimeout(1000);
    await expect(dialogSearchInput).not.toBeVisible();

    // Fokus powrócił na pole wyszukiwania na stronie głównej
    await expect(homeSearchInput).toBeFocused();
  });

  test('Escape zamyka okno, pozostaje zamknięte po 1 s, fokus na polu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeSearchInput = page.locator('#home-search-field');
    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');

    await homeSearchInput.click();
    await expect(dialogSearchInput).toBeVisible();

    // Naciśnięcie Escape
    await page.keyboard.press('Escape');
    await expect(dialogSearchInput).not.toBeVisible();

    // Odczekanie 1s
    await page.waitForTimeout(1000);
    await expect(dialogSearchInput).not.toBeVisible();

    // Fokus na polu
    await expect(homeSearchInput).toBeFocused();
  });

  test('klik w tło (overlay) zamyka okno, pozostaje zamknięte po 1 s, fokus na polu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeSearchInput = page.locator('#home-search-field');
    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');

    await homeSearchInput.click();
    await expect(dialogSearchInput).toBeVisible();

    // Kliknięcie w tło (overlay)
    const overlay = page.locator('.bg-tusz\\/40');
    await overlay.click({ position: { x: 10, y: 10 } });
    await expect(dialogSearchInput).not.toBeVisible();

    // Odczekanie 1s
    await page.waitForTimeout(1000);
    await expect(dialogSearchInput).not.toBeVisible();

    // Fokus na polu
    await expect(homeSearchInput).toBeFocused();
  });

  test('fokus (Tab) na pole nie otwiera okna; Enter i Spacja na polu otwierają okno', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeSearchInput = page.locator('#home-search-field');
    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');

    // Ustawienie fokusa na pole
    await homeSearchInput.focus();
    await expect(homeSearchInput).toBeFocused();

    // Samo zafokusowanie NIE powinno otworzyć okna
    await page.waitForTimeout(300);
    await expect(dialogSearchInput).not.toBeVisible();

    // Naciśnięcie Enter otwiera okno
    await homeSearchInput.press('Enter');
    await expect(dialogSearchInput).toBeVisible();

    // Zamknięcie przez Esc
    await page.keyboard.press('Escape');
    await expect(dialogSearchInput).not.toBeVisible();
    await expect(homeSearchInput).toBeFocused();

    // Naciśnięcie Spacji otwiera okno
    await homeSearchInput.press('Space');
    await expect(dialogSearchInput).toBeVisible();
  });

  test('Ctrl+K otwiera i zamyka wyszukiwarkę', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');

    // Ctrl+K otwiera
    await page.keyboard.press('Control+k');
    await expect(dialogSearchInput).toBeVisible();

    // Ctrl+K zamyka
    await page.keyboard.press('Control+k');
    await expect(dialogSearchInput).not.toBeVisible();
  });

  test('na telefonie (390px) krzyżyk zamyka okno pełnoekranowe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const homeSearchInput = page.locator('#home-search-field');
    const dialogSearchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    const closeButton = page.locator('button[aria-label="Zamknij wyszukiwarkę"]');

    await homeSearchInput.click();
    await expect(dialogSearchInput).toBeVisible();

    await closeButton.click();
    await expect(dialogSearchInput).not.toBeVisible();

    await page.waitForTimeout(1000);
    await expect(dialogSearchInput).not.toBeVisible();
  });
});
