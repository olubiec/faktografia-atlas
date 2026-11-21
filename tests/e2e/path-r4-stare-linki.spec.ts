import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Ścieżka R4 „stary link z parametrami zachowuje wszystkie parametry” (docs/research/u/U08.md §4).
// Wchodzimy przez openMap() i sprawdzamy adres po wejściu – nie zakładamy, że przekierowanie istnieje,
// więc test działa dziś (mapa pod `/`) i po przestawieniu mapy na inną trasę.

const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);
const params = async (page: Page) => new URLSearchParams(await page.evaluate(() => window.location.search));

test.describe('@PATH-R4 stare linki z parametrami', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
  });

  test('@PATH-R4 u, i, y, l, c, sheet, e2e, logo i tune przeżywają wejście na mapę', async ({ page }) => {
    const wanted: Record<string, string> = {
      u: '1217',
      i: 'density',
      y: '2023',
      l: 'pow',
      c: '1217,1801',
      sheet: 'full',
      e2e: '1',
      logo: 'znak',
      tune: '1',
    };
    await openMap(page, `?${new URLSearchParams(wanted).toString()}`);
    await ready(page);

    const got = await params(page);
    for (const [key, value] of Object.entries(wanted)) {
      expect(got.get(key), `parametr ${key} po wejściu na mapę`).toBe(value);
    }
  });

  test('@PATH-R4 zapis `/?u=1217&i=density&y=2023&l=pow&e2e` zostaje bez zmian', async ({ page }) => {
    await openMap(page, '?u=1217&i=density&y=2023&l=pow&e2e');
    await ready(page);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const got = await params(page);
    expect(got.get('u')).toBe('1217');
    expect(got.get('i')).toBe('density');
    expect(got.get('y')).toBe('2023');
    expect(got.get('l')).toBe('pow');
    expect(got.has('e2e')).toBe(true);
    const atlas = await page.evaluate(() => (window as any).__atlas);
    expect(atlas.selected).toBe('1217');
    expect(atlas.choropleth).toMatchObject({ indicatorId: 'density', year: 2023 });
  });

  test('@PATH-R4 /?u=invalid999 otwiera mapę bez błędu w konsoli', async ({ page }) => {
    const errors: string[] = [];
    // „No actors found” zgłasza silnik mapy (maplibre) przy starcie workerów w środowiskach bez GPU;
    // dotyczy każdego wejścia na mapę (także poprawnych adresów), więc nie jest skutkiem złego `u=`.
    const isEngineNoise = (text: string) => text.includes('No actors found');
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isEngineNoise(msg.text())) errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!isEngineNoise(err.message)) errors.push(err.message);
    });

    await openMap(page, '?u=invalid999&e2e');
    await ready(page);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlas = await page.evaluate(() => (window as any).__atlas);
    expect(atlas.selected).toBeNull();
    expect(errors).toEqual([]);
  });
});
