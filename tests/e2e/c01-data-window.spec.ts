import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// C01: „Wybierz dane” = okno na cały ekran; dolny pasek na telefonie wyżej.
const SIZES = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];

async function ready(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await openMap(page, '?e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

/** Na telefonie przycisk jest w arkuszu paska; na komputerze w panelu. */
async function openButton(page: Page, width: number) {
  if (width < 768) await page.locator('[data-slot="mobile-indicator-bar"]').getByRole('button').first().click();
  return page.getByRole('button', { name: /Wybierz dane/ }).first();
}

for (const size of SIZES) {
  test.describe(`@C01 okno „Wybierz dane” ${size.width}px`, () => {
    test.use({ viewport: size });

    test('okno na cały ekran, wyszukanie, wybór: adres ma nowe i, okno zamknięte', async ({ page }) => {
      await ready(page);
      const before = new URL(page.url()).searchParams.get('i');
      const open = await openButton(page, size.width);
      const box = await open.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await open.click();
      const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
      await expect(dialog).toBeVisible();
      const r = await dialog.boundingBox();
      expect(Math.round(r!.width)).toBe(size.width);
      expect(Math.round(r!.height)).toBe(size.height);
      const close = await dialog.getByRole('button', { name: 'Zamknij' }).boundingBox();
      expect(close!.width).toBeGreaterThanOrEqual(44);
      expect(close!.height).toBeGreaterThanOrEqual(44);

      await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('bezrobocie');
      await dialog.getByRole('button', { name: /bezrobocia/i }).first().click();
      await expect(dialog).toBeHidden();
      await page.waitForFunction((b) => new URL(location.href).searchParams.get('i') !== b, before);
      const now = new URL(page.url()).searchParams.get('i');
      expect(now).toMatch(/bezrobocia|unemployment/);
      await page.waitForFunction((i) => (window as any).__atlas?.choropleth?.indicatorId === i, now);
    });

    test('Esc zamyka okno, a fokus wraca na przycisk', async ({ page }) => {
      await ready(page);
      const open = await openButton(page, size.width);
      await open.click();
      await expect(page.getByRole('dialog', { name: 'Wybierz dane' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Wybierz dane' })).toBeHidden();
      await expect(open).toBeFocused();
    });
  });
}

test.describe('@C01 dolny pasek na telefonie', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('pasek leży wyżej niż dolna krawędź (≥ 12 px), a okienko miejsca go nie zasłania', async ({ page }) => {
    await ready(page);
    const bar = await page.locator('[data-slot="mobile-indicator-bar"]').boundingBox();
    expect(844 - (bar!.y + bar!.height)).toBeGreaterThanOrEqual(12);
    await page.evaluate(() => (window as any).__atlas?.selectUnit?.('1217'));
    await page.goto('/mapa?e2e&u=1217');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    const tip = page.locator('[role="status"]').filter({ hasText: /Kliknij|Otwórz profil|profil/i }).first();
    if (await tip.count()) {
      const t = (await tip.boundingBox())!;
      const b = (await page.locator('[data-slot="mobile-indicator-bar"]').boundingBox())!;
      expect(t.y + t.height <= b.y || t.y >= b.y + b.height).toBe(true);
    }
  });
});
