import { test, expect } from '@playwright/test';

test.describe('Wybór wskaźników w porównaniu (@S-compare)', () => {
  test('odznaczenie wskaźnika ukrywa wiersz tabeli i zapisuje ?wsk= (@S-compare)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true,
    );
    const rows = page.locator('[data-slot="compare-row"]');
    const before = await rows.count();
    expect(before).toBeGreaterThan(1);

    await page.locator('[data-slot="compare-indicator-picker"] summary').click();
    const box = page.locator('[data-slot="compare-indicator-picker"] input[type="checkbox"]').first();
    await expect(box).toBeChecked();
    await box.uncheck();

    await expect(rows).toHaveCount(before - 1);
    await expect(page).toHaveURL(/wsk=/);
  });
});
