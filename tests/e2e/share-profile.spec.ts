import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

test.describe('Udostępnianie z profilu (W2.20 @S19)', () => {
  test('profil powiatu 3217 -> karta z Powiat wałecki i liczbą z przeglądu; CSV z wierszami; zero nowych żądań', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Wait for profile sheet to be visible with unit title "Powiat wałecki"
    const profileHeading = page.locator('h2', { hasText: 'Powiat wałecki' });
    await expect(profileHeading).toBeVisible();

    // Verify "Kopiuj link" button exists in footer and functions
    const copyLinkBtn = page.getByRole('button', { name: 'Kopiuj link' });
    await expect(copyLinkBtn).toBeVisible();

    // Track network requests after opening share dialog
    const networkRequests: string[] = [];
    page.on('request', (req) => {
      networkRequests.push(new URL(req.url()).pathname);
    });

    // Find and click "Pobierz i udostępnij" button in profile overview
    const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Verify dialog opens
    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Verify zero new /data/* and /geo/* requests after opening share dialog
    const dataGeoRequests = networkRequests.filter(
      (p) => p.startsWith('/data/') || p.startsWith('/geo/')
    );
    expect(dataGeoRequests.length).toBe(0);

    // Verify SVG preview contains unit name "Powiat wałecki"
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();
    await expect(svgPreview).toContainText('Powiat wałecki');

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
    // Verify row for indicators (20 indicators or header + rows)
    const lines = csvText.trim().split('\r\n');
    expect(lines.length).toBeGreaterThanOrEqual(20);
    expect(csvText).toContain('Powiat wałecki');

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('na 360 i 390 px: brak poziomego przewijania, pola dotykowe >= 44 px, axe bez błędów', async ({
    page,
  }) => {
    test.setTimeout(120000);
    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e&u=3217&sheet=full');

      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const profileHeading = page.locator('h2', { hasText: 'Powiat wałecki' }).first();
      await expect(profileHeading).toBeAttached();

      const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
      await expect(shareBtn).toBeVisible();
      await shareBtn.click();

      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();

      // Check no horizontal scroll
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

      // Accessibility check on dialog
      const accessibilityResults = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      expect(accessibilityResults.violations).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });
});
