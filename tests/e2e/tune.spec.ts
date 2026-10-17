import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Tune Panel ?tune', () => {
  test('code splitting: without ?tune, no TunePanel/tweakpane bundle requests are made', async ({ page }) => {
    const tuneRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('TunePanel') || url.includes('tweakpane')) {
        tuneRequests.push(url);
      }
    });

    await page.goto('/');
    await page.goto('/design');

    expect(tuneRequests).toEqual([]);
  });

  test('with ?tune on /design, panel appears with "Kolory" tab and live CSS changes work', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    await expect(panel.getByText('Kolory')).toBeVisible();

    const kalkaInput = panel.getByRole('textbox', { name: 'kalka', exact: true }).first();
    await kalkaInput.fill('#112233');
    await kalkaInput.press('Enter');

    const cssKalka = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--kalka'),
    );
    expect(cssKalka).toBe('#112233');
  });

  test('Kopiuj JSON copies only changed values via diffTokens in config/tokens.json structure', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const korektaInput = panel.getByRole('textbox', { name: 'korekta', exact: true }).first();
    await expect(korektaInput).toBeVisible();

    await korektaInput.fill('#00ff00');
    await korektaInput.press('Enter');

    await panel.getByRole('button', { name: 'Kopiuj JSON' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const parsedJson = JSON.parse(clipboardText);

    expect(parsedJson).toEqual({
      color: {
        light: {
          korekta: '#00ff00',
        },
      },
    });
  });

  test('Przywróć resets modified tokens back to config defaults', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const kalkaInput = panel.getByRole('textbox', { name: 'kalka', exact: true }).first();
    await kalkaInput.fill('#990000');
    await kalkaInput.press('Enter');

    let cssKalka = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--kalka'),
    );
    expect(cssKalka).toBe('#990000');

    await panel.getByRole('button', { name: 'Przywróć' }).click();

    cssKalka = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--kalka'),
    );
    expect(cssKalka).toBe('#EEF1EF');
  });

  test('panel does not obscure header and collapses with Escape key', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(72);

    await page.keyboard.press('Escape');

    const isExpanded = await page.evaluate(() => {
      const container = document.getElementById('tune-panel-container');
      const rotv = container?.querySelector('.tp-rotv');
      return rotv?.classList.contains('tp-rotv-expanded') ?? false;
    });
    expect(isExpanded).toBe(false);
  });

  test('non-persistence: reloading without ?tune removes panel and leaves no trace of changes', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const kalkaInput = panel.getByRole('textbox', { name: 'kalka', exact: true }).first();
    await kalkaInput.fill('#AABBCC');
    await kalkaInput.press('Enter');

    await page.goto('/design');

    await expect(page.locator('#tune-panel-container')).not.toBeVisible();

    const cssKalkaInline = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--kalka'),
    );
    expect(cssKalkaInline).toBe('');
  });

  test('axe accessibility scan passes on /design?tune in light and dark mode', async ({ page }) => {
    await page.goto('/design?tune');

    const lightResults = await new AxeBuilder({ page }).analyze();
    expect(lightResults.violations).toEqual([]);

    await page.click('#theme-toggle');
    const darkResults = await new AxeBuilder({ page }).analyze();
    expect(darkResults.violations).toEqual([]);
  });
});
