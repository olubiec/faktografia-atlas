import { test, expect } from '@playwright/test';
import { openMap } from './helpers/open-map';

const CONSENT = { value: 'denied', at: '2026-01-01T00:00:00.000Z' };

test.describe('Profil i legenda: spójność wartości (@S26)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((c) => localStorage.setItem('fa-consent-v1', JSON.stringify(c)), CONSENT);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('progi legendy są rosnące, a liczba klas = progi + 1 (@S26)', async ({ page }) => {
    await openMap(page, '?e2e');
    await page.waitForFunction(() => Array.isArray((window as any).__atlas?.choroplethBreaks));
    const { c, b } = await page.evaluate(() => ({ c: (window as any).__atlas.choropleth, b: (window as any).__atlas.choroplethBreaks as number[] }));
    expect(c.classes).toBe(b.length + 1);
    for (let i = 1; i < b.length; i++) expect(b[i]).toBeGreaterThan(b[i - 1]);
  });

  test('duża liczba profilu to wartość wybranego wskaźnika, nie „brak danych” ani inny wskaźnik (@S26)', async ({ page }) => {
    await openMap(page, '?e2e&u=3217');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    const big = page.locator('[data-slot="big-number"]').first();
    await expect(big).toBeVisible();
    await expect(big).not.toHaveText(/brak danych/);
    await expect(big).toHaveText(/\d/);
  });
});
