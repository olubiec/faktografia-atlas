import { test, expect } from '@playwright/test';
import sampleFixture from '../fixtures/prng/sample.json' with { type: 'json' };
import realUnits from '../../public/data/units.json' with { type: 'json' };
import { buildLocalities } from '../../scripts/geo/localities-parse.mjs';
import { openMap } from './helpers/open-map';

const mockLocalities = buildLocalities(sampleFixture.features, realUnits).localities;

test.describe('Localities Map Layer & Navigation (CC5.4b)', () => {
  test.beforeEach(async ({ page }) => {
    // Route localities.json to use fixture mock data
    await page.route('/data/localities.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLocalities),
      });
    });
  });

  test('loc-layer pojawia się w window.__atlas.layers od zoomu 8,5 i znika poniżej 8,0 (histereza)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Initial map zoom is ~5.5 (zoom < 8,5), so loc-layer should NOT be in layers
    const initialLayers = await page.evaluate(() => (window as any).__atlas.layers);
    expect(initialLayers).not.toContain('loc-layer');

    // Zoom in using keyboard '+' until zoom >= 8.5
    const mapContainer = page.locator('[aria-label="Mapa Polski"]');
    await mapContainer.focus();

    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('+');
      await page.waitForTimeout(250);
      const currentZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
      if (currentZoom >= 8.5) break;
    }

    const currentZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(currentZoom).toBeGreaterThanOrEqual(8.5);

    // Dane miejscowości (kilka MB) wczytują się po przekroczeniu progu, więc warstwa pojawia się z opóźnieniem.
    await page.waitForFunction(() => (window as any).__atlas.layers.includes('loc-layer'), undefined, { timeout: 30_000 });

    // Zoom out using '-' until zoom < 8
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('-');
      await page.waitForTimeout(250);
      const zoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
      if (zoom < 8) break;
    }

    await page.waitForFunction(() => !(window as any).__atlas.layers.includes('loc-layer'), undefined, { timeout: 10_000 });
  });

  test('wybór miejscowości w Ctrl+K ustawia ?u= na TERYT jej gminy i zbliża widok do punktu (zoom >= 11)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Open search modal via Ctrl+K
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    // Type "zakop" to find Zakopane locality
    await searchInput.fill('zakop');

    const localityGroup = page.locator('div[role="dialog"] [cmdk-group]').filter({ hasText: 'Miejscowości' });
    await expect(localityGroup).toBeVisible();

    const zakopaneItem = localityGroup.locator('[cmdk-item]', { hasText: 'Zakopane' }).first();
    await expect(zakopaneItem).toBeVisible();

    // Click on Zakopane locality item
    await zakopaneItem.click();

    // Wait for search dialog to close
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Verify URL parameter ?u= is set to gmina Zakopane TERYT (1217011)
    await expect(page).toHaveURL(/\?.*u=1217011/);

    // Verify window.__atlas state: selected = '1217011', viewState.zoom >= 11
    await page.waitForFunction(() => {
      const atlas = (window as any).__atlas;
      return atlas?.selected === '1217011' && atlas?.viewState?.zoom >= 11;
    });

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('1217011');
    expect(atlasState.viewState.zoom).toBeGreaterThanOrEqual(11);
    expect(atlasState.layers).toContain('loc-layer');
  });
});
