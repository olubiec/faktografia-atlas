import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Link „Porównaj z sąsiadem” prowadzi na /mapa?c=a,b (bez ?u=). Ma otworzyć profil z porównaniem obu miejsc.
const CONSENT = { value: 'denied', at: '2026-01-01T00:00:00.000Z' };

async function expectComparison(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
  const table = page.locator('[data-slot="compare-table"]').first();
  await expect(table).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-slot="compare-maps"]').first()).toBeVisible();
  // obie jednostki w tabeli i co najmniej jeden wiersz wskaźnika
  await expect(page.locator('[data-slot="compare-row"]').first()).toBeVisible();
  await expect(table).toContainText(/sławieński/i);
  await expect(table).toContainText(/stargardzki/i);
}

test.describe('Porównaj z sąsiadem: link /mapa?c=a,b pokazuje porównanie (@S18)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((c) => localStorage.setItem('fa-consent-v1', JSON.stringify(c)), CONSENT);
  });

  test('na komputerze (1440x900) otwiera profil z tabelą porównania (@S18)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e=1&c=3213,3214');
    await expectComparison(page);
    expect(await page.evaluate(() => (window as any).__atlas?.selected)).toBe('3213,3214');
  });

  test.describe('telefon (360x740)', () => {

    test('na telefonie otwiera profil z tabelą porównania, a nie samą mapę (@S18)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await openMap(page, '?e2e=1&c=3213,3214');
      await expectComparison(page);
    });
  });
});
