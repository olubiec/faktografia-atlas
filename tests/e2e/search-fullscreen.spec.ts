import { test, expect } from '@playwright/test';

test.describe('Wyszukiwarka wskaźników: okno pełnoekranowe i kategorie (@S-search)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: /^Wskaźnik/ }).first().click();
  });

  test('@S-search okno wypełnia ekran, przycisk zamknięcia ma min. 44 px, Esc zamyka', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Wybór wskaźnika' });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(1278);
    expect(box!.height).toBeGreaterThanOrEqual(798);
    const close = dialog.getByRole('button', { name: 'Zamknij' });
    const cb = await close.boundingBox();
    expect(cb!.width).toBeGreaterThanOrEqual(44);
    expect(cb!.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('@S-search klik w kategorię pokazuje jej wskaźniki z wielokrotnym wyborem', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Wybór wskaźnika' });
    await dialog.getByRole('button', { name: 'Wiek', exact: true }).click();
    const group = dialog.getByRole('group', { name: 'Wskaźniki: Wiek' });
    const boxes = group.getByRole('checkbox');
    await expect(boxes).toHaveCount(2);
    await boxes.nth(0).check({ force: true });
    await boxes.nth(1).check({ force: true });
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
    await expect(dialog.getByRole('button', { name: 'Pokaż na mapie (2)' })).toBeEnabled();
  });
});
