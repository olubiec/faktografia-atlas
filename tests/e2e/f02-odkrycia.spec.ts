import { test, expect, type Page } from '@playwright/test';

// F02: „Odkrycia” na stronie startowej zamiast „Przykładów” (docs/KONCEPT-ODKRYCIA.md §6).
const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);

async function denyConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
}

/** Przewija do sekcji „Odkrycia” (dane sekcji pobierają się, gdy zbliża się do ekranu). */
async function openDiscoveries(page: Page) {
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  return section;
}

for (const width of [360, 1280]) {
  test.describe(`@F02 Odkrycia @ ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await denyConsent(page);
    });

    test(`@F02 Odkrycie dnia: „Zobacz na mapie” otwiera mapę ze wskaźnikiem, rokiem i jednostką jednym kliknięciem (${width})`, async ({ page }) => {
      await page.goto('/?e2e');
      const section = await openDiscoveries(page);
      await expect(section.getByRole('heading', { name: 'Odkrycie dnia' })).toBeVisible();
      await expect(section.getByRole('heading', { name: 'Zestawienia' })).toBeVisible();
      // Pary do porównania zniknęły (decyzja §13.2).
      await expect(section.getByText('vs', { exact: true })).toHaveCount(0);

      const daily = section.locator('section[aria-labelledby="start-daily-title"]');
      const link = daily.getByRole('link', { name: 'Zobacz na mapie' });
      await expect(link).toBeVisible();
      const href = (await link.getAttribute('href'))!;
      const params = new URL(href, 'http://x').searchParams;
      const [i, y, u] = [params.get('i'), params.get('y'), params.get('u')];
      expect(i).toBeTruthy();
      expect(y).toMatch(/^\d{4}$/);
      expect(u).toMatch(/^\d{2}(\d{2}(\d{3})?)?$/);

      // Karta: liczba i zdanie z rokiem.
      await expect(daily.locator('[data-slot="fact-card"] p').first()).toHaveText(/\d/);
      await expect(daily.locator('[data-slot="fact-card"]')).toContainText(y!);

      await link.click();
      await expect(page).toHaveURL(new RegExp(`/mapa\\?.*i=${i}.*&y=${y}.*&u=${u}`));
      await ready(page);
      const atlas = await page.evaluate(() => (window as any).__atlas);
      expect(atlas.selected).toBe(u);
      expect(atlas.choropleth?.indicatorId).toBe(i);
    });

    test(`@F02 Zestawienia: 4 karty po 5 pozycji, każda z linkiem do mapy z tym wskaźnikiem (${width})`, async ({ page }) => {
      await page.goto('/?e2e');
      const section = await openDiscoveries(page);
      const lists = section.locator('[data-slot="start-list"]');
      await expect(lists).toHaveCount(4);
      for (let k = 0; k < 4; k++) {
        await expect(lists.nth(k).locator('li')).toHaveCount(5);
        const href = await lists.nth(k).getByRole('link').getAttribute('href');
        expect(href).toMatch(/^\/mapa\?i=[\w-]+&y=\d{4}&l=(gmi|pow|woj)/);
      }
      // Napisy nie wychodzą poza karty, strona bez poziomego przewijania.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const overflow = await section.evaluate((root) =>
        [...root.querySelectorAll('[data-slot="fact-card"], [data-slot="start-list"]')].flatMap((card) => {
          const box = card.getBoundingClientRect();
          return [...card.querySelectorAll('*')]
            .filter((el) => getComputedStyle(el).textOverflow !== 'ellipsis')
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.width > 0 && (b.right > box.right + 1 || b.left < box.left - 1);
            })
            .map((el) => el.textContent?.slice(0, 30) ?? '');
        }),
      );
      expect(overflow).toEqual([]);
    });
  });
}

test.describe('@F02 Twoje miejsce', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await denyConsent(page);
  });

  test('@F02 wpisanie miejscowości i wybór → 3 karty faktów tej gminy; po przeładowaniu strona pamięta wybór', async ({ page }) => {
    const factFiles: string[] = [];
    page.on('request', (req) => {
      const p = new URL(req.url()).pathname;
      if (p.startsWith('/data/facts/')) factFiles.push(p);
    });
    await page.goto('/?e2e');
    const section = await openDiscoveries(page);
    const input = section.getByRole('combobox', { name: 'Wpisz miejscowość' });
    await input.click();
    await input.fill('Wieliczka');
    const option = section.getByRole('option', { name: /Wieliczka/ }).first();
    await expect(option).toBeVisible({ timeout: 20_000 });
    await option.click();

    const facts = section.locator('[data-slot="place-facts"]');
    await expect(facts.getByRole('heading', { name: /Wieliczka – 3 rzeczy, których mogłeś nie wiedzieć/ })).toBeVisible();
    await expect(facts.locator('[data-slot="fact-card"]')).toHaveCount(3);
    const teryt = await facts.getAttribute('data-teryt');
    expect(teryt).toMatch(/^1219\d{3}$/);
    // Tylko jeden plik faktów: województwo wybranego miejsca.
    expect([...new Set(factFiles)]).toEqual(['/data/facts/12.json']);
    // Każdy fakt prowadzi na mapę z tą gminą.
    for (const href of await facts.getByRole('link', { name: 'Zobacz na mapie' }).evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
      expect(href).toContain(`u=${teryt}`);
    }
    // W pamięci przeglądarki tylko sam TERYT.
    expect(await page.evaluate(() => localStorage.getItem('faktografia.place'))).toBe(teryt);

    await page.reload();
    const again = (await openDiscoveries(page)).locator('[data-slot="place-facts"]');
    await expect(again).toHaveAttribute('data-teryt', teryt!);
    await expect(again.locator('[data-slot="fact-card"]')).toHaveCount(3);
    await expect(again.getByRole('heading', { name: /Wieliczka/ })).toBeVisible();

    // „Zmień miejsce” wraca do szukajki i czyści pamięć.
    await again.getByRole('button', { name: 'Zmień miejsce' }).click();
    await expect(page.getByRole('combobox', { name: 'Wpisz miejscowość' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('faktografia.place'))).toBeNull();
  });

  test('@F02 fakt miejsca otwiera mapę z zaznaczoną gminą (1 kliknięcie)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('faktografia.place', '1219053'));
    await page.goto('/?e2e');
    const facts = (await openDiscoveries(page)).locator('[data-slot="place-facts"]');
    await expect(facts.locator('[data-slot="fact-card"]')).toHaveCount(3);
    await facts.getByRole('link', { name: 'Zobacz na mapie' }).first().click();
    await expect(page).toHaveURL(/\/mapa\?i=[\w-]+&y=\d{4}&u=1219053&l=gmi/);
    await ready(page);
    expect((await page.evaluate(() => (window as any).__atlas)).selected).toBe('1219053');
  });

  test('@F02 Twoja okolica i Twój bliźniak prowadzą do porównania (1 kliknięcie)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('faktografia.place', '1219053'));
    await page.goto('/?e2e');
    const facts = (await openDiscoveries(page)).locator('[data-slot="place-facts"]');
    const neighbour = facts.locator('[data-slot="place-neighbour"]');
    await expect(neighbour.getByRole('link', { name: 'Porównaj z sąsiadem' })).toHaveAttribute('href', /^\/mapa\?c=1219053,\d{7}(&|$)/);
    const twin = facts.locator('[data-slot="place-twin"]');
    await expect(twin).toContainText(/Najbardziej podobna gmina w innym województwie: .+\(\p{L}[\p{L}-]*\)\. Porównaliśmy \d+ wskaźników z \d{4} r\./u);
    const link = twin.getByRole('link', { name: 'Porównaj z bliźniakiem' });
    const href = (await link.getAttribute('href'))!;
    const pair = new URL(href, 'http://x').searchParams.get('c')!;
    expect(pair).toMatch(/^1219053,\d{7}$/);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/mapa\\?.*c=${pair}`));
  });
});

test.describe('@F02 budżet startu', () => {
  test('@F02 w pierwszych 3 s nie ma pobrań units.json, localities, values/, facts/ (także po przewinięciu do Odkryć)', async ({ page }) => {
    await denyConsent(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const urls: { path: string; t: number }[] = [];
    const t0 = Date.now();
    page.on('request', (req) => urls.push({ path: new URL(req.url()).pathname, t: Date.now() - t0 }));
    await page.goto('/?e2e');
    const section = await openDiscoveries(page);
    await expect(section.locator('[data-slot="fact-card"]').first()).toBeVisible();
    // Zostajemy na stronie do końca okna 3 s (rozgrzewka mapy startuje po 3 s od wejścia).
    const elapsed = Date.now() - t0;
    if (elapsed < 2800) await page.waitForTimeout(2800 - elapsed);
    const early = urls.filter((r) => r.t < 2800).map((r) => r.path);
    // Pliki danych (kawałki kodu mapy o podobnych nazwach rozgrzewa preloadMap – to nie dane).
    expect(early.filter((p) => /^\/data\/(units\.json|localities|values\/|facts\/)/.test(p))).toEqual([]);
    expect(early).toContain('/data/facts-start.json');
    expect(early.filter((p) => p === '/data/facts-start.json')).toHaveLength(1);
  });
});
