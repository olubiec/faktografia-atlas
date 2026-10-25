import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

test.describe('Udostępnianie z panelu wskaźnika (W2.19 @S19)', () => {
  test('?i=density&l=pow -> podgląd z tytułem, rokiem i powiaty, CSV 380 wierszy, zero nowych żądań', async ({
    page,
  }) => {
    await page.goto('/?i=density&l=pow');

    const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
    await expect(panel).toBeVisible({ timeout: 15000 });

    // Śledzenie żądań sieciowych po kliknięciu przycisku
    const networkRequests: string[] = [];
    page.on('request', (req) => {
      networkRequests.push(new URL(req.url()).pathname);
    });

    // Kliknięcie "Pobierz i udostępnij" w panelu wskaźnika
    const shareButton = panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' });
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Zero żądań do /data/ i /geo/ po otwarciu okna udostępniania
    const dataGeoRequests = networkRequests.filter(
      (p) => p.startsWith('/data/') || p.startsWith('/geo/')
    );
    expect(dataGeoRequests.length).toBe(0);

    // Karta mapy ma tytuł z nazwą wskaźnika, rokiem i "powiaty"
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();
    await expect(svgPreview).toContainText('Gęstość zaludnienia');
    await expect(svgPreview).toContainText('2025');
    await expect(svgPreview).toContainText('powiaty');

    // Pobranie CSV - sprawdzenie liczby wierszy dla poziomu powiatów (380 powiatów)
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = fs.readFileSync(csvPath!, 'utf-8');

    // Nagłówek UTF-8 BOM i separator ';'
    expect(csvText.startsWith('\uFEFF')).toBe(true);
    expect(csvText).toContain(';');

    // Liczba wierszy danych (bez nagłówka)
    const lines = csvText.trim().split('\r\n').filter(Boolean);
    const dataRows = lines.length - 1;
    expect(dataRows).toBe(380);
  });

  test('po wejściu w małopolskie (?u=12) -> 22 kształty w scenie mapy i CSV z 22 wierszami', async ({
    page,
  }) => {
    await page.goto('/?i=density&u=12');

    const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
    await expect(panel).toBeVisible({ timeout: 15000 });

    const shareButton = panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' });
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // 22 kształty (powiaty małopolskie) w podglądzie sceny mapy
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();

    // Odczyt liczby elementów path w SVG podglądu mapy (22 powiaty + 1 kontur opcjonalnie)
    const shapePaths = svgPreview.locator('path');
    const pathCount = await shapePaths.count();
    expect(pathCount).toBeGreaterThanOrEqual(22);

    // Pobranie CSV i weryfikacja 22 wierszy
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
    const csvDownload = await csvDownloadPromise;

    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = fs.readFileSync(csvPath!, 'utf-8');

    const lines = csvText.trim().split('\r\n').filter(Boolean);
    const dataRows = lines.length - 1;
    expect(dataRows).toBe(22);
  });

  test('telefon 390x844: przycisk w panelu, okno pełnoekranowe, bez przewijania, axe ok', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?i=density');

    const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
    await expect(panel).toBeVisible({ timeout: 15000 });

    const shareButton = panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' });
    await expect(shareButton).toBeVisible();

    // Weryfikacja wysokości obszaru dotykowego >= 44px
    const buttonBox = await shareButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(43.5);

    await shareButton.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Brak poziomego przewijania
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Dostępność axe bez błędów
    const accessibilityResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
