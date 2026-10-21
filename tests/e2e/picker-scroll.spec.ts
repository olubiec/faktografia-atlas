import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Indicator Picker & Panel Scrolling (@S14)', () => {
  const viewports = [
    { name: '390x844 (mobile)', width: 390, height: 844 },
    { name: '1440x600 (low screen desktop)', width: 1440, height: 600 },
  ];

  for (const { name, width, height } of viewports) {
    test(`@S14 indicator picker fits in viewport and scrolls internally to select last indicator on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      // Open indicator picker button
      const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
      await expect(triggerButton).toBeVisible();
      await triggerButton.click();

      const popover = page.getByRole('listbox', { name: 'Lista wskaźników' });
      await expect(popover).toBeVisible();

      // Verify the popover container fits within viewport bounds
      const popoverBox = await page.locator('[role="dialog"], [data-slot="popover-content"]').boundingBox();
      expect(popoverBox).not.toBeNull();
      expect(popoverBox!.y + popoverBox!.height).toBeLessThanOrEqual(height + 2);

      // Verify search input is visible at top before scrolling
      const searchInput = page.getByPlaceholder('Szukaj wskaźnika…');
      await expect(searchInput).toBeVisible();

      // Find last indicator option button in listbox
      const lastOption = page.getByRole('option').last();

      // Scroll last option into view
      await lastOption.scrollIntoViewIfNeeded();
      await expect(lastOption).toBeVisible();

      // Search input should still be visible after scrolling
      await expect(searchInput).toBeInViewport();

      // Click last option
      const lastOptionText = await lastOption.innerText();
      await lastOption.click();

      // Popover should close
      await expect(popover).not.toBeVisible();

      // URL should be updated with new indicator parameter ?i=
      await expect(page).toHaveURL(/\?i=/);
    });

    test(`@S14 indicator panel scrolls completely so ranking and footer are visible on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      const panel = page.getByRole('complementary', { name: 'Panel wskaźnika' });
      await expect(panel).toBeVisible();

      // Find ranking or footer element at the bottom of indicator panel
      const footerText = panel.getByText(/Źródło: GUS, Bank Danych Lokalnych/i);

      // Scroll to footer
      await footerText.scrollIntoViewIfNeeded();
      await expect(footerText).toBeInViewport();
    });
  }

  test('@S14 search input field remains visible while list is scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await page.goto('/');

    const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
    await triggerButton.click();

    const listbox = page.getByRole('listbox', { name: 'Lista wskaźników' });
    const searchInput = page.getByPlaceholder('Szukaj wskaźnika…');

    // Scroll listbox down
    await listbox.evaluate((el) => {
      el.scrollTop = 300;
    });

    // Search input remains in viewport
    await expect(searchInput).toBeInViewport();
  });

  test('@S14 no horizontal scroll at 390px and touch targets are at least 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
    });
    expect(isNotHorizontallyScrollable).toBe(true);

    const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
    const box = await triggerButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await triggerButton.click();
    const firstOption = page.getByRole('option').first();
    const optionBox = await firstOption.boundingBox();
    expect(optionBox).not.toBeNull();
    expect(optionBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('@S14 axe accessibility audit passes with indicator picker open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
    await triggerButton.click();
    await expect(page.getByRole('listbox', { name: 'Lista wskaźników' })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
