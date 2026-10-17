import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Home Page', () => {
  test('loads properly, displays heading and subtitle with correct numbers', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Faktografia Atlas/);

    const logo = page.locator('img[alt="Faktografia"]');
    await expect(logo).toBeVisible();

    const heading = page.locator('h1', { hasText: 'Mapa Polski z danymi GUS' });
    await expect(heading).toBeVisible();

    const subtitle = page.locator('main');
    await expect(subtitle).toContainText('16 województw, 380 powiatów i 2479 gmin. Dane z Banku Danych Lokalnych, aktualizowane co noc.');
  });

  test('na telefonie zakreślenie „2479 gmin” mieści się w jednej linii', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const count = page.locator('main span.whitespace-nowrap');
    const box = await count.boundingBox();
    const lineHeight = await count.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThan(lineHeight * 1.5);
  });

  test('pole wyszukiwania mieści cały napis podpowiedzi na telefonie i komputerze', async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const input = page.locator('#home-search-field');
      const scroll = await input.evaluate((el) => (el as HTMLInputElement).scrollWidth - (el as HTMLInputElement).clientWidth);
      expect(scroll).toBeLessThanOrEqual(0);
    }
  });

  test('logo switches in light/dark mode and ?logo=znak replaces logo with mark', async ({ page }) => {
    await page.goto('/?logo=znak');

    const logoZnak = page.locator('header img[alt="Faktografia"]');
    const themeButton = page.locator('header button', { hasText: 'Motyw:' }).first();

    // Force light mode
    await themeButton.click(); // Jasny
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(logoZnak).toHaveAttribute('src', '/brand/faktografia-znak-granat.svg');

    // Switch to dark mode
    await themeButton.click(); // Ciemny
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(logoZnak).toHaveAttribute('src', '/brand/faktografia-znak-jasne.svg');

    // Remove ?logo=znak, verify standard logo
    await page.goto('/');
    const logo = page.locator('header img[alt="Faktografia"]');
    await expect(logo).toHaveAttribute('src', '/brand/faktografia-logo-jasne.svg');
  });

  test('header links navigate to working pages on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.locator('header nav').getByRole('link', { name: 'O projekcie' }).click();
    await expect(page).toHaveURL(/\/o-projekcie/);
    await expect(page.locator('h1', { hasText: 'O projekcie' })).toBeVisible();

    await page.locator('header nav').getByRole('link', { name: 'Skąd są dane' }).click();
    await expect(page).toHaveURL(/\/zrodla/);
    await expect(page.locator('h1', { hasText: 'Skąd są dane' })).toBeVisible();
  });

  test('mobile menu in Sheet works with keyboard and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuBtn = page.locator('header button[aria-label="Menu"]');
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    const aboutLink = page.locator('header').getByRole('link', { name: 'O projekcie' });
    await expect(aboutLink).toBeVisible();

    // Close on Escape
    await page.keyboard.press('Escape');
    await expect(aboutLink).not.toBeVisible();

    // Open and click link
    await menuBtn.click();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/o-projekcie/);
  });

  test('has exactly one visible annotation on /', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(700); // Allow rough-notation animation to initialize
    const annotations = page.locator('svg.rough-annotation');
    await expect(annotations).toHaveCount(1);
  });

  test('no horizontal scroll at 390px viewport width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);
  });

  test('axe accessibility audits pass in light and dark mode on /, /o-projekcie, and /zrodla', async ({ page }) => {
    const paths = ['/', '/o-projekcie', '/zrodla'];

    for (const path of paths) {
      // Light mode
      await page.goto(path);
      let results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `Axe violations on ${path} (light)`).toEqual([]);

      // Dark mode
      await page.addInitScript(() => {
        localStorage.setItem('faktografia-theme', 'dark');
      });
      await page.goto(path);
      results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `Axe violations on ${path} (dark)`).toEqual([]);
    }
  });

  test('prefers dark theme from localStorage set via addInitScript', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const logo = page.locator('header img[alt="Faktografia"]');
    await expect(logo).toHaveAttribute('src', '/brand/faktografia-logo-jasne.svg');
  });

  test('theme switcher button touch target is at least 44x44 px', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('header button', { hasText: 'Motyw:' }).first();
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

    const themeButton = page.locator('header button', { hasText: 'Motyw:' }).first();
    await expect(themeButton).toBeVisible();

    await themeButton.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(themeButton).toContainText('Motyw: Jasny');

    await themeButton.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(themeButton).toContainText('Motyw: Ciemny');

    const logo = page.locator('header img[alt="Faktografia"]');
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
