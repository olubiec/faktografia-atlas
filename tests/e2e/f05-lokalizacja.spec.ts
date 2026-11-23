import { test, expect, type Page } from '@playwright/test';

// F05: „Użyj mojej lokalizacji” na starcie (docs/KONCEPT-ODKRYCIA.md §5, §6 stan A).
// Lokalizację podstawiamy w przeglądarce testowej (bez sieci); gminę wyznacza strona z admin.topo.json.
// Powód środowiskowy podstawienia: nagłówek Permissions-Policy z vercel.json (`geolocation=()`, test S02) wyłącza
// prawdziwą geolokalizację także w `vite preview` – podstawiamy więc navigator.geolocation i document.featurePolicy.
const KRAKOW = { latitude: 50.061, longitude: 19.937 };

/** Podstawiona geolokalizacja: punkt albo błąd o danym kodzie (1 = brak zgody). */
async function fakeGeolocation(page: Page, result: { latitude: number; longitude: number } | { code: number }) {
  await page.addInitScript((r) => {
    Object.defineProperty(document, 'featurePolicy', { configurable: true, value: { allowsFeature: () => true } });
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (ok: (p: unknown) => void, err: (e: unknown) => void) =>
          setTimeout(() => ('code' in r ? err({ code: r.code }) : ok({ coords: { latitude: r.latitude, longitude: r.longitude, accuracy: 50 }, timestamp: Date.now() })), 10),
      },
    });
  }, result);
}

async function denyConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
}

async function openPlace(page: Page) {
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  return section.locator('section[aria-labelledby="start-place-title"]');
}

for (const width of [360, 1280]) {
  test.describe(`@F05 Użyj mojej lokalizacji @ ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await denyConsent(page);
    });

    test(`@F05 punkt w Krakowie → „Twoja gmina: Kraków. Zmień” i fakty gminy; współrzędne nie wychodzą z urządzenia (${width})`, async ({ page }) => {
      await fakeGeolocation(page, KRAKOW);
      const urls: string[] = [];
      page.on('request', (r) => urls.push(r.url()));

      await page.goto('/?e2e');
      const place = await openPlace(page);
      const button = place.getByRole('button', { name: 'Użyj mojej lokalizacji' });
      await expect(button).toBeVisible();
      // Pole dotykowe ≥ 44 px.
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);

      await button.click();
      const note = place.locator('[data-slot="located"]');
      await expect(note).toContainText('Twoja gmina: Kraków.');
      await expect(place.locator('[data-slot="place-facts"]')).toHaveAttribute('data-teryt', '1261011');
      // Wybór jest zapamiętany (sam TERYT).
      expect(await page.evaluate(() => localStorage.getItem('faktografia.place'))).toBe('1261011');
      // Żaden adres nie zawiera współrzędnych.
      expect(urls.filter((u) => u.includes('50.061') || u.includes('19.937'))).toEqual([]);

      // „Zmień” wraca do szukajki i przycisku.
      await note.getByRole('button', { name: 'Zmień' }).click();
      await expect(place.getByRole('button', { name: 'Użyj mojej lokalizacji' })).toBeVisible();
      await expect(place.locator('[data-slot="located"]')).toHaveCount(0);
    });

    test(`@F05 brak zgody → komunikat i fokus w szukajce (${width})`, async ({ page }) => {
      // Odmowa zgody: przeglądarka zwraca błąd PERMISSION_DENIED (kod 1).
      await fakeGeolocation(page, { code: 1 });
      await page.goto('/?e2e');
      const place = await openPlace(page);
      await place.getByRole('button', { name: 'Użyj mojej lokalizacji' }).click();
      await expect(place.getByRole('status')).toContainText('Bez zgody na lokalizację');
      await expect(page.locator('#start-place')).toBeFocused();
      await expect(place.locator('[data-slot="place-facts"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  });
}
