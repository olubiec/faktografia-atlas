import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads properly and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Faktografia Atlas/);

    // Check for logo
    const logo = page.locator('img[alt="Faktografia"]');
    await expect(logo).toBeVisible();

    // Check for main heading
    const heading = page.locator('h1', { hasText: 'Faktografia Atlas' });
    await expect(heading).toBeVisible();
  });

  test('prefers dark theme from localStorage set via addInitScript', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const logo = page.locator('img[alt="Faktografia"]');
    await expect(logo).toHaveAttribute('src', '/brand/faktografia-logo-jasne.svg');
  });

  test('theme switcher button touch target is at least 44x44 px', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('button', { hasText: 'Motyw:' });
    await expect(themeButton).toBeVisible();

    const box = await themeButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('no requests to Google Fonts', async ({ page }) => {
    const googleFontsRequests: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        googleFontsRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(googleFontsRequests).toHaveLength(0);
  });

  test('no CSP errors in console', async ({ page }) => {
    const cspErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('content security policy')) {
        cspErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cspErrors).toEqual([]);
  });

  test('theme switcher works', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('button', { hasText: 'Motyw:' });
    await expect(themeButton).toBeVisible();

    // Force click to cycle theme.
    // Initial is system. Click -> light
    await themeButton.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(themeButton).toContainText('Motyw: Jasny');

    // Click -> dark
    await themeButton.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(themeButton).toContainText('Motyw: Ciemny');

    // Logo should switch to light version in dark mode
    const logo = page.locator('img[alt="Faktografia"]');
    await expect(logo).toHaveAttribute('src', '/brand/faktografia-logo-jasne.svg');
  });

  test('404 page works', async ({ page }) => {
    await page.goto('/does-not-exist');

    const heading = page.locator('h1', { hasText: 'Błąd 404' });
    await expect(heading).toBeVisible();

    const backLink = page.locator('a', { hasText: 'Wróć na stronę główną' });
    await expect(backLink).toBeVisible();
  });
});
