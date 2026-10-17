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

  test('tab Typografia exists with sliders (10-96 px) and changes font-size of .text-md element', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const typoTab = panel.getByRole('button', { name: 'Typografia' });
    await expect(typoTab).toBeVisible();
    await typoTab.click();

    const degrees = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    for (const deg of degrees) {
      const input = panel.locator(`input[aria-label="${deg}"]`);
      await expect(input).toBeVisible();
    }

    const mdInput = panel.locator('input[aria-label="md"]').first();
    await mdInput.fill('5');
    await mdInput.press('Enter');
    let cssMd = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--text-md'),
    );
    expect(cssMd).toBe('10px');

    await mdInput.fill('100');
    await mdInput.press('Enter');
    cssMd = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--text-md'),
    );
    expect(cssMd).toBe('96px');

    await mdInput.fill('22');
    await mdInput.press('Enter');

    cssMd = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--text-md'),
    );
    expect(cssMd).toBe('22px');

    const computedFontSize = await page.evaluate(() => {
      const elem = document.querySelector('.text-md');
      return elem ? window.getComputedStyle(elem).fontSize : null;
    });
    expect(computedFontSize).toBe('22px');
  });

  test('Kopiuj JSON from both tabs copies both color and typography changes', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const korektaInput = panel.getByRole('textbox', { name: 'korekta', exact: true }).first();
    await expect(korektaInput).toBeVisible();
    await korektaInput.fill('#00ff00');
    await korektaInput.press('Enter');

    await panel.getByRole('button', { name: 'Typografia' }).click();

    const mdInput = panel.locator('input[aria-label="md"]').first();
    await mdInput.fill('22');
    await mdInput.press('Enter');

    await panel.getByRole('button', { name: 'Kopiuj JSON' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const parsedJson = JSON.parse(clipboardText);

    expect(parsedJson).toEqual({
      color: {
        light: {
          korekta: '#00ff00',
        },
      },
      font: {
        scale: {
          md: 22,
        },
      },
    });
  });

  test('Przywróć resets both colors and typography changes', async ({ page }) => {
    await page.goto('/design?tune');

    const panel = page.locator('#tune-panel-container');
    await expect(panel).toBeVisible();

    const korektaInput = panel.getByRole('textbox', { name: 'korekta', exact: true }).first();
    await korektaInput.fill('#00ff00');
    await korektaInput.press('Enter');

    await panel.getByRole('button', { name: 'Typografia' }).click();

    const mdInput = panel.locator('input[aria-label="md"]').first();
    await mdInput.fill('22');
    await mdInput.press('Enter');

    let cssKorekta = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--korekta'),
    );
    let cssMd = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--text-md'),
    );
    expect(cssKorekta).toBe('#00ff00');
    expect(cssMd).toBe('22px');

    await panel.getByRole('button', { name: 'Przywróć' }).click();

    cssKorekta = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--korekta'),
    );
    cssMd = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--text-md'),
    );
    expect(cssKorekta).toBe('#E3242B');
    expect(cssMd).toBe('20px');
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
