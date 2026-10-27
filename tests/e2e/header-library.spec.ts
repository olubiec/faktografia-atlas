import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Header Library link (@S21)', () => {
  test('odnośnik "Biblioteka" jest widoczny na / i /biblioteka na komputerze, a kliknięcie prowadzi do /biblioteka', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Strona główna
    await page.goto('/');
    const desktopLinkOnHome = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    await expect(desktopLinkOnHome).toBeVisible();
    await expect(desktopLinkOnHome).not.toHaveAttribute('aria-current', 'page');

    // Kliknięcie i przejście do /biblioteka
    await desktopLinkOnHome.click();
    await expect(page).toHaveURL(/\/biblioteka/);

    // Strona /biblioteka
    const desktopLinkOnLibrary = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    await expect(desktopLinkOnLibrary).toBeVisible();
    await expect(desktopLinkOnLibrary).toHaveAttribute('aria-current', 'page');
  });

  test('aktywny stan odnośnika "Biblioteka" działa na podstronie /biblioteka/101', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/biblioteka/101');
    const desktopLink = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    await expect(desktopLink).toBeVisible();
    await expect(desktopLink).toHaveAttribute('aria-current', 'page');
  });

  test('odnośnik "Biblioteka" jest widoczny w menu mobilnym i działa na telefonie', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuBtn = page.locator('header button[aria-label="Menu"]');
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    const mobileLink = page.locator('header').getByRole('link', { name: 'Biblioteka' });
    await expect(mobileLink).toBeVisible();
    await expect(mobileLink).not.toHaveAttribute('aria-current', 'page');

    await mobileLink.click();
    await expect(page).toHaveURL(/\/biblioteka/);

    // Po przejściu na /biblioteka menu jest zamknięte, sprawdzamy otwierając ponownie
    await menuBtn.click();
    const activeMobileLink = page.locator('header').getByRole('link', { name: 'Biblioteka' });
    await expect(activeMobileLink).toBeVisible();
    await expect(activeMobileLink).toHaveAttribute('aria-current', 'page');
  });

  test('na 390 px nagłówek bez zmiany wysokości (56 px) i brak poziomego przewijania przy 360 i 390 px', async ({ page }) => {
    // Test 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const header = page.locator('header');
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBe(56);

    let isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);

    // Test 360px
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);
  });

  test('pole dotykowe odnośnika "Biblioteka" ma wymiary co najmniej 44x44 px', async ({ page }) => {
    // Komputer
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const desktopLink = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    const desktopBox = await desktopLink.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeGreaterThanOrEqual(44);
    expect(desktopBox!.height).toBeGreaterThanOrEqual(44);

    // Telefon
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('header button[aria-label="Menu"]').click();
    const mobileLink = page.locator('header').getByRole('link', { name: 'Biblioteka' });
    const mobileBox = await mobileLink.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeGreaterThanOrEqual(44);
    expect(mobileBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('brak błędów axe na / i /biblioteka w trybie jasnym i ciemnym', async ({ page }) => {
    const paths = ['/', '/biblioteka'];

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

  test('najwyżej jedno czerwone zakreślenie na ekranie', async ({ page }) => {
    await page.goto('/biblioteka');
    await page.waitForTimeout(500);
    const annotations = page.locator('svg.rough-annotation');
    expect(await annotations.count()).toBeLessThanOrEqual(1);
  });

  test('działa poprawnie przy prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const link = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/biblioteka/);
  });
});
