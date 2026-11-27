import { test, expect, type Page } from '@playwright/test';

// Ścieżka S1a: prosty ekran startowy `/` → „Otwórz mapę” → `/mapa` (docs/research/u/U08.md).
const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);
const isEngineNoise = (text: string) => text.includes('No actors found');

for (const width of [390, 1280]) {
  test.describe(`@PATH-1a ekran startowy @ ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
    });

    test(`@PATH-1a tytuł, zdanie, 3 kroki i przycisk; klik otwiera mapę (${width})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isEngineNoise(msg.text())) errors.push(msg.text());
      });
      page.on('pageerror', (err) => {
        if (!isEngineNoise(err.message)) errors.push(err.message);
      });
      const dataRequests: string[] = [];
      page.on('request', (req) => {
        const url = req.url();
        if (/\/values\/|units\.json|localities/.test(url)) dataRequests.push(url);
      });

      await page.goto('/?e2e');
      await expect(page).toHaveTitle('Faktografia');
      await expect(page.getByRole('heading', { level: 1, name: 'Faktografia' })).toBeVisible();
      await expect(page.getByText('Sprawdź swoją miejscowość i okolicę.')).toBeVisible();
      await expect(page.getByText('1. Wybierz dane, np. bezrobocie albo ludność.')).toBeVisible();
      await expect(page.getByText('2. Dotknij miejsca na mapie.')).toBeVisible();
      await expect(page.getByText('3. Zobacz profil i porównaj z innym miejscem.')).toBeVisible();

      const open = page.getByRole('link', { name: 'Otwórz mapę' });
      await expect(open).toBeVisible();
      const box = await open.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);

      // Na `/` nie pobieramy żadnych danych.
      await page.waitForLoadState('networkidle');
      expect(dataRequests).toEqual([]);

      // Odkrycia (W26-F02 zastąpiło „Przykłady”): karuzela zestawień, na starcie 4 slajdy redakcyjne; każdy prowadzi na /mapa.
      const discoveries = page.getByRole('region', { name: 'Odkrycia' });
      const tabs = discoveries.getByRole('tab');
      expect(await tabs.count()).toBeGreaterThanOrEqual(4);
      const hrefs: (string | null)[] = [];
      // Strzałkami na pasku, bez ruchu myszy: najechanie na link rozgrzewa mapę (to pobrałoby dane, a tu ich pobrań nie ma).
      await tabs.nth(0).focus();
      for (let k = 0; k < 4; k++) {
        if (k > 0) await page.keyboard.press('ArrowRight');
        await expect(tabs.nth(k)).toHaveAttribute('aria-selected', 'true');
        const link = discoveries.getByRole('link', { name: /^Zobacz na mapie: / });
        await expect(link).toHaveCount(1);
        hrefs.push(await link.getAttribute('href'));
      }
      expect(new Set(hrefs).size).toBe(4);
      for (const href of hrefs) expect(href).toMatch(/^\/mapa\?/);

      // Brak poziomego przewijania.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      await open.click();
      await expect(page).toHaveURL(/\/mapa(\?|$)/);
      await ready(page);
      expect(errors).toEqual([]);
    });

    test(`@PATH-1a zestawienie z Odkryć otwiera mapę (${width})`, async ({ page }) => {
      await page.goto('/?e2e');
      await page.getByRole('region', { name: 'Odkrycia' }).getByRole('link', { name: /^Zobacz na mapie: / }).first().click();
      await expect(page).toHaveURL(/\/mapa\?/);
      await ready(page);
    });
  });
}

test.describe('@PATH-1a nazwa „Faktografia” w tytule karty', () => {
  test('/, /mapa, /o-projekcie i 404 mają tytuł bez „Atlas”', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    const titles: Record<string, RegExp> = {
      '/': /^Faktografia$/,
      '/mapa?e2e': /^Faktografia$/,
      '/o-projekcie': /Faktografia$/,
      '/nie-ma-takiej-strony': /Faktografia$/,
    };
    for (const [path, re] of Object.entries(titles)) {
      await page.goto(path);
      await expect(page, path).toHaveTitle(re);
      expect(await page.title()).not.toContain('Atlas');
      await expect(page.locator('header img[alt="Faktografia"]')).toBeVisible();
    }
  });
});
