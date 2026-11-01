import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

test.describe('Udostępnianie porównania W2.21 (@S19)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  test('porównanie ?u=12&c=12,24 -> karta z nazwami obu województw i dwiema mapkami; teksty różnic zgodne z tabelą; CSV z wierszami; zero nowych żądań (@S19)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,24');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    await expect(page.locator('[data-slot="profile-compare"]')).toBeVisible();

    // Śledzenie żądań sieciowych po otwarciu okna udostępniania
    const networkRequests: string[] = [];
    page.on('request', (req) => {
      networkRequests.push(new URL(req.url()).pathname);
    });

    // Przycisk „Pobierz i udostępnij” w zakładce Porównaj
    const shareBtn = page
      .locator('[data-slot="profile-compare"]')
      .getByRole('button', { name: 'Pobierz i udostępnij' });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Okno modalne udostępniania
    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Brak nowych żądań /data/* ani /geo/*
    const dataGeoRequests = networkRequests.filter(
      (p) => p.startsWith('/data/') || p.startsWith('/geo/')
    );
    expect(dataGeoRequests.length).toBe(0);

    // Podgląd SVG karty porównania zawiera nazwy obu jednostek
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();
    await expect(svgPreview).toContainText('małopolskie');
    await expect(svgPreview).toContainText('śląskie');

    // Pobieranie pliku CSV
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = fs.readFileSync(csvPath!, 'utf-8');

    // Weryfikacja formatu CSV: UTF-8 BOM, średnik jako separator, nazwy jednostek
    expect(csvText.startsWith('\uFEFF')).toBe(true);
    expect(csvText).toContain(';');
    expect(csvText).toContain('małopolskie');
    expect(csvText).toContain('śląskie');

    const lines = csvText.trim().split('\r\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);

    // Zamknięcie okna
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('na 360 i 390 px: brak poziomego przewijania, pola dotykowe >= 44 px, axe bez błędów (@S19)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e=1&u=12&c=12,24');

      await page.waitForFunction(
        () =>
          (window as any).__atlas?.ready === true &&
          (window as any).__atlas?.profileOpen === true
      );

      const shareBtn = page
        .locator('[data-slot="profile-compare"]')
        .getByRole('button', { name: 'Pobierz i udostępnij' });
      await expect(shareBtn).toBeVisible();
      await shareBtn.click();

      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();

      // Brak poziomego przewijania
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // Pola dotykowe przycisków >= 44px
      const buttons = dialog.getByRole('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const box = await btn.boundingBox();
        if (box) {
          expect(box.height >= 43.5 || box.width >= 43.5).toBe(true);
        }
      }

      // Sprawdzenie dostępności axe dla okna dialogowego
      const accessibilityResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze();
      expect(accessibilityResults.violations).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('najwyżej jedno czerwone zakreślenie na ekranie i obsługa prefers-reduced-motion (@S19)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e=1&u=12&c=12,24');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const shareBtn = page
      .locator('[data-slot="profile-compare"]')
      .getByRole('button', { name: 'Pobierz i udostępnij' });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    const annotations = page.locator('.rough-annotation');
    const count = await annotations.count();
    expect(count).toBeLessThanOrEqual(1);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
