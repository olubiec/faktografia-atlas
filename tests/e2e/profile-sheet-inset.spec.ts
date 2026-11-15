import { test, expect, type Page } from '@playwright/test';

// Margines mapy ma śledzić własny arkusz profilu, nie pierwsze okno w dokumencie.
const H = 844;

async function waitReady(page: Page) {
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

const readInset = (page: Page) => page.evaluate(() => (window as any).__atlas?.sheetInset as number);

/** Różnica między marginesem mapy a oczekiwanym (widoczna część arkusza, max 45%). */
async function insetError(page: Page, dialogSelector: string): Promise<number> {
  const box = await page.locator(dialogSelector).first().boundingBox();
  if (!box) return Number.POSITIVE_INFINITY;
  const expected = Math.min(H - box.y, Math.round(0.45 * H));
  const inset = await readInset(page);
  return Math.abs(inset - expected);
}

const PROFILE_DIALOG = '[role="dialog"]:not([aria-label="Panel wskaźnika"])';

test.describe('Margines mapy a arkusz profilu (@S15)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  test.describe('telefon 390x844', () => {
    test.use({ viewport: { width: 390, height: H } });

    async function openFromIndicatorList(page: Page) {
      await page.goto('/?e2e');
      await waitReady(page);
      await page.locator('[data-slot="mobile-indicator-bar"] button').first().click();
      const panel = page.getByRole('dialog', { name: 'Panel wskaźnika' });
      await expect(panel).toBeVisible();
      const first = panel.getByRole('list', { name: 'Najwyżej' }).getByRole('button').first();
      await first.scrollIntoViewIfNeeded();
      await first.click();
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await expect(panel).toHaveCount(0);
    }

    test('profil otwarty z listy w arkuszu wskaźnika: margines = własny arkusz (@S15)', async ({ page }) => {
      await openFromIndicatorList(page);
      await expect.poll(() => insetError(page, PROFILE_DIALOG), { timeout: 30_000 }).toBeLessThanOrEqual(8);
      expect(await readInset(page)).toBeGreaterThan(0);
    });

    test('profil z adresu ?u=12: margines = własny arkusz (@S15)', async ({ page }) => {
      await page.goto('/?e2e&u=12');
      await waitReady(page);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await expect(page.getByRole('dialog', { name: 'Województwo małopolskie' })).toBeVisible({ timeout: 20_000 });
      await expect.poll(() => insetError(page, PROFILE_DIALOG), { timeout: 30_000 }).toBeLessThanOrEqual(8);
      expect(await readInset(page)).toBeGreaterThan(0);
    });

    test('po Rozwiń i Zwiń margines nadal zgadza się z arkuszem (@S15)', async ({ page }) => {
      await openFromIndicatorList(page);
      await expect.poll(() => insetError(page, PROFILE_DIALOG), { timeout: 30_000 }).toBeLessThanOrEqual(8);
      const dialog = page.locator(PROFILE_DIALOG).first();
      await dialog.getByRole('button', { name: 'Rozwiń' }).click();
      await expect.poll(() => insetError(page, PROFILE_DIALOG), { timeout: 30_000 }).toBeLessThanOrEqual(8);
      await dialog.getByRole('button', { name: 'Zwiń' }).click();
      await expect.poll(() => insetError(page, PROFILE_DIALOG), { timeout: 30_000 }).toBeLessThanOrEqual(8);
    });
  });

  test('komputer 1440x900: margines mapy wynosi 0 (@S15)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');
    await waitReady(page);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await expect.poll(() => readInset(page), { timeout: 30_000 }).toBe(0);
  });
});
