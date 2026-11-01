import { test, expect } from '@playwright/test';

test.describe('Mobile BottomSheet Scroll W15-M02', () => {
  test.setTimeout(60000);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
  ]) {
    test(`scrolling inside sheet at 40% height reaches and clicks "Pobierz i udostępnij" without ?sheet=full at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      // Otwarcie profilu powiatu wałeckiego (3217) bez parametru ?sheet=full
      await page.goto('/?e2e&u=3217');

      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();

      // Potwierdź stan arkusza na poziomie 35–45% wysokości okna
      await page.waitForFunction((vh) => {
        const el = document.querySelector('[role="dialog"]');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const ratio = (vh - rect.y) / vh;
        return ratio >= 0.35 && ratio <= 0.45;
      }, viewport.height);

      // Ostatni przycisk w sekcji przeglądu profilu
      const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
      await expect(shareBtn).toBeAttached();

      // Przewiń wewnątrz arkusza tak, by sięgnąć końca treści
      await shareBtn.scrollIntoViewIfNeeded();
      await expect(shareBtn).toBeVisible();

      // Sprawdź czy przycisk znajduje się w widocznym obszarze ekranu
      const box = await shareBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
        expect(box.y).toBeGreaterThanOrEqual(0);
      }

      // Kliknij przycisk i potwierdź otwarcie dialogu udostępniania
      await shareBtn.click();
      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();
    });
  }

  test('clicking "Rozwiń" expands sheet to >= 90% and "Zwiń" returns to ~40%', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Poczekaj na ustabilizowanie arkusza na poziomie ~40%
    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const ratio = (844 - rect.y) / 844;
      return ratio >= 0.35 && ratio <= 0.45;
    });

    const expandBtn = sheet.getByRole('button', { name: 'Rozwiń' });
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const ratio = (844 - rect.y) / 844;
      console.log('CHECKING EXPAND RATIO:', ratio, 'y:', rect.y);
      return ratio >= 0.90;
    });

    const collapseBtn = sheet.getByRole('button', { name: 'Zwiń' });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const ratio = (844 - rect.y) / 844;
      return ratio >= 0.35 && ratio <= 0.45;
    });
  });

  test('exactly one close button (x) is present in mobile profile sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    const closeButtons = sheet.locator('button[aria-label="Zamknij"]');
    await expect(closeButtons).toHaveCount(1);
  });
});
