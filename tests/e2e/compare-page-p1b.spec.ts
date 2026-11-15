import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '1280', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`P1-B strona Porównaj ${vp.name} @S18`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
    });

    test(`P1-B stan pusty: 3 pary i 2 pola >= 44 px, bez przewijania w poziomie (${vp.name}) @S18`, async ({ page }) => {
      await page.goto('/porownaj');
      const pairs = page.locator('[data-slot="compare-pair"]');
      await expect(pairs).toHaveCount(3);
      const boxes = [...(await pairs.all()), ...(await page.locator('select').all())];
      expect(boxes).toHaveLength(5);
      for (const el of boxes) {
        const box = await el.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      await expect(page.getByLabel('Miejsce A')).toBeVisible();
      await expect(page.getByLabel('Miejsce B')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`P1-B wynik: klik w parę pokazuje wiersze z diffText, bez przewijania i ucięć (${vp.name}) @S18`, async ({ page }) => {
      await page.goto('/porownaj');
      await page.locator('[data-slot="compare-pair"]').first().click();
      await expect(page).toHaveURL(/c=14(%2C|,)12/);
      const rows = page.locator('[data-slot="compare-row"]');
      await expect(rows.first()).toBeVisible({ timeout: 20000 });
      expect(await rows.count()).toBeGreaterThan(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      // Napisy w wierszach nie są ucinane
      const clipped = await rows.evaluateAll((els) =>
        els.flatMap((r) => [...r.querySelectorAll<HTMLElement>('*')])
          .filter((n) => n.children.length === 0 && n.scrollWidth > n.clientWidth + 1)
          .map((n) => n.textContent),
      );
      expect(clipped).toEqual([]);
    });
  });
}

test('P1-B wybór dwóch miejsc z pól ustawia ?c= @S18', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/porownaj');
  await page.getByLabel('Miejsce A').selectOption('14');
  await page.getByLabel('Miejsce B').selectOption('12');
  await expect(page).toHaveURL(/c=14(%2C|,)12/);
});
