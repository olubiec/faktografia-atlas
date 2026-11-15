import { test, expect, type Page } from '@playwright/test';

// Wymaganie PRODUKT §5: na telefonie mapa zostaje widoczna nad arkuszem.
const SIZES = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
];

async function waitReady(page: Page) {
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

for (const size of SIZES) {
  test.describe(`Mapa nad arkuszem ${size.width}x${size.height} (@S15)`, () => {
    test.use({ viewport: size });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });
    });

    test('nagłówek ma najwyżej 56 px (@S15)', async ({ page }) => {
      await page.goto('/?e2e');
      await waitReady(page);
      const box = await page.locator('header').first().boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeLessThanOrEqual(56);
    });

    test('arkusz wskaźnika zaczyna się nie wyżej niż 35% okna (@S15)', async ({ page }) => {
      await page.goto('/?e2e');
      await waitReady(page);
      await page.locator('[data-slot="mobile-indicator-bar"] button').first().click();
      const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
      await expect(sheet).toBeVisible();
      await expect
        .poll(async () => (await sheet.boundingBox())?.y ?? 0)
        .toBeGreaterThanOrEqual(size.height * 0.35);
    });

    test('arkusz profilu zaczyna się nie wyżej niż 35%, bez poziomego przewijania, bez arkusza wskaźnika (@S15)', async ({
      page,
    }) => {
      await page.goto('/?e2e&u=12');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      const sheet = page.locator('[role="dialog"][aria-label="Województwo małopolskie"]');
      await expect(sheet).toBeVisible({ timeout: 20_000 });
      await expect
        .poll(async () => (await sheet.boundingBox())?.y ?? 0)
        .toBeGreaterThanOrEqual(size.height * 0.35);
      const noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noOverflow).toBe(true);
      await expect(page.getByRole('dialog', { name: 'Panel wskaźnika' })).toHaveCount(0);
    });
  });
}
