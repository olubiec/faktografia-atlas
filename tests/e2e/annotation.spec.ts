import { test, expect } from '@playwright/test';

test.describe('Annotation System (CC2.3)', () => {
  test('ensures strictly one annotation in DOM at a time when switching types', async ({ page }) => {
    await page.goto('/__test/annotation');

    // Domyślnie aktywny 'circle'
    await expect(page.locator('.rough-annotation')).toHaveCount(1);

    // Klikamy przycisk 'Pokaż underline'
    await page.getByRole('button', { name: 'Pokaż underline' }).click();
    await expect(page.locator('.rough-annotation')).toHaveCount(1);

    // Klikamy przycisk 'Pokaż bracket'
    await page.getByRole('button', { name: 'Pokaż bracket' }).click();
    await expect(page.locator('.rough-annotation')).toHaveCount(1);

    // Klikamy przycisk 'Pokaż box'
    await page.getByRole('button', { name: 'Pokaż box' }).click();
    await expect(page.locator('.rough-annotation')).toHaveCount(1);

    // Klikamy 'Ukryj zakreślenie'
    await page.getByRole('button', { name: 'Ukryj zakreślenie' }).click();
    await expect(page.locator('.rough-annotation')).toHaveCount(0);
  });

  test('respects prefers-reduced-motion: reduce (animate: false)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/__test/annotation');

    const annotation = page.locator('.rough-annotation');
    await expect(annotation).toHaveCount(1);

    // Przy reduced motion ścieżki SVG nie powinny mieć animacji CSS w stylu
    const paths = annotation.locator('path');
    const pathCount = await paths.count();
    expect(pathCount).toBeGreaterThan(0);

    for (let i = 0; i < pathCount; i++) {
      const style = await paths.nth(i).getAttribute('style');
      expect(style ?? '').not.toContain('rough-notation-dash');
    }
  });
});
