import { test, expect, type Page } from '@playwright/test';
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { openMap } from './helpers/open-map';

// Ścieżka S2 na telefonie (@PATH-2m): pasek wskaźnika → menu → dział → grupa → wskaźnik; szukaj; zamknięcie arkusza.
// Ta sama ścieżka co na komputerze (path-s2-wybor-danych.spec.ts), ale w arkuszu i przy 390×844 oraz 360×740.
// Spis pobranych (available.json) podstawiamy nagraną próbką; indeks pełny (index.json) ma nie być pobierany.

async function mockLibrary(page: Page) {
  await page.route('**/available.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture.available) }),
  );
  await page.route('**/index.json', (route) => route.fulfill({ status: 404, body: '' }));
}

async function ready(page: Page, query: string) {
  await openMap(page, query);
  await page.waitForFunction(() => (window as unknown as { __atlas?: { ready?: boolean } }).__atlas?.ready === true);
}

const search = async (page: Page) => new URLSearchParams(await page.evaluate(() => window.location.search));
const bar = (page: Page) => page.locator('[data-slot="mobile-indicator-bar"]');
const sheet = (page: Page) => page.getByRole('dialog', { name: 'Panel wskaźnika' });
const picker = (page: Page) => sheet(page).locator('[data-slot="sheet-indicator-picker"]');

const SIZES = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
];

for (const size of SIZES) {
  test.describe(`@PATH-2m wybór danych na telefonie (${size.width}×${size.height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      await mockLibrary(page);
      await ready(page, '?e2e');
    });

    test('pasek → menu → dział → grupa → wskaźnik; adres ma i=', async ({ page }) => {
      await expect(bar(page)).toContainText(/Gęstość zaludnienia/);
      await bar(page).getByRole('button').first().click();
      await expect(sheet(page)).toBeVisible();

      // Poziom 1: szukajka u góry i działy; nie ma jeszcze okruszków.
      const menu = picker(page);
      await expect(menu.getByRole('searchbox', { name: 'Szukaj wskaźnika' })).toBeVisible();
      await expect(menu.getByRole('navigation', { name: 'Ścieżka' })).toHaveCount(0);
      await menu.getByRole('navigation', { name: 'Działy' }).getByRole('button', { name: /^Rynek pracy/ }).click();

      // Poziom 2: jeden widok naraz, działy znikają, są okruszki „Wszystkie › Dział”.
      await expect(menu.getByRole('navigation', { name: 'Działy' })).toHaveCount(0);
      const crumbs = menu.getByRole('navigation', { name: 'Ścieżka' });
      await expect(crumbs).toContainText('Wszystkie');
      await expect(crumbs).toContainText('Rynek pracy');
      await menu.getByRole('button', { name: /^★ Najważniejsze/ }).click();

      // Poziom 3: okruszki z grupą i lista wskaźników.
      await expect(crumbs).toContainText('Najważniejsze');
      await menu.getByRole('button', { name: /Stopa bezrobocia rejestrowanego/ }).click();

      await expect.poll(async () => (await search(page)).get('i')).toBe('unemployment-rate');
      await page.waitForFunction(
        () => (window as unknown as { __atlas: { choropleth?: { indicatorId?: string } } }).__atlas.choropleth?.indicatorId === 'unemployment-rate',
      );
      // Po wyborze arkusz się zamyka i widać nową mapę.
      await expect(sheet(page)).toBeHidden();
      // Pasek pod mapą pokazuje nowy wskaźnik.
      await expect(bar(page)).toContainText(/Stopa bezrobocia rejestrowanego/);
    });

    test('szukaj „bezrobocie” i wybierz wynik; „lekarze” daje komunikat bez danych', async ({ page }) => {
      await bar(page).getByRole('button').first().click();
      const menu = picker(page);
      const field = menu.getByRole('searchbox', { name: 'Szukaj wskaźnika' });

      await field.fill('lekarze');
      await expect(menu.getByText('Nie mamy jeszcze tych danych o „lekarze”.')).toBeVisible();

      await field.fill('bezrobocie');
      await menu.getByRole('button', { name: /Stopa bezrobocia rejestrowanego/ }).first().click();
      await expect.poll(async () => (await search(page)).get('i')).toBe('unemployment-rate');
    });

    test('arkusz zamyka się przeciągnięciem w dół i przyciskiem ×', async ({ page }) => {
      const open = async () => {
        await bar(page).getByRole('button').first().click();
        await expect(sheet(page)).toBeVisible();
      };

      await open();
      await sheet(page).getByRole('button', { name: 'Zamknij' }).click();
      await expect(sheet(page)).toBeHidden();

      await open();
      // Uchwyt arkusza leży na jego górnej krawędzi; ciągniemy go w dół poza ekran.
      // Najpierw czekamy, aż animacja otwarcia się skończy (górna krawędź przestaje się przesuwać).
      let last = -1;
      await expect
        .poll(async () => {
          const top = (await sheet(page).boundingBox())!.y;
          const still = Math.abs(top - last) < 0.5;
          last = top;
          return still;
        })
        .toBe(true);
      const box = (await sheet(page).boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + 14;
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (let step = 1; step <= 12; step++) await page.mouse.move(x, y + step * 60, { steps: 3 });
      await page.mouse.up();
      await expect(sheet(page)).toBeHidden();
    });

    test('brak przewijania w poziomie, pola dotykowe ≥ 44 px', async ({ page }) => {
      await bar(page).getByRole('button').first().click();
      const menu = picker(page);
      await expect(menu).toBeVisible();

      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(await overflow()).toBe(false);

      const tooSmall = async () =>
        menu.evaluate((root) =>
          [...root.querySelectorAll('button, input')]
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5))
            .length,
        );
      expect(await tooSmall()).toBe(0);

      await menu.getByRole('navigation', { name: 'Działy' }).getByRole('button', { name: /^Rynek pracy/ }).click();
      expect(await tooSmall()).toBe(0);
      await menu.getByRole('button', { name: /^★ Najważniejsze/ }).click();
      expect(await tooSmall()).toBe(0);
      expect(await overflow()).toBe(false);
      // Menu nie wychodzi poza szerokość ekranu.
      const box = (await menu.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width);
    });
  });
}

test.describe('@PATH-2m adres ?menu=dane na telefonie', () => {
  test('/mapa?menu=dane&q=ludnosc otwiera arkusz z frazą; po zamknięciu parametry znikają', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await mockLibrary(page);
    await ready(page, '?e2e&menu=dane&q=ludnosc');
    await expect(sheet(page)).toBeVisible();
    await expect(picker(page).getByRole('searchbox', { name: 'Szukaj wskaźnika' })).toHaveValue('ludnosc');
    await expect(picker(page).getByRole('button', { name: /Ludność ogółem/ }).first()).toBeVisible();

    await sheet(page).getByRole('button', { name: 'Zamknij' }).click();
    await expect(sheet(page)).toBeHidden();
    const params = await search(page);
    expect(params.has('menu')).toBe(false);
    expect(params.has('q')).toBe(false);
    expect(params.has('e2e')).toBe(true);
  });
});
