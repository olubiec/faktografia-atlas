import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalScroll,
  expectNoOverlapPairwise,
  expectTouchTargets,
} from './helpers/mobile-audit';

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Mobile UX Geometry (${vp.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
    });

    test('strona główna: brak poziomego scrolla i brak kolizji elementów pływających', async ({ page }) => {
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      await expectNoHorizontalScroll(page, `home-${vp.name}`);

      const header = page.locator('header').first();
      const indicatorBar = page.locator('[data-testid="mobile-indicator-bar"]').or(page.locator('button:has-text("Wskaźnik")')).first();

      const floaters = [
        { name: 'Header', locator: header },
        { name: 'IndicatorBar', locator: indicatorBar },
      ];

      await expectNoOverlapPairwise(floaters);
      await expectTouchTargets(page);
    });

    test('profil w arkuszu dolnym: brak kolizji z nagłówkiem i poprawne proporcje', async ({ page }) => {
      await page.goto('/?e2e&u=1217011');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      await expectNoHorizontalScroll(page, `profile-${vp.name}`);

      const header = page.locator('header').first();
      const sheet = page.locator('[role="dialog"]').first();
      await expect(sheet).toBeVisible();

      const floaters = [
        { name: 'Header', locator: header },
        { name: 'Sheet', locator: sheet },
      ];

      await expectNoOverlapPairwise(floaters);
    });

    test('biblioteka: brak poziomego przewijania i poprawne pola dotykowe', async ({ page }) => {
      await page.goto('/biblioteka');
      await page.waitForLoadState('domcontentloaded');

      await expectNoHorizontalScroll(page, `library-${vp.name}`);
      await expectTouchTargets(page);
    });
  });
}
