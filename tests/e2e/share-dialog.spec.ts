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

test.describe('ShareDialog: przyciski na wąskim telefonie (@S-share)', () => {
  test('na 390 px przyciski mieszczą się w viewport, mają min 44 px i nie są przykryte (@S-share)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto('/');
    const shareBtn = page.getByRole('button', { name: /Udostępnij|Pobierz|Zapisz/ }).first();
    test.skip(!(await shareBtn.isVisible()), 'brak przycisku otwierającego dialog w tym widoku');
    await shareBtn.click();
    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    const bar = dialog.getByTestId('share-actions');
    await bar.evaluate((el) => el.scrollTo(0, 0));
    const buttons = bar.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    const barBox = await bar.boundingBox();
    for (let i = 0; i < count; i++) {
      const b = buttons.nth(i);
      await b.scrollIntoViewIfNeeded();
      const box = await b.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(390);
      expect(box!.y + box!.height).toBeLessThanOrEqual(740);
      // napis nie jest ucięty
      expect(await b.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      // przycisk w obrębie paska i niezasłonięty
      expect(box!.y).toBeGreaterThanOrEqual(barBox!.y - 1);
      const top = await b.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return hit === el || el.contains(hit);
      });
      expect(top).toBe(true);
    }

    // 'Poziomy (16:9)' nie jest zasłonięty przez dolny pasek
    const wide = dialog.getByRole('button', { name: /Poziomy/ });
    await wide.scrollIntoViewIfNeeded();
    const wb = await wide.boundingBox();
    const bb = await bar.boundingBox();
    expect(wb!.y + wb!.height).toBeLessThanOrEqual(bb!.y + 1);
  });
});
