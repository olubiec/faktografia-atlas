import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const SECTIONS = [
  'kolory',
  'typografia',
  'logo',
  'przyciski',
  'pola',
  'ikony',
  'zakladki',
  'dymek',
  'okno',
  'popover',
  'suwak',
  'przelacznik',
  'arkusz',
  'zakreslenia',
];

test.describe('Design System Page /design', () => {
  test('all 14 required sections are visible on the page', async ({ page }) => {
    await page.goto('/design');

    for (const sectionId of SECTIONS) {
      const section = page.locator(`#${sectionId}`);
      await expect(section).toBeVisible();
    }
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/design');

    const htmlTag = page.locator('html');
    await expect(htmlTag).not.toHaveAttribute('data-theme', 'dark');

    await page.click('#theme-toggle');
    await expect(htmlTag).toHaveAttribute('data-theme', 'dark');

    await page.click('#theme-toggle');
    await expect(htmlTag).not.toHaveAttribute('data-theme', 'dark');
  });

  test('axe accessibility scan passes in both light and dark mode', async ({ page }) => {
    await page.goto('/design');
    // Bez przejść i animacji: axe nie może mierzyć kontrastu w połowie zmiany motywu (niestabilny test, #158)
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });

    const lightResults = await new AxeBuilder({ page }).analyze();
    expect(lightResults.violations).toEqual([]);

    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const darkResults = await new AxeBuilder({ page }).analyze();
    expect(darkResults.violations).toEqual([]);
  });

  test('no horizontal scroll on mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/design');

    const hasNoHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });

    expect(hasNoHorizontalScroll).toBe(true);
  });

  test('captures visual regression snapshots on CI', async ({ page }) => {
    test.skip(!process.env.CI, 'Snapshots test runs only in CI environment (Docker container)');

    await page.emulateMedia({ reducedMotion: 'reduce' });

    const screenshotOptions = {
      fullPage: true,
      animations: 'disabled' as const,
      maxDiffPixelRatio: 0.005,
    };

    // 1. Desktop Light (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/design');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('design-desktop-light.png', screenshotOptions);

    // 2. Desktop Dark (1440x900)
    await page.click('#theme-toggle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('design-desktop-dark.png', screenshotOptions);

    // 3. Mobile Dark (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('design-mobile-dark.png', screenshotOptions);

    // 4. Mobile Light (390x844)
    await page.click('#theme-toggle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('design-mobile-light.png', screenshotOptions);
  });
});
