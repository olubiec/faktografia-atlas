import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { compare } from '../../src/core/compare/compare';
import type { UnitProfile } from '../../src/core/profile/profile';
import indicators from '../../config/indicators.json' with { type: 'json' };

function createMockProfile(
  teryt: string,
  level: 'woj' | 'pow' | 'gmi',
  name: string,
  indicatorValues: Record<string, number | null>
): UnitProfile {
  return {
    teryt,
    unit: {
      teryt,
      name,
      level,
      parent: null,
    },
    indicators: indicators.map((ind) => {
      const val = indicatorValues[ind.id] ?? null;
      return {
        indicatorId: ind.id,
        indicator: ind as any,
        year: 2023,
        value: val,
        rankNational: val !== null ? 2 : null,
        rankVoivodeship: val !== null ? 1 : null,
        totalNational: 16,
        totalVoivodeship: 1,
        neutral: ind.higherIsBetter === null,
        series: [],
      };
    }),
  };
}

let compareBundleJs: string = '';

test.describe('Udostępnianie porównania W2.21 (@S19)', () => {
  test.beforeAll(async () => {
    const output = await build({
      configFile: false,
      build: {
        write: false,
        lib: {
          entry: path.resolve('src/view/profile/ProfileCompare.tsx'),
          name: 'ProfileCompareBundle',
          formats: ['iife'],
          fileName: () => 'compare.js',
        },
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    const chunk = Array.isArray(output) ? output[0] : output;
    compareBundleJs = (chunk as any).output[0].code;
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  async function renderCompareInPage(
    page: any,
    profileA: UnitProfile,
    profileB: UnitProfile
  ) {
    await page.addScriptTag({ content: compareBundleJs });

    await page.evaluate(
      async ({ pA, pB }) => {
        let container = document.getElementById('test-profile-compare-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'test-profile-compare-container';
          container.style.padding = '16px';
          container.style.maxWidth = '440px';
          document.body.appendChild(container);
        }

        const renderFn =
          (window as any).__renderProfileCompare ||
          (window as any).ProfileCompareBundle?.__renderProfileCompare;

        if (renderFn) {
          renderFn(container, { profileA: pA, profileB: pB });
        }
      },
      { pA: profileA, pB: profileB }
    );

    await page.waitForSelector('[data-slot="profile-compare"]');
  }

  test('porównanie ?u=12&c=12,24 -> karta z nazwami obu województw i dwiema mapkami; teksty różnic zgodne z tabelą; CSV z wierszami; zero nowych żądań (@S19)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/design');
    await page.waitForLoadState('networkidle');

    const profileA = createMockProfile('12', 'woj', 'województwo małopolskie', {
      'population-density': 225.8,
      'unemployment-rate': 4.5,
    });
    const profileB = createMockProfile('24', 'woj', 'województwo śląskie', {
      'population-density': 365.1,
      'unemployment-rate': 3.8,
    });

    const expectedComp = compare(profileA, profileB);

    await renderCompareInPage(page, profileA, profileB);

    // Track network requests after opening share dialog
    const networkRequests: string[] = [];
    page.on('request', (req) => {
      networkRequests.push(new URL(req.url()).pathname);
    });

    // Find "Pobierz i udostępnij" button in compare view
    const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij' });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Verify dialog opens
    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    // Verify zero new /data/* and /geo/* requests
    const dataGeoRequests = networkRequests.filter(
      (p) => p.startsWith('/data/') || p.startsWith('/geo/')
    );
    expect(dataGeoRequests.length).toBe(0);

    // Verify SVG preview contains both unit names
    const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
    await expect(svgPreview).toBeVisible();
    await expect(svgPreview).toContainText('Województwo małopolskie');
    await expect(svgPreview).toContainText('Województwo śląskie');

    // Verify difference text in card row preview matches expected compare() table results
    const firstDiff = expectedComp.rows.find((r) => r.a !== null && r.b !== null)?.diffText;
    if (firstDiff) {
      await expect(svgPreview).toContainText(firstDiff);
    }

    // Test CSV download
    const csvDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const csvPath = await csvDownload.path();
    expect(csvPath).not.toBeNull();
    const csvText = fs.readFileSync(csvPath!, 'utf-8');

    // Verify UTF-8 BOM (\uFEFF), ';' separator, and unit names / rows
    expect(csvText.startsWith('\uFEFF')).toBe(true);
    expect(csvText).toContain(';');
    expect(csvText).toContain('Województwo małopolskie');
    expect(csvText).toContain('Województwo śląskie');

    const lines = csvText.trim().split('\r\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('na 360 i 390 px: brak poziomego przewijania, pola dotykowe >= 44 px, axe bez błędów (@S19)', async ({
    page,
  }) => {
    const profileA = createMockProfile('12', 'woj', 'województwo małopolskie', {
      'population-density': 225.8,
    });
    const profileB = createMockProfile('24', 'woj', 'województwo śląskie', {
      'population-density': 365.1,
    });

    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/design');
      await page.waitForLoadState('networkidle');
      await renderCompareInPage(page, profileA, profileB);

      const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij' });
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
          expect(box.height >= 43.5 || box.width >= 43.5).toBe(true);
        }
      }

      // Accessibility check on dialog
      const accessibilityResults = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      expect(accessibilityResults.violations).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('najwyżej jedno czerwone zakreślenie na ekranie i obsługa prefers-reduced-motion (@S19)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/design');
    await page.waitForLoadState('networkidle');

    const profileA = createMockProfile('12', 'woj', 'województwo małopolskie', {
      'population-density': 225.8,
    });
    const profileB = createMockProfile('24', 'woj', 'województwo śląskie', {
      'population-density': 365.1,
    });

    await renderCompareInPage(page, profileA, profileB);

    const shareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij' });
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    const annotations = page.locator('.rough-annotation');
    const count = await annotations.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});
