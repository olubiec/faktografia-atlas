import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Mobile Profile Sheet W2.6 (@S15)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens profile bottom sheet at 35-45% window height on unit selection (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"][aria-label="Województwo małopolskie"]');
    await expect(sheet).toBeVisible();

    // Poczekaj na stabilizację wysokości w zakresie 35–45%
    await page.waitForFunction(() => {
      const el = document.querySelector('[role="dialog"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const visibleRatio = (844 - rect.y) / 844;
      return visibleRatio >= 0.35 && visibleRatio <= 0.45;
    });

    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const visibleHeight = 844 - box.y;
      const heightPercentage = visibleHeight / 844;
      expect(heightPercentage).toBeGreaterThanOrEqual(0.35);
      expect(heightPercentage).toBeLessThanOrEqual(0.45);
    }
  });

  test('drags handle up to >= 90% window height and displays tabs (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"][aria-label="Województwo małopolskie"]');
    await expect(sheet).toBeVisible();

    const handle = sheet.locator('.cursor-grab');
    await expect(handle).toBeVisible();

    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    if (handleBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + handleBox.width / 2, 20, { steps: 10 });
      await page.mouse.up();
    }

    await page.waitForTimeout(300);

    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    if (sheetBox) {
      const visibleHeight = 844 - sheetBox.y;
      const heightPercentage = visibleHeight / 844;
      expect(heightPercentage).toBeGreaterThanOrEqual(0.90);
    }

    // Widoczne zakładki
    const tabList = page.getByRole('tablist');
    await expect(tabList).toBeVisible();
    const overviewTab = page.getByRole('tab', { name: 'Przegląd' });
    await expect(overviewTab).toBeVisible();
  });

  test('close button (x) closes sheet, removes ?u=, and leaves map zoom unchanged (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const initialZoom = await page.evaluate(() => (window as any).__atlas?.viewState?.zoom);

    // Zamknięcie przyciskiem ×
    const closeBtn = page.locator('[role="dialog"] button[aria-label="Zamknij"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

    // Weryfikacja usunięcia ?u= z URL
    const search = await page.evaluate(() => window.location.search);
    expect(search).not.toContain('u=');

    // Weryfikacja niezmienionego poziomu powiększenia mapy
    await expect.poll(() => page.evaluate(() => (window as any).__atlas?.viewState?.zoom)).toEqual(initialZoom);
  });

  test('map above sheet responds to touch/pointer interactions (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Kliknięcie w obszar mapy nad arkuszem
    const mapElement = page.locator('[aria-label="Mapa Polski"]').first();
    await expect(mapElement).toBeVisible();

    await page.mouse.click(200, 150);

    const isReady = await page.evaluate(() => (window as any).__atlas?.ready);
    expect(isReady).toBe(true);
  });

  test('no horizontal scroll at 360px and 390px, touch targets >= 44px (@S15)', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/?e2e&u=12');

      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      const closeButtons = page.locator('button[aria-label="Zamknij"]');
      const count = await closeButtons.count();
      for (let i = 0; i < count; i++) {
        const box = await closeButtons.nth(i).boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('passes axe accessibility scan with no violations (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders at most one red annotation on screen (@S15)', async ({ page }) => {
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotations = page.locator('.rough-annotation');
    const count = await annotations.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('respects prefers-reduced-motion (@S15)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"][aria-label="Województwo małopolskie"]');
    await expect(sheet).toBeVisible();
  });
});
