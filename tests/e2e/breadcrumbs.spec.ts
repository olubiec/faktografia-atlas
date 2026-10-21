import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Breadcrumbs, URL ?u= and Keyboard Sub-Unit List (CC4.3)', () => {
  test('displays full breadcrumb path and last item has aria-current="page"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=0201011&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const nav = page.locator('nav[aria-label="Ścieżka"]');
    await expect(nav).toBeVisible();

    await expect(nav).toContainText('Polska');
    await expect(nav).toContainText('dolnośląskie');
    await expect(nav).toContainText('powiat bolesławiecki');
    await expect(nav).toContainText('Bolesławiec');

    const currentPageItem = nav.locator('[aria-current="page"]');
    await expect(currentPageItem).toBeVisible();
    await expect(currentPageItem).toHaveText('Bolesławiec (miasto)');
  });

  test('clicking parent breadcrumbs updates selected unit and ?u= URL parameter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=0201011&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const nav = page.locator('nav[aria-label="Ścieżka"]');

    // Click "dolnośląskie" in breadcrumbs
    const wojButton = nav.locator('button', { hasText: 'dolnośląskie' });
    await wojButton.click();
    await page.waitForTimeout(200);

    let atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('02');
    let urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).toContain('u=02');

    // Click "Polska" in breadcrumbs
    const polskaButton = nav.locator('button', { hasText: 'Polska' });
    await polskaButton.click();
    await page.waitForTimeout(200);

    atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBeNull();
    urlParams = await page.evaluate(() => window.location.search);
    expect(urlParams).not.toContain('u=');
  });

  test('parent breadcrumb buttons have minimum 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=0201&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const nav = page.locator('nav[aria-label="Ścieżka"]');
    const polskaButton = nav.locator('button', { hasText: 'Polska' });
    await expect(polskaButton).toBeVisible();

    const box = await polskaButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('sub-unit list shows children and supports mouse and keyboard navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const unitList = page.locator('ul[aria-label="Jednostki podrzędne"]');
    await expect(unitList).toBeVisible();

    const powButton = unitList.locator('button', { hasText: 'powiat bolesławiecki' });
    await expect(powButton).toBeVisible();

    // Click on a sub-unit
    await powButton.click();
    await page.waitForTimeout(200);

    let atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('0201');

    // Keyboard selection via Enter/Space
    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const powButton2 = page.locator('ul[aria-label="Jednostki podrzędne"]').locator('button', { hasText: 'powiat bolesławiecki' });
    await powButton2.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('0201');
  });

  test('focus order follows breadcrumbs -> Back button -> sub-unit list -> map', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const navPolskaButton = page.locator('nav[aria-label="Ścieżka"]').locator('button', { hasText: 'Polska' });
    await navPolskaButton.focus();

    // Tab -> Back button ("Wróć")
    await page.keyboard.press('Tab');
    const focusedBack = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focusedBack).toContain('Wróć');

    // Tab -> First item in sub-unit list
    await page.keyboard.press('Tab');
    const focusedSubUnit = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(focusedSubUnit).toBe('button');
    const isInsideUnitList = await page.evaluate(() => {
      return !!document.activeElement?.closest('ul[aria-label="Jednostki podrzędne"]');
    });
    expect(isInsideUnitList).toBe(true);

    // Tab through sub-unit list items to reach map
    const subUnitButtons = page.locator('ul[aria-label="Jednostki podrzędne"] button');
    const count = await subUnitButtons.count();
    await subUnitButtons.nth(count - 1).focus();
    await page.keyboard.press('Tab');

    const isInsideMap = await page.evaluate(() => {
      const active = document.activeElement;
      return !!active?.closest('[aria-label="Mapa Polski"]');
    });
    expect(isInsideMap).toBe(true);
  });

  test('axe accessibility audit passes on voivodeship view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=02&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
