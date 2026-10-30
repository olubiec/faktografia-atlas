import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

test.describe('Pobierz i udostępnij (W2.18 @S19)', () => {
  test('okno -> podgląd SVG z tytułem i Źródło: GUS, format Story, PNG i CSV download, network request tracking', async ({
    page,
  }) => {
    await page.goto('/__test/ui');

    // Track network requests after opening dialog
    const networkRequests: string[] = [];
    page.on('request', (req) => {
      networkRequests.push(new URL(req.url()).pathname);
    });

    await page.click('#open-share-dialog');

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Verify zero /data/* and /geo/* requests after opening dialog
    const dataGeoRequests = networkRequests.filter(
      (p) => p.startsWith('/data/') || p.startsWith('/geo/')
    );
    expect(dataGeoRequests.length).toBe(0);

    // Verify SVG preview with title and "Źródło: GUS"
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();
    await expect(svgPreview).toContainText('Gęstość zaludnienia');
    await expect(svgPreview).toContainText('Źródło: GUS');

    // Select "Story" format
    await page.getByRole('button', { name: 'Story (9:16)' }).click();
    await expect(svgPreview).toHaveAttribute('viewBox', '0 0 1080 1920');

    // Switch back to "Post" format for 1080x1350 test
    await page.getByRole('button', { name: 'Post (4:5)' }).click();
    await expect(svgPreview).toHaveAttribute('viewBox', '0 0 1080 1350');

    // Test PNG download
    const pngDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz obraz' }).click();
    const pngDownload = await pngDownloadPromise;
    expect(pngDownload.suggestedFilename()).toMatch(/\.png$/);

    const pngPath = await pngDownload.path();
    expect(pngPath).not.toBeNull();
    const pngBuffer = fs.readFileSync(pngPath!);

    // Verify PNG header signature (89 50 4E 47 0D 0A 1A 0A)
    expect(pngBuffer.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );

    // Read width (bytes 16-19) and height (bytes 20-23) from IHDR chunk
    const pngWidth = pngBuffer.readUInt32BE(16);
    const pngHeight = pngBuffer.readUInt32BE(20);
    expect(pngWidth).toBe(1080);
    expect(pngHeight).toBe(1350);

    // Test CSV download
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = fs.readFileSync(csvPath!, 'utf-8');

    // Verify UTF-8 BOM (\uFEFF) and ';' separator
    expect(csvText.startsWith('\uFEFF')).toBe(true);
    expect(csvText).toContain(';');

    // Test Escape key closes dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('na 390x844: brak poziomego przewijania, przyciski >= 44px, axe bez błędów', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/__test/ui');
    await page.click('#open-share-dialog');

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Check no horizontal scroll on page
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Check touch target heights >= 44px
    const buttons = dialog.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    for (let i = 0; i < buttonCount; i++) {
      const btn = buttons.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(43.5);
      }
    }

    // Accessibility check
    const accessibilityResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('na 360x740 oraz 1440x900 podgląd karty SVG oraz główny przycisk są jednocześnie widoczne bez obcinania', async ({ page }) => {
    const viewports = [
      { width: 360, height: 740 },
      { width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/__test/ui');
      await page.click('#open-share-dialog');

      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();

      // Check SVG preview is visible
      const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
      await expect(svgPreview).toBeInViewport();

      // Check main download button is visible
      const downloadButton = page.getByRole('button', { name: 'Pobierz obraz' });
      await expect(downloadButton).toBeInViewport();

      // Close dialog
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });
});
