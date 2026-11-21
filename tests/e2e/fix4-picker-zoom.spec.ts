import { expect, test, type Page } from '@playwright/test';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import { openMap } from './helpers/open-map';

async function routeLibrary(page: Page, body: unknown) {
  await page.route('**/index.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }),
  );
}

async function openAddWindow(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openMap(page, '?e2e&u=12');
  await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
  const side = page.locator('[data-slot="side"]');
  await side.getByRole('button', { name: 'Dodaj wskaźnik' }).click();
  return { side, win: side.getByRole('group', { name: 'Wskaźniki do dodania' }) };
}

test.describe('FIX4: okno dodawania wskaźników po kategoriach (@FIX4)', () => {
  test('@FIX4 okno jest przewijane, a klik w kategorię pokazuje jej wskaźniki w środku', async ({ page }) => {
    await routeLibrary(page, indexFixture);
    const { win } = await openAddWindow(page);
    await expect(win).toBeVisible();
    expect(await win.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');

    const headers = win.getByRole('button', { expanded: false });
    expect(await headers.count()).toBeGreaterThan(1);
    // Rozwinięta jest tylko jedna kategoria naraz.
    await expect(win.getByRole('button', { expanded: true })).toHaveCount(1);
    const before = await win.getByRole('button', { name: /^Dodaj: / }).count();
    expect(before).toBeGreaterThan(0);

    await headers.first().click();
    await expect(win.getByRole('button', { expanded: true })).toHaveCount(1);
    await expect(win.getByRole('button', { name: /^Dodaj: / }).first()).toBeVisible();
  });

  test('@FIX4 wskaźnik z biblioteki: dział, potem wybór w środku prowadzi do jego strony', async ({ page }) => {
    await routeLibrary(page, indexFixture);
    const { win } = await openAddWindow(page);
    await win.getByRole('button', { name: /^Z biblioteki GUS/ }).click();
    await win.getByRole('button', { name: /^Ludność \(/ }).last().click(); // druga „Ludność” to dział biblioteki
    const links = win.getByRole('link', { name: /^Otwórz: / });
    await expect(links.first()).toBeVisible();
    await links.first().click();
    await expect(page).toHaveURL(/\/mapa\?i=b\d+/);
  });

  test('@FIX4 wyniki z biblioteki są ograniczone do 50', async ({ page }) => {
    await routeLibrary(page, {
      version: 1,
      categories: { '1': { n: 'Ludność', p: null } },
      units: ['osoba'],
      variables: Array.from({ length: 120 }, (_, i) => ({ id: String(1000 + i), s: '1', n: `Wymiar ${i}`, l: 5, u: 0, has: 1 })),
    });
    const { win } = await openAddWindow(page);
    await win.getByRole('button', { name: /^Z biblioteki GUS/ }).click();
    await win.getByPlaceholder('Szukaj w bibliotece…').fill('wymiar');
    await expect(win.getByRole('link', { name: /^Otwórz: / })).toHaveCount(50);
    await expect(win.getByText('Pokazano 50 z 120')).toBeVisible();
  });
});

test.describe('FIX4: zoom mapy (@FIX4)', () => {
  test('@FIX4 klawisz „+” przybliża mapę, a „-” oddala (po zmianie obsługi klawiatury)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    const zoom = () => page.evaluate(() => (window as any).__atlas.viewState.zoom as number);
    const before = await zoom();
    await page.getByLabel('Mapa Polski').focus();
    await page.keyboard.press('+');
    await expect.poll(zoom).toBeGreaterThan(before);
    const mid = await zoom();
    await page.keyboard.press('-');
    await expect.poll(zoom).toBeLessThan(mid);
  });
});
