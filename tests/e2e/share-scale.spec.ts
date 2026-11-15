import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test.describe('Eksport PNG w skali 2x (@S19)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() }),
      );
    });
  });

  test('@S19 przełącznik wysokiej rozdzielczości: 2160x2700 włączony, 1080x1350 wyłączony', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&i=density&l=pow');

    const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
    await expect(panel).toBeVisible({ timeout: 15000 });
    await panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' }).click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Post (4:5)' }).click();

    const toggle = dialog.getByRole('button', { name: 'Wysoka rozdzielczość (2×)' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    const readSize = async () => {
      const downloadPromise = page.waitForEvent('download');
      await dialog.getByRole('button', { name: 'Pobierz obraz' }).click();
      const download = await downloadPromise;
      const buf = fs.readFileSync((await download.path())!);
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    };

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(await readSize()).toEqual({ w: 2160, h: 2700 });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await readSize()).toEqual({ w: 1080, h: 1350 });
  });
});
