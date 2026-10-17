import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Interactive Components Page (CC2.2)', () => {
  test('axe accessibility check in light and dark themes', async ({ page }) => {
    // Light theme check
    await page.goto('/__test/interactive');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    });
    const accessibilityScanResultsLight = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResultsLight.violations).toEqual([]);

    // Dark theme check
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    const accessibilityScanResultsDark = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResultsDark.violations).toEqual([]);
  });

  test('Dialog opens, closes on Escape, and focus returns to trigger', async ({ page }) => {
    await page.goto('/__test/interactive');

    const dialogTrigger = page.getByRole('button', { name: 'Otwórz okno dialogowe' });
    await dialogTrigger.click();

    // Verify dialog content is visible
    const dialogTitle = page.getByRole('heading', { name: 'Tytuł okna dialogowego' });
    await expect(dialogTitle).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Verify dialog content is hidden
    await expect(dialogTitle).not.toBeVisible();

    // Verify focus returned to the trigger button
    await expect(dialogTrigger).toBeFocused();
  });

  test('Tabs keyboard navigation via arrow keys', async ({ page }) => {
    await page.goto('/__test/interactive');

    const tab1 = page.getByRole('tab', { name: 'Zakładka 1' });
    const tab2 = page.getByRole('tab', { name: 'Zakładka 2' });
    const tab3 = page.getByRole('tab', { name: 'Zakładka 3' });

    // Focus on tab 1
    await tab1.focus();
    await expect(tab1).toBeFocused();
    await expect(tab1).toHaveAttribute('data-state', 'active');

    // Press ArrowRight to move focus and activate tab 2
    await page.keyboard.press('ArrowRight');
    await expect(tab2).toBeFocused();
    await expect(tab2).toHaveAttribute('data-state', 'active');

    // Press ArrowRight again to move to tab 3
    await page.keyboard.press('ArrowRight');
    await expect(tab3).toBeFocused();
    await expect(tab3).toHaveAttribute('data-state', 'active');

    // Press ArrowLeft to move back to tab 2
    await page.keyboard.press('ArrowLeft');
    await expect(tab2).toBeFocused();
    await expect(tab2).toHaveAttribute('data-state', 'active');
  });
});
