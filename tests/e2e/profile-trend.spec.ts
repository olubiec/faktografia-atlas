import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Profile Trend Text in Collapsed Row @S14', () => {
  test('county profile shows trend text in "Ludność ogółem" row and p.p. in % unit row', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Powiat tatrzański (1217)
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');

    // 1. Wiersz "Ludność ogółem"
    const popRowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Ludność ogółem',
    });
    await expect(popRowButton).toBeVisible();

    // Sprawdzenie tekstu trendu w zwiniętym wierszu (powinien pasować do wzorca ↗/↘/→ ... od)
    const trendTextElement = popRowButton.locator('span[aria-label]');
    await expect(trendTextElement).toBeVisible();

    const ariaLabel = await trendTextElement.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/(rośnie|maleje|bez zmian).*od \d{4}/);

    const visibleText = await trendTextElement.textContent();
    expect(visibleText).toMatch(/[↗↘→].*od \d{4}/);

    // 2. Wiersz z jednostką % (np. Stopa bezrobocia rejestrowanego)
    const unempRowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await expect(unempRowButton).toBeVisible();

    const unempTrend = unempRowButton.locator('span[aria-label]');
    await expect(unempTrend).toBeVisible();

    const unempText = await unempTrend.textContent();
    expect(unempText).toContain('p.p.');
  });

  test('collapsed row does not contain sparkline SVG, expanding row shows full TrendChart', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const popRowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Ludność ogółem',
    });

    // Zwinięty wiersz nie zawiera SVG w nagłówku przycisku
    const sparklineInHeader = popRowButton.locator('svg');
    await expect(sparklineInHeader).toHaveCount(1); // 1 to ikonka NavArrowDown

    // Rozwinięcie wiersza
    await popRowButton.click();
    await expect(popRowButton).toHaveAttribute('aria-expanded', 'true');

    // Wykres TrendChart (region) powinien być widoczny
    const chartRegion = profileSheet.locator('div[role="region"][aria-label*="Ludność ogółem"]');
    await expect(chartRegion).toBeVisible();
  });

  test('no axe accessibility errors on open profile with collapsed trend rows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
