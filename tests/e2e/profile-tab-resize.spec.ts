import { test, expect } from '@playwright/test';

test.describe('Zakładka profilu po zmianie szerokości okna (@S16)', () => {
  test.setTimeout(60000);

  test('zakładka Powiaty zostaje po 1440x900 -> 360x740 -> 1440x900 (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    await side.getByRole('tab', { name: /Powiaty \(\d+\)/ }).click();
    await expect(side.getByRole('tab', { name: /Powiaty \(\d+\)/ })).toHaveAttribute('aria-selected', 'true');

    await page.setViewportSize({ width: 360, height: 740 });
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('tab', { name: /Powiaty \(\d+\)/ })).toHaveAttribute('aria-selected', 'true');

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(side.getByRole('tab', { name: /Powiaty \(\d+\)/ })).toHaveAttribute('aria-selected', 'true');
  });

  test('po wybraniu innej jednostki zakładka wraca do Przeglądu (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    await side.getByRole('tab', { name: /Powiaty \(\d+\)/ }).click();
    await side.locator('[data-slot="child-unit-button"]').first().click();

    await expect(page).not.toHaveURL(/u=12(&|$)/);
    await expect(side.getByRole('tab', { name: 'Przegląd' })).toHaveAttribute('aria-selected', 'true');
  });
});
