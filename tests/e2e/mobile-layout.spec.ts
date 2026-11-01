import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Mobile Layout & Fullscreen Map (@S15)', () => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
  ];

  for (const { width, height } of viewports) {
    test(`map occupies >= 75% of window height, indicator panel is not above map, bottom bar is visible at ${width}x${height} (@S15)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });

      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

      const header = page.locator('header').first();
      const map = page.locator('[aria-label="Mapa Polski"]').first();
      const bottomBar = page.locator('[data-slot="mobile-indicator-bar"]');

      await expect(header).toBeVisible();
      await expect(map).toBeVisible();
      await expect(bottomBar).toBeVisible();

      const headerBox = await header.boundingBox();
      const mapBox = await map.boundingBox();
      const barBox = await bottomBar.boundingBox();

      expect(headerBox).not.toBeNull();
      expect(mapBox).not.toBeNull();
      expect(barBox).not.toBeNull();

      if (headerBox && mapBox && barBox) {
        // Nagłówek <= 56 px
        expect(headerBox.height).toBeLessThanOrEqual(56);

        // Panel wskaźnika nie jest renderowany nad mapą (mapa zaczyna się bezpośrednio pod nagłówkiem)
        expect(mapBox.y).toBeLessThanOrEqual(headerBox.y + headerBox.height + 2);

        // Mapa zajmuje >= 75% wysokości okna
        expect(mapBox.height / height).toBeGreaterThanOrEqual(0.75);

        // Dolny pasek wskaźnika ma wysokość >= 48 px i znajduje się pod mapą
        expect(barBox.height).toBeGreaterThanOrEqual(48);
        expect(barBox.y).toBeGreaterThanOrEqual(mapBox.y + mapBox.height - 2);
      }

      // Pasek pokazuje nazwę bieżącego wskaźnika, rok oraz 5 kolorów legendy
      await expect(bottomBar).toContainText('Gęstość zaludnienia');
      await expect(bottomBar).toContainText(/\d{4}/);
      const swatches = bottomBar.locator('[data-slot="legend-swatch"]');
      await expect(swatches).toHaveCount(5);

      // Brak poziomego przewijania
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`only one Back ("Wróć") button is visible above the map and 3-level breadcrumbs fit at ${width}x${height} (@S15)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });

      // 3 poziomy zagłębienia (województwo -> powiat -> gmina)
      await page.goto('/?u=0201011&e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      // Nad mapą widoczny jest tylko jeden przycisk "Wróć" (w okruszkach, osobny BackButton jest ukryty)
      const backButtons = page.locator('[aria-label="Mapa Polski"] button:visible', {
        hasText: /Wróć/,
      });
      await expect(backButtons).toHaveCount(0);

      const ariaBackButtons = page.locator(
        '[aria-label="Mapa Polski"] button[aria-label="Wróć"]:visible'
      );
      await expect(ariaBackButtons).toHaveCount(1);

      const nav = page.locator('nav[aria-label="Ścieżka"]');
      await expect(nav).toBeVisible();
      const navBox = await nav.boundingBox();
      expect(navBox).not.toBeNull();
      if (navBox) {
        expect(navBox.height).toBeLessThanOrEqual(48);
        expect(navBox.x + navBox.width).toBeLessThanOrEqual(width + 1);
      }

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('passes axe accessibility audit on mobile layout (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
