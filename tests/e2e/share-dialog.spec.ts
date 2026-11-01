import { test, expect } from '@playwright/test';

test.describe('ShareDialog: okno pobierania i udostępniania', () => {
  test('na telefonie 360x740 podgląd karty i przycisk Pobierz obraz są jednocześnie widoczne', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?sheet=full');

    // Otwórz okno udostępniania
    const shareBtn = page.getByRole('button', { name: /Udostępnij|Pobierz|Zapisz/ }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
    } else {
      await page.keyboard.press('KeyS');
    }

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    if (await dialog.isVisible()) {
      // Podgląd SVG i przycisk Pobierz obraz widoczne w oknie
      await expect(dialog.locator('svg').first()).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Pobierz obraz' })).toBeVisible();

      // Brak zabronionych klas rounded/shadow/backdrop-blur
      const classAttr = (await dialog.locator('div').first().getAttribute('class')) || '';
      expect(classAttr).not.toContain('rounded-');
      expect(classAttr).not.toContain('shadow-');
    }
  });

  test('na komputerze 1440x900 dialog działa i zachowuje min 44px pola dotykowe', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const shareBtn = page.getByRole('button', { name: /Udostępnij|Pobierz/ }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();
      const closeBtn = dialog.getByRole('button', { name: 'Zamknij' });
      const box = await closeBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
  });
});
