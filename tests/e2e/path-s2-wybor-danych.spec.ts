import { test, expect, type Page } from '@playwright/test';
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { openMap } from './helpers/open-map';

// Ścieżka S2 „wybór danych” (@PATH-2, 1280 px): panel → przycisk z nazwą wskaźnika → dział → grupa → wskaźnik.
// Spis pobranych (available.json) podstawiamy nagraną próbką; indeks pełny (index.json) ma nie być pobierany.

type Counts = { available: number; index: number };

async function mockLibrary(page: Page): Promise<Counts> {
  const counts: Counts = { available: 0, index: 0 };
  await page.route('**/available.json', (route) => {
    counts.available++;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture.available) });
  });
  await page.route('**/index.json', (route) => {
    counts.index++;
    return route.fulfill({ status: 404, body: '' });
  });
  return counts;
}

async function ready(page: Page, query: string) {
  await openMap(page, query);
  await page.waitForFunction(() => (window as unknown as { __atlas?: { ready?: boolean } }).__atlas?.ready === true);
}

const choroplethId = (page: Page) =>
  page.evaluate(() => (window as unknown as { __atlas: { choropleth: { indicatorId: string } | null } }).__atlas.choropleth?.indicatorId ?? null);

const search = async (page: Page) => new URLSearchParams(await page.evaluate(() => window.location.search));

/** Przycisk z nazwą wskaźnika w panelu (nie przycisk „Co to znaczy”). */
const trigger = (page: Page) => page.locator('[data-slot="dialog-trigger"]');

test.describe('@PATH-2 wybór danych (1280 px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
  });

  test('przycisk z nazwą → dział → grupa → wskaźnik; adres ma i=, legenda i tytuł zgodne', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '?e2e');
    await expect(trigger(page)).toHaveText(/Gęstość zaludnienia/);
    await trigger(page).click();
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('navigation', { name: 'Działy' }).getByRole('button', { name: /^Rynek pracy/ }).click();
    await dialog.getByRole('button', { name: /^★ Najważniejsze/ }).click();
    await dialog.getByRole('button', { name: /Stopa bezrobocia rejestrowanego/ }).click();

    await expect(dialog).toBeHidden();
    await expect.poll(async () => (await search(page)).get('i')).toBe('unemployment-rate');
    await page.waitForFunction(() => (window as unknown as { __atlas: { choropleth?: { indicatorId?: string } } }).__atlas.choropleth?.indicatorId === 'unemployment-rate');
    expect(await choroplethId(page)).toBe('unemployment-rate');
    const panel = page.getByRole('complementary', { name: 'Panel wskaźnika' });
    await expect(trigger(page)).toHaveText(/Stopa bezrobocia rejestrowanego/);
    expect(await panel.getByRole('listitem').count()).toBeGreaterThanOrEqual(5);
  });

  test('niepobranych i archiwalnych wskaźników nie ma na liście; nie ma „Zamów”', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '?e2e');
    await trigger(page).click();
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await dialog.getByRole('navigation', { name: 'Działy' }).getByRole('button', { name: /^Szkolnictwo/ }).click();
    await expect(dialog.getByRole('button', { name: /Szkolnictwo podstawowe/ })).toBeVisible();
    await expect(dialog.getByText(/archiwaln/i)).toHaveCount(0);
    await expect(dialog.getByText(/zamów/i)).toHaveCount(0);
    await dialog.getByRole('button', { name: /Szkolnictwo podstawowe/ }).click();
    await expect(dialog.getByRole('button', { name: /Szkoły dla dorosłych/ })).toHaveCount(0);
  });

  test('szukaj „bezrobocie” i wybierz wynik; „lekarze” daje komunikat bez danych', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '?e2e');
    await trigger(page).click();
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    const field = dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' });

    await field.fill('lekarze');
    await expect(dialog.getByText('Nie mamy jeszcze tych danych o „lekarze”.')).toBeVisible();

    await field.fill('bezrobocie');
    await dialog.getByRole('button', { name: /Stopa bezrobocia rejestrowanego/ }).first().click();
    await expect(dialog).toBeHidden();
    await expect.poll(async () => (await search(page)).get('i')).toBe('unemployment-rate');
  });

  test('/?menu=dane&q=ludnosc otwiera menu z wpisaną frazą, a po zamknięciu parametry znikają', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '?e2e&menu=dane&q=ludnosc');
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' })).toHaveValue('ludnosc');
    await expect(dialog.getByRole('button', { name: /Ludność ogółem/ }).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    const params = await search(page);
    expect(params.has('menu')).toBe(false);
    expect(params.has('q')).toBe(false);
    expect(params.has('e2e')).toBe(true);
  });

  test('budżet: otwarcie menu = jedno żądanie available.json i zero index.json', async ({ page }) => {
    const counts = await mockLibrary(page);
    await ready(page, '?e2e');
    await trigger(page).click();
    await expect(page.getByRole('dialog', { name: 'Wybierz dane' }).getByRole('navigation', { name: 'Działy' })).toBeVisible();
    await page.waitForTimeout(500);
    expect(counts.available).toBe(1);
    expect(counts.index).toBe(0);
  });
});
