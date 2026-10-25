import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Full Mobile Path Flow (@S15)', () => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
  ];

  for (const viewport of viewports) {
    test(`full path on ${viewport.width}x${viewport.height} (@S15)`, async ({ page }) => {
      test.setTimeout(90000);

      const profileRequests: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (url.includes('/data/profiles/')) {
          profileRequests.push(url);
        }
      });

      await page.setViewportSize(viewport);

      // Dismiss consent bar via pre-set localStorage
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });

      // 1. Start -> Go to home page
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

      // Check no horizontal scroll at start
      let isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // 2. Pasek -> Zmiana wskaźnika
      const pickerTrigger = page.getByRole('button', { name: /wskaźnik/i }).first();
      await expect(pickerTrigger).toBeVisible();
      await pickerTrigger.click();

      // Select another indicator in popover
      const targetOption = page.getByRole('option', { name: /Stopa bezrobocia/i }).first();
      await expect(targetOption).toBeVisible();
      await targetOption.click();

      await page.waitForFunction(
        () => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate'
      );

      // Check no horizontal scroll after indicator change
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // 3. Dotknięcie województwa -> Dymek
      const canvas = page.locator('.maplibregl-canvas');
      await expect(canvas).toBeVisible();
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();
      if (!canvasBox) return;

      const tapX = Math.round(canvasBox.width / 2);
      const tapY = Math.round(canvasBox.height * 0.35);

      await canvas.click({ position: { x: tapX, y: tapY } });

      const dymek = page.locator('[role="status"]', { hasText: 'Otwórz profil' });
      await expect(dymek).toBeVisible();

      // Verify ?u= not set yet
      let urlSearch = await page.evaluate(() => window.location.search);
      expect(urlSearch).not.toContain('u=');

      // Check no horizontal scroll after dymek
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // 4. Profil 40%
      const reqCountBeforeVoivodeship = profileRequests.length;

      const openProfileBtn = page.getByRole('button', { name: 'Otwórz profil' });
      await expect(openProfileBtn).toBeVisible();
      await openProfileBtn.click();

      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      urlSearch = await page.evaluate(() => window.location.search);
      expect(urlSearch).toContain('u=');

      // Exactly 1 profiles/* request for this selection
      expect(profileRequests.length - reqCountBeforeVoivodeship).toBe(1);

      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();

      // Check sheet height at ~40%
      await page.waitForFunction(() => {
        const el = document.querySelector('[role="dialog"]');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const visibleRatio = (window.innerHeight - rect.y) / window.innerHeight;
        return visibleRatio >= 0.30 && visibleRatio <= 0.50;
      });

      // DOM check: no "undefined" or "NaN"
      let bodyText = await sheet.innerText();
      expect(bodyText).not.toContain('undefined');
      expect(bodyText).not.toContain('NaN');

      // Check no horizontal scroll with profile open
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // 5. Pełna wysokość -> Drag handle
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

      // Check full height (>= 85%)
      const sheetBox = await sheet.boundingBox();
      expect(sheetBox).not.toBeNull();
      if (sheetBox) {
        const visibleRatio = (viewport.height - sheetBox.y) / viewport.height;
        expect(visibleRatio).toBeGreaterThanOrEqual(0.85);
      }

      // 6. „Powiaty (n)” tab
      const powiatyTab = page.getByRole('tab', { name: /Powiaty \(\d+\)/ });
      await expect(powiatyTab).toBeVisible();
      await powiatyTab.click();
      await expect(powiatyTab).toHaveAttribute('aria-selected', 'true');

      // Check no horizontal scroll
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // 7. Klik w powiat
      const childUnitBtn = page.locator('[data-slot="child-unit-button"]').first();
      await expect(childUnitBtn).toBeVisible();

      const initialSelected = await page.evaluate(() => (window as any).__atlas?.selected);
      const reqCountBeforeChildUnit = profileRequests.length;

      await childUnitBtn.click();

      // Wait for selection to update to county
      await page.waitForFunction(
        (prev) =>
          (window as any).__atlas?.selected !== prev &&
          (window as any).__atlas?.profileOpen === true,
        initialSelected,
        { timeout: 15000 }
      );

      // 1 profiles/* request for new selection (0 if cached)
      expect(profileRequests.length - reqCountBeforeChildUnit).toBeLessThanOrEqual(1);

      // Check header updated
      const sheetHeader = sheet.locator('h2');
      await expect(sheetHeader).toBeVisible();
      const headerText = await sheetHeader.textContent();
      expect(headerText?.toLowerCase()).toContain('powiat');

      // Overview tab auto-selected
      const overviewTab = sheet.getByRole('tab', { name: 'Przegląd' });
      await expect(overviewTab).toBeVisible();
      await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

      // DOM check: no "undefined" or "NaN"
      bodyText = await sheet.innerText();
      expect(bodyText).not.toContain('undefined');
      expect(bodyText).not.toContain('NaN');

      // Check no horizontal scroll
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);

      // Check touch target sizes >= 44px
      const closeBtn = sheet.locator('button[aria-label="Zamknij"]').first();
      await expect(closeBtn).toBeVisible();
      const closeBtnBox = await closeBtn.boundingBox();
      expect(closeBtnBox).not.toBeNull();
      if (closeBtnBox) {
        expect(closeBtnBox.width).toBeGreaterThanOrEqual(44);
        expect(closeBtnBox.height).toBeGreaterThanOrEqual(44);
      }

      // Check at most 1 red annotation
      const annotations = page.locator('.rough-annotation');
      const annotationCount = await annotations.count();
      expect(annotationCount).toBeLessThanOrEqual(1);

      // 8. Klik w × (Zamknięcie)
      await closeBtn.click();

      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);

      urlSearch = await page.evaluate(() => window.location.search);
      expect(urlSearch).not.toContain('u=');

      // Final check no horizontal scroll
      isNotHorizontallyScrollable = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(isNotHorizontallyScrollable).toBe(true);
    });
  }

  test('passes axe accessibility scan on mobile (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('respects prefers-reduced-motion on mobile (@S15)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();
  });
});
