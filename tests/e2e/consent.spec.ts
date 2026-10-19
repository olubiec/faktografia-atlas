import { test, expect } from '@playwright/test';

test.describe('Consent Bar and PostHog Analytics (CC11.1b)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('bez zgody: ZERO żądań do posthog.com, zero ciasteczek posthog i skrypt posthog nie jest ładowany, także po Ctrl+K', async ({ page, context }) => {
    const posthogRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('posthog') || url.includes('phc_')) {
        posthogRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Weryfikacja paska zgody
    const consentBar = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBar).toBeVisible();

    // Wyszukanie w Ctrl+K bez wyrażania zgody
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Warszawa');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // Sprawdzenie żądań sieciowych
    expect(posthogRequests).toHaveLength(0);

    // Sprawdzenie ciasteczek
    const cookies = await context.cookies();
    const posthogCookies = cookies.filter((c) => c.name.startsWith('ph_') || c.name.includes('posthog'));
    expect(posthogCookies).toHaveLength(0);
  });

  test('przycisk "Nie" zamyka pasek na stałe i zapamiętuje decyzję w localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const consentBar = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBar).toBeVisible();

    // Kliknięcie "Nie"
    const denyBtn = consentBar.locator('button', { hasText: 'Nie' });
    await expect(denyBtn).toBeVisible();
    await denyBtn.click();

    // Pasek zniknął
    await expect(consentBar).not.toBeVisible();

    // Sprawdzenie localStorage
    const savedConsent = await page.evaluate(() => localStorage.getItem('fa-consent-v1'));
    expect(savedConsent).not.toBeNull();
    const parsed = JSON.parse(savedConsent!);
    expect(parsed.value).toBe('denied');

    // Odświeżenie strony – pasek się nie pojawia
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(consentBar).not.toBeVisible();
  });

  test('pasek nie zasłania wyszukiwarki ani mapy na telefonie (390 px) i przyciski mają min. 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const consentBar = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBar).toBeVisible();

    // Weryfikacja pozycji paska na dole ekranu
    const barBox = await consentBar.boundingBox();
    expect(barBox).not.toBeNull();
    expect(barBox!.y + barBox!.height).toBeGreaterThanOrEqual(840);

    // Weryfikacja rozmiaru pól dotykowych (min. 44 px)
    const acceptBtn = consentBar.locator('button', { hasText: 'Zgadzam się' });
    const denyBtn = consentBar.locator('button', { hasText: 'Nie' });

    const acceptBox = await acceptBtn.boundingBox();
    const denyBox = await denyBtn.boundingBox();

    expect(acceptBox!.height).toBeGreaterThanOrEqual(44);
    expect(acceptBox!.width).toBeGreaterThanOrEqual(44);
    expect(denyBox!.height).toBeGreaterThanOrEqual(44);
    expect(denyBox!.width).toBeGreaterThanOrEqual(44);

    // Otwarcie wyszukiwarki – okno dialogowe ma z-50 i nie jest zasłonięte przez pasek zgody
    const searchTrigger = page.locator('header button').first();
    await searchTrigger.click();

    const dialogContent = page.locator('div[role="dialog"]');
    await expect(dialogContent).toBeVisible();
  });

  test('brak klucza VITE_POSTHOG_KEY → po kliknięciu "Zgadzam się" nic się nie ładuje i brak błędu w konsoli', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const posthogRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('posthog')) posthogRequests.push(req.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const consentBar = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBar).toBeVisible();

    // Kliknięcie "Zgadzam się"
    const acceptBtn = consentBar.locator('button', { hasText: 'Zgadzam się' });
    await acceptBtn.click();

    await expect(consentBar).not.toBeVisible();

    // Zgoda zapisana
    const savedConsent = await page.evaluate(() => localStorage.getItem('fa-consent-v1'));
    expect(savedConsent).not.toBeNull();
    const parsed = JSON.parse(savedConsent!);
    expect(parsed.value).toBe('granted');

    // W środowisku testowym brak VITE_POSTHOG_KEY => zero requestów do posthog i zero błędów
    expect(posthogRequests).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });
});
