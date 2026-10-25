import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
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
        year: 2025,
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

const FORMAT_SPECS = [
  { buttonName: 'Post (4:5)', width: 1080, height: 1350 },
  { buttonName: 'Kwadrat (1:1)', width: 1080, height: 1080 },
  { buttonName: 'Story (9:16)', width: 1080, height: 1920 },
  { buttonName: 'Poziomy (16:9)', width: 1600, height: 900 },
];

test.describe('Test całej ścieżki Pobierz i udostępnij W2.23 (@S19)', () => {
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

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  test('@S19 pełna ścieżka udostępniania na komputerze i telefonie: mapa -> 4 formaty PNG -> profil -> CSV -> porównanie -> CSV (3x z rzędu)', async ({
    page,
  }) => {
    test.setTimeout(120000);

    for (let iteration = 1; iteration <= 3; iteration++) {
      // -------------------------------------------------------------
      // 1. ŚCIEŻKA MAPY (1440x900 oraz 390x844)
      // -------------------------------------------------------------
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto('/?e2e=1&i=density&l=pow');

        const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
        await expect(panel).toBeVisible({ timeout: 15000 });

        // Track data/geo requests after opening share dialog
        const networkRequests: string[] = [];
        const onRequest = (req: any) => {
          networkRequests.push(new URL(req.url()).pathname);
        };
        page.on('request', onRequest);

        const shareMapBtn = panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' });
        await expect(shareMapBtn).toBeVisible();
        await shareMapBtn.click();

        const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
        await expect(dialog).toBeVisible();

        // Check zero network requests to /data/ or /geo/ after opening modal
        const dataGeoRequests = networkRequests.filter(
          (p) => p.startsWith('/data/') || p.startsWith('/geo/')
        );
        expect(dataGeoRequests.length).toBe(0);
        page.off('request', onRequest);

        // Check preview text has no "undefined" or "NaN"
        const svgPreview = page.getByRole('img', { name: 'Podgląd karty' });
        await expect(svgPreview).toBeVisible();
        const previewText = (await svgPreview.textContent()) ?? '';
        expect(previewText).not.toContain('undefined');
        expect(previewText).not.toContain('NaN');

        // Test PNG generation for all 4 share formats
        for (const fmt of FORMAT_SPECS) {
          await page.getByRole('button', { name: fmt.buttonName }).click();

          const pngDownloadPromise = page.waitForEvent('download');
          await page.getByRole('button', { name: 'Pobierz obraz' }).click();
          const pngDownload = await pngDownloadPromise;
          expect(pngDownload.suggestedFilename()).toMatch(/\.png$/);

          const pngPath = await pngDownload.path();
          expect(pngPath).not.toBeNull();
          const pngBuffer = fs.readFileSync(pngPath!);

          // Verify PNG signature (89 50 4E 47 0D 0A 1A 0A)
          expect(pngBuffer.subarray(0, 8)).toEqual(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
          );

          // Verify exact width and height from PNG IHDR chunk
          const pngWidth = pngBuffer.readUInt32BE(16);
          const pngHeight = pngBuffer.readUInt32BE(20);
          expect(pngWidth).toBe(fmt.width);
          expect(pngHeight).toBe(fmt.height);
        }

        // Close dialog
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
      }

      // -------------------------------------------------------------
      // 2. ŚCIEŻKA PROFILU (?u=3217)
      // -------------------------------------------------------------
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/?e2e=1&u=3217');

      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const profileHeading = page.locator('h2', { hasText: 'Powiat wałecki' }).first();
      await expect(profileHeading).toBeVisible();

      const profileNetworkRequests: string[] = [];
      const onProfileReq = (req: any) => {
        profileNetworkRequests.push(new URL(req.url()).pathname);
      };
      page.on('request', onProfileReq);

      // Target exact profile "Pobierz i udostępnij" button
      const shareProfileBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
      await expect(shareProfileBtn).toBeVisible();
      await shareProfileBtn.click();

      const profileDialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(profileDialog).toBeVisible();

      // Zero new network requests
      const profileDataGeoReqs = profileNetworkRequests.filter(
        (p) => p.startsWith('/data/') || p.startsWith('/geo/')
      );
      expect(profileDataGeoReqs.length).toBe(0);
      page.off('request', onProfileReq);

      // Check card preview
      const profileSvgPreview = page.getByRole('img', { name: 'Podgląd karty' });
      await expect(profileSvgPreview).toBeVisible();
      await expect(profileSvgPreview).toContainText('Powiat wałecki');
      const profPreviewText = (await profileSvgPreview.textContent()) ?? '';
      expect(profPreviewText).not.toContain('undefined');
      expect(profPreviewText).not.toContain('NaN');

      // Download CSV
      const profileCsvPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
      const profileCsvDownload = await profileCsvPromise;
      expect(profileCsvDownload.suggestedFilename()).toMatch(/\.csv$/);

      const profileCsvPath = await profileCsvDownload.path();
      expect(profileCsvPath).not.toBeNull();
      const profileCsvText = fs.readFileSync(profileCsvPath!, 'utf-8');
      expect(profileCsvText.startsWith('\uFEFF')).toBe(true);
      expect(profileCsvText).toContain(';');
      expect(profileCsvText).toContain('Powiat wałecki');

      await page.keyboard.press('Escape');
      await expect(profileDialog).not.toBeVisible();

      // -------------------------------------------------------------
      // 3. ŚCIEŻKA PORÓWNANIA (ProfileCompare)
      // -------------------------------------------------------------
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

      await renderCompareInPage(page, profileA, profileB);

      const compareNetworkRequests: string[] = [];
      const onCompareReq = (req: any) => {
        compareNetworkRequests.push(new URL(req.url()).pathname);
      };
      page.on('request', onCompareReq);

      const shareCompareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
      await expect(shareCompareBtn).toBeVisible();
      await shareCompareBtn.click();

      const compareDialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(compareDialog).toBeVisible();

      // Zero new network requests
      const compareDataGeoReqs = compareNetworkRequests.filter(
        (p) => p.startsWith('/data/') || p.startsWith('/geo/')
      );
      expect(compareDataGeoReqs.length).toBe(0);
      page.off('request', onCompareReq);

      // Check card preview
      const compareSvgPreview = page.getByRole('img', { name: 'Podgląd karty' });
      await expect(compareSvgPreview).toBeVisible();
      await expect(compareSvgPreview).toContainText('Województwo małopolskie');
      // Verify compare card preview contains comparison content
      const compPreviewText = (await compareSvgPreview.textContent()) ?? '';
      expect(compPreviewText).not.toContain('undefined');
      expect(compPreviewText).not.toContain('NaN');

      // Download comparison CSV
      const compareCsvPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Pobierz dane (CSV)' }).click();
      const compareCsvDownload = await compareCsvPromise;
      expect(compareCsvDownload.suggestedFilename()).toMatch(/\.csv$/);

      const compareCsvPath = await compareCsvDownload.path();
      expect(compareCsvPath).not.toBeNull();
      const compareCsvText = fs.readFileSync(compareCsvPath!, 'utf-8');
      expect(compareCsvText.startsWith('\uFEFF')).toBe(true);
      expect(compareCsvText).toContain(';');
      expect(compareCsvText).toContain('Województwo małopolskie');
      expect(compareCsvText).toContain('Województwo śląskie');

      await page.keyboard.press('Escape');
      await expect(compareDialog).not.toBeVisible();
    }
  });

  test('@S19 wymogi responsywności, dotyku, dostępności, zakreśleń i reduced motion w okienku udostępniania', async ({
    page,
  }) => {
    test.setTimeout(60000);

    // 1. Sprawdzenie przy 360x740 i 390x844: brak poziomego przewijania, pola dotykowe >= 44px, axe ok
    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e=1&i=density');

      const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
      await expect(panel).toBeVisible({ timeout: 15000 });

      const shareBtn = panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' });
      await expect(shareBtn).toBeVisible();
      await shareBtn.click();

      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();

      // Brak poziomego przewijania
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // Pola dotykowe >= 44px
      const buttons = dialog.getByRole('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const box = await btn.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(43.5);
          expect(box.width).toBeGreaterThanOrEqual(43.5);
        }
      }

      // Dostępność Axe bez błędów w oknie dialogowym
      const accessibilityResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze();
      expect(accessibilityResults.violations).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }

    // 2. Reduced motion oraz ograniczenie do najwyżej 1 czerwonego zakreślenia na ekranie
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,24');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const shareCompareBtn = page.getByRole('button', { name: 'Pobierz i udostępnij', exact: true });
    await expect(shareCompareBtn).toBeVisible();
    await shareCompareBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    await expect(dialog).toBeVisible();

    const annotations = page.locator('.rough-annotation');
    const annotationCount = await annotations.count();
    expect(annotationCount).toBeLessThanOrEqual(1);
  });
});
