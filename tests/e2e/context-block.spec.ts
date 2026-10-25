import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const explanationsFixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/explanations.json'), 'utf-8')
);

test.describe('ContextBlock "Na tle kraju" Desktop @S17', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.route('**/data/explanations.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(explanationsFixture),
      });
    });
  });

  test('powiat profile row expansion displays "wyżej niż ... % powiatów" text matching context()', async ({
    page,
  }) => {
    // TERYT 1217 to powiat tatrzański
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await expect(rowButton).toBeVisible();
    await rowButton.click();

    // Sprawdzenie obecności bloków "Na tle kraju" w arkuszu profilu
    const contextBlock = profileSheet.locator('[data-slot="context-block"]');
    await expect(contextBlock).toBeVisible();

    const contextHeader = contextBlock.locator('text="Na tle kraju"');
    await expect(contextHeader).toBeVisible();

    const percentText = contextBlock.locator('text=/wyżej niż \\d+% powiatów/').first();
    await expect(percentText).toBeVisible();

    const medianText = contextBlock.locator('text=/Mediana Polski:/');
    await expect(medianText).toBeVisible();
  });

  test('indicator without explanation displays context block without errors', async ({ page }) => {
    // Fikstura pustych objaśnień
    await page.route('**/data/explanations.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await rowButton.click();

    const contextBlock = profileSheet.locator('[data-slot="context-block"]');
    await expect(contextBlock).toBeVisible();

    const contextHeader = contextBlock.locator('text="Na tle kraju"');
    await expect(contextHeader).toBeVisible();

    // Brak sekcji "Co to jest"
    const shortText = contextBlock.locator('text="Co to jest"');
    await expect(shortText).not.toBeVisible();
  });

  test('clicking "najwyżej" unit selects that unit', async ({ page }) => {
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
    const topButton = panel.locator('[data-slot="context-block"]').getByRole('button', { name: /Warszawa/i });
    await expect(topButton).toBeVisible();
    await topButton.dispatchEvent('click');

    await page.waitForFunction(() => !window.location.search.includes('u=1217'));
    const url = await page.evaluate(() => window.location.search);
    expect(url).toContain('u=');
  });

  test('zero extra requests beyond explanations.json (once)', async ({ page }) => {
    let explanationsCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/data/explanations.json')) {
        explanationsCount++;
      }
    });

    await page.goto('/?e2e&u=1217');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await rowButton.click();

    expect(explanationsCount).toBeLessThanOrEqual(1);
  });
});

test.describe('ContextBlock "Na tle kraju" Mobile @S17', () => {
  test.setTimeout(60000);
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.route('**/data/explanations.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(explanationsFixture),
      });
    });
  });

  test('no axe accessibility errors and no horizontal overflow on mobile viewport', async ({ page }) => {
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.y < window.innerHeight;
    });

    const sheet = page.locator('[role="dialog"]').first();

    const rowButton = sheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    }).first();

    await rowButton.click();

    const contextBlock = sheet.locator('[data-slot="context-block"]').first();
    await expect(contextBlock).toBeVisible({ timeout: 10000 });

    // Sprawdzenie braku przewijania poziomego
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Sprawdzenie dostępności axe
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);
  });
});
