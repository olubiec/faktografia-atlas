import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('UI Components Test Page /__test/ui', () => {
  test('buttons and inputs meet size and styling requirements and accessibility check passes', async ({ page }) => {
    await page.goto('/__test/ui');

    // Button checks
    const primaryBtn = page.getByRole('button', { name: 'Primary' });
    const box = await primaryBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    const shadow = await primaryBtn.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');

    // Input checks
    const input = page.getByPlaceholder('Gmina, powiat albo miejscowość');
    const inputBox = await input.boundingBox();
    expect(inputBox?.height).toBeGreaterThanOrEqual(44);

    // Accessibility check with axe
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('captures screenshots in light and dark mode for desktop and mobile', async ({ page }) => {
    await page.goto('/__test/ui');

    // Desktop Light
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: 'test-results/ui-1440-light.png', fullPage: true });

    // Desktop Dark
    await page.click('#theme-toggle');
    await page.screenshot({ path: 'test-results/ui-1440-dark.png', fullPage: true });

    // Mobile Dark
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-results/ui-390-dark.png', fullPage: true });

    // Mobile Light
    await page.click('#theme-toggle');
    await page.screenshot({ path: 'test-results/ui-390-light.png', fullPage: true });
  });
});
