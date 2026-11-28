import { test, expect, type Page } from '@playwright/test';
import availableFixture from '../fixtures/library/available.json' with { type: 'json' };

// @F02c: „Wybierz dane · N wskaźników” w panelu zestawień: dowolny wskaźnik z biblioteki mapy jako ostatnia pozycja paska (5 pozycji).
type Counts = { available: number; v101: number; v201: number };

/** Wartości syntetyczne dla wszystkich powiatów (id BDL z units.json), żeby rok miał dane dla ≥ 50% jednostek. */
async function powiatValues(page: Page) {
  const units = (await (await page.request.get('/data/units.json')).json()) as { level: string; bdlId: string | null }[];
  const d: Record<string, number[]> = {};
  units.filter((u) => u.level === 'pow' && u.bdlId).forEach((u, k) => (d[u.bdlId!] = [100 + k, 100 + k, 100 + k]));
  return JSON.stringify({ v: '101', l5: { y: [2022, 2023, 2024], d } });
}

async function mockLibrary(page: Page, opts: { failV201Times?: number } = {}): Promise<Counts> {
  const counts: Counts = { available: 0, v101: 0, v201: 0 };
  const body = await powiatValues(page);
  await page.route('**/available.json', (route) => {
    counts.available++;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(availableFixture) });
  });
  await page.route('**/values/101.json', (route) => {
    counts.v101++;
    return route.fulfill({ status: 200, contentType: 'application/json', body });
  });
  await page.route('**/values/201.json', (route) => {
    counts.v201++;
    if (counts.v201 <= (opts.failV201Times ?? 0)) return route.fulfill({ status: 500, body: 'błąd' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: body.replace('"101"', '"201"') });
  });
  return counts;
}

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.goto('/?e2e');
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  const lists = section.locator('section[aria-labelledby="start-lists-title"]');
  await expect(lists.locator('[data-slot="start-list-row"]').first()).toBeVisible();
  return lists;
}

async function pick(page: Page, name: string) {
  const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill(name);
  await dialog.getByRole('button', { name: new RegExp(name) }).first().click();
  await expect(dialog).toBeHidden();
}

for (const width of [390, 1280]) {
  test(`@F02c menu danych: spis i wartości dopiero po wyborze, wskaźnik z biblioteki jest ostatnim slajdem, kolejny wybór go zastępuje (${width})`, async ({ page }) => {
    const counts = await mockLibrary(page);
    const lists = await open(page, width);
    const tabs = lists.getByRole('tab');
    // Spis jest lekki i daje liczbę wskaźników w przycisku; wartości wskaźników dopiero po wyborze.
    expect(counts).toEqual({ available: 1, v101: 0, v201: 0 });
    const before = await tabs.count();

    const more = lists.getByRole('button', { name: /^Wybierz dane · \d+ wskaźnik/ });
    expect((await more.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await more.click();
    await pick(page, 'Liczba ludności ogółem');
    expect(counts.available).toBe(1);

    // Nowa pozycja na końcu paska, karuzela przeszła do niej, widać 5 + 5 pozycji z linkiem do mapy.
    await expect.poll(() => tabs.count()).toBeGreaterThanOrEqual(before + 1);
    const last = tabs.last();
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).toContainText('Liczba ludności ogółem');
    await expect(last).toContainText('z biblioteki');
    const active = lists.locator('[data-slot="start-carousel-panel"]');
    await expect(active.locator('[data-slot="start-list-row"]')).toHaveCount(5);
    await expect(active.getByRole('link', { name: /^Zobacz na mapie/ })).toHaveAttribute('href', /^\/mapa\?i=b101&/);
    await expect(active.locator('[data-slot="start-list-subtitle"]')).toContainText('powiatów z najwyższą wartością');
    await active.getByRole('button', { name: 'Najniższe' }).click();
    await expect(active.locator('[data-slot="start-list-row"]')).toHaveCount(5);
    expect(counts.v101).toBe(1);
    const total = await tabs.count();

    // Kolejny wybór zastępuje poprzedni: pasek nie rośnie, a na końcu jest nowy wskaźnik.
    await lists.getByRole('button', { name: /^Wybierz dane · \d+ wskaźnik/ }).click();
    await pick(page, 'Pracujący ogółem');
    await expect(tabs.last()).toContainText('Pracujący ogółem');
    expect(await tabs.count()).toBe(total);
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    expect(counts.available).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`@F02c menu danych: błąd wczytania pokazuje komunikat i „Spróbuj jeszcze raz” (${width})`, async ({ page }) => {
    const counts = await mockLibrary(page, { failV201Times: 1 });
    const lists = await open(page, width);
    await lists.getByRole('button', { name: /^Wybierz dane · \d+ wskaźnik/ }).click();
    await pick(page, 'Pracujący ogółem');
    const state = lists.locator('[data-slot="library-state"]');
    await expect(state).toContainText('Nie udało się wczytać danych.');
    await state.getByRole('button', { name: 'Spróbuj jeszcze raz' }).click();
    const active = lists.locator('[data-slot="start-carousel-panel"]');
    await expect(active.locator('[data-slot="start-list-row"]')).toHaveCount(5);
    await expect(state).toHaveCount(0);
    expect(counts.v201).toBe(2);
  });
}
