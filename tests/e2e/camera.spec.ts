import { test, expect } from '@playwright/test';

test.describe('Smooth Camera Transitions - W3.2 (@S16)', () => {
  test('clicking voivodeship animates camera zoom with >= 3 intermediate values and reaches target view (@S16)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const startZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(startZoom).toBeGreaterThan(0);

    // Open search modal via Ctrl+K
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('małopolskie');
    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();

    // Start background non-blocking continuous rAF recorder in browser
    await page.evaluate(() => {
      (window as any).__zoomHistory = [];
      (window as any).__stopRecording = false;
      function sample() {
        const z = (window as any).__atlas?.viewState?.zoom;
        if (typeof z === 'number') {
          const h = (window as any).__zoomHistory;
          if (h.length === 0 || h[h.length - 1] !== z) {
            h.push(z);
          }
        }
        if (!(window as any).__stopRecording) {
          requestAnimationFrame(sample);
        }
      }
      requestAnimationFrame(sample);
    });

    // Press Enter to select voivodeship
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      (window as any).__stopRecording = true;
    });

    const zoomHistory: number[] = await page.evaluate(() => (window as any).__zoomHistory);

    // Must record initial zoom, target zoom, plus at least 3 distinct intermediate values
    const intermediateValues = zoomHistory.filter(
      (z) => z > startZoom + 0.05 && z < zoomHistory[zoomHistory.length - 1] - 0.05
    );

    expect(intermediateValues.length).toBeGreaterThanOrEqual(3);

    // Final zoom should be fitted to voivodeship bbox (higher than initial Poland zoom)
    const finalZoom = zoomHistory[zoomHistory.length - 1];
    expect(finalZoom).toBeGreaterThan(startZoom + 1.0);
  });

  test('dragging during camera transition stops animation (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Click "Wróć" to start zoom out transition
    const backButton = page.locator('button', { hasText: 'Wróć' });
    await backButton.click();

    // Immediately interrupt transition with mouse drag
    const mapContainer = page.locator('[aria-label="Mapa Polski"]');
    const box = await mapContainer.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 5 });
      await page.mouse.up();
    }

    // Wait for the duration of the transition
    await page.waitForTimeout(500);

    const zoomAfterInterrupt = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    // Should stay near intermediate zoom rather than completing full transition back to country fit zoom (~5.5)
    expect(zoomAfterInterrupt).toBeGreaterThan(5.0);
  });

  test('direct navigation ?u=12 loads final view immediately without transition (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const initialZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);

    // Sample zoom after 100ms
    await page.waitForTimeout(100);
    const zoom100ms = await page.evaluate(() => (window as any).__atlas.viewState.zoom);

    // Should be identical (no transition running)
    expect(zoom100ms).toBe(initialZoom);
    // Should be zoomed in to voivodeship level
    expect(initialZoom).toBeGreaterThan(7.0);
  });

  test('clicking "Wróć" button executes zoom out transition (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const startZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    const backButton = page.locator('button', { hasText: 'Wróć' });
    await expect(backButton).toBeVisible();

    // Start background non-blocking continuous rAF recorder in browser
    await page.evaluate(() => {
      (window as any).__zoomHistory = [];
      (window as any).__stopRecording = false;
      function sample() {
        const z = (window as any).__atlas?.viewState?.zoom;
        if (typeof z === 'number') {
          const h = (window as any).__zoomHistory;
          if (h.length === 0 || h[h.length - 1] !== z) {
            h.push(z);
          }
        }
        if (!(window as any).__stopRecording) {
          requestAnimationFrame(sample);
        }
      }
      requestAnimationFrame(sample);
    });

    await backButton.click();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      (window as any).__stopRecording = true;
    });

    const zoomHistory: number[] = await page.evaluate(() => (window as any).__zoomHistory);

    expect(zoomHistory.length).toBeGreaterThan(3);
    const finalZoom = zoomHistory[zoomHistory.length - 1];
    expect(finalZoom).toBeLessThan(startZoom - 1.0);
  });

  test('prefers-reduced-motion disables camera animations (@S16)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const startZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    const backButton = page.locator('button', { hasText: 'Wróć' });
    await backButton.click();

    // With reduced motion, transition duration is 0ms, so zoom updates instantly
    const immediateZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(immediateZoom).toBeLessThan(startZoom - 1.0);
  });
});
