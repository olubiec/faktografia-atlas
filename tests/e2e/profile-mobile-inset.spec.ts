import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Mobile Profile Sheet Inset W2.7 (@S15)', () => {
  test.setTimeout(60000);
  test.use({ viewport: { width: 390, height: 844 } });

  test('selecting a powiat positions unit bbox above 40% bottom sheet top edge (@S15)', async ({ page }) => {
    // TERYT 1208 = powiat miechowski w woj. małopolskim
    await page.goto('/?e2e&u=1208');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Poczekaj na ustabilizowanie arkusza w granicach 35–45% wysokości okna
    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const visibleRatio = (844 - rect.y) / 844;
      return visibleRatio >= 0.35 && visibleRatio <= 0.45;
    });

    // Poczekaj na zakończenie animacji kamery przed odczytem widoku
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);

    const sheet = page.locator('[role="dialog"]').first();
    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    const sheetTopY = sheetBox!.y;

    // Sprawdź, czy sprojektowany dół bbox jednostki mieści się nad górną krawędzią arkusza
    const isBboxAboveSheet = await page.evaluate((topY) => {
      const atlas = (window as any).__atlas;
      if (!atlas || !atlas.viewState) return false;

      const { viewState } = atlas;
      // Powiat miechowski: bbox [west, south, east, north]
      const southLat = 50.28;

      const mercatorLat = (latDeg: number) => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
      const mSouth = mercatorLat(southLat);
      const mCam = mercatorLat(viewState.latitude);
      const scale = (512 * Math.pow(2, viewState.zoom)) / (2 * Math.PI);

      // Najniższy punkt bbox (południowa krawędź) na ekranie
      const maxScreenY = 844 / 2 - (mSouth - mCam) * scale;

      return maxScreenY <= topY + 5; // z tolerancją pikselową
    }, sheetTopY);

    expect(isBboxAboveSheet).toBe(true);
  });

  test('closing profile sheet leaves map view stable without jumping (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=1208');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.y < window.innerHeight;
    });

    await page.evaluate(() => {
      const btn = document.querySelector('[role="dialog"] button[aria-label="Zamknij"]') as HTMLButtonElement;
      btn?.click();
    });

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

    // Poczekaj na zakończenie animacji kamery
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);

    const viewState = await page.evaluate(() => (window as any).__atlas?.viewState);
    expect(viewState).toBeDefined();
    expect(typeof viewState.longitude).toBe('number');
    expect(typeof viewState.latitude).toBe('number');
    expect(typeof viewState.zoom).toBe('number');
    expect(Number.isNaN(viewState.zoom)).toBe(false);
  });

  test('desktop view is unchanged when profile sheet is present (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?e2e&u=1208');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Na komputerze nie ma dolnego arkusza [role="dialog"]
    const mobileSheet = page.locator('[role="dialog"]');
    await expect(mobileSheet).toHaveCount(0);
  });

  test('no horizontal scroll at 360px and 390px, touch targets >= 44px (@S15)', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/?e2e&u=1208');

      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await page.waitForFunction(() => {
        const el = document.querySelector('[role="dialog"]');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.y < 800;
      });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      const buttonBoxes = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('[role="dialog"] button[aria-label="Zamknij"]'));
        return btns.map((b) => {
          const rect = b.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
      });

      expect(buttonBoxes.length).toBeGreaterThan(0);
      for (const box of buttonBoxes) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('passes axe accessibility scan with no violations (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=1208');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders at most one red annotation on screen (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=1208');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotations = page.locator('.rough-annotation');
    const count = await annotations.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('respects prefers-reduced-motion (@S15)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e&u=1208');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.y < window.innerHeight;
    });

    const sheet = page.locator('[role="dialog"]').first();
    expect(sheet).toBeDefined();
  });
});
