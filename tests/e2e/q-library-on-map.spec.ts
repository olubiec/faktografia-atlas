import { test, expect, type Page } from '@playwright/test';
import { canvasPoint, VOIVODESHIP_CENTROIDS } from './helpers/map-tap';
import availableFixture from '../fixtures/library/available.json' with { type: 'json' };
import valuesSampleFixture from '../fixtures/library/values-sample.json' with { type: 'json' };

// Wskaźnik z biblioteki (b101, tylko powiaty) na mapie głównej (QC606, @Q).

type Counts = { values: number; available: number; index: number };

async function mockLibrary(page: Page, opts: { available404?: boolean } = {}): Promise<Counts> {
  const counts: Counts = { values: 0, available: 0, index: 0 };
  await page.route('**/available.json', (route) => {
    counts.available++;
    if (opts.available404) return route.fulfill({ status: 404, body: 'nie ma' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(availableFixture) });
  });
  await page.route('**/values/101.json', (route) => {
    counts.values++;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(valuesSampleFixture) });
  });
  await page.route('**/index.json', (route) => {
    counts.index++;
    return route.fulfill({ status: 404, body: '' });
  });
  return counts;
}

async function ready(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
}

const choropleth = (page: Page) => page.evaluate(() => (window as any).__atlas.choropleth);

test.describe('Mapa na wskaźniku z biblioteki (QC606 @Q)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('/?i=b101&l=pow koloruje mapę wskaźnikiem z biblioteki, 5 klas', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '/?e2e&i=b101&l=pow');
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'b101');
    const c = await choropleth(page);
    expect(c.indicatorId).toBe('b101');
    expect(c.level).toBe('pow');
    expect(c.year).toBe(2024);
    expect(c.classes).toBe(5);
  });

  test('jedno żądanie wartości, jedno available.json, zero index.json', async ({ page }) => {
    const counts = await mockLibrary(page);
    await ready(page, '/?e2e&i=b101&l=pow');
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'b101');
    await page.waitForTimeout(500);
    expect(counts.values).toBe(1);
    expect(counts.available).toBe(1);
    expect(counts.index).toBe(0);
  });

  test('wskaźnika nie ma w spisie: wraca domyślny, adres bez złego i', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '/?e2e&i=b999999');
    await page.waitForFunction(() => !new URL(window.location.href).searchParams.has('i'));
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'density');
    expect((await choropleth(page)).indicatorId).toBe('density');
    expect(await page.evaluate(() => window.location.search)).not.toContain('b999999');
  });

  test('brak available.json (404): mapa na domyślnym wskaźniku, bez błędów w konsoli', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      // Sam komunikat przeglądarki o 404 zasobu nie jest błędem kodu strony.
      if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text());
    });
    await mockLibrary(page, { available404: true });
    await ready(page, '/?e2e&i=b101');
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'density');
    expect(await page.evaluate(() => window.location.search)).not.toContain('b101');
    expect(errors).toEqual([]);
  });

  test('wskaźnik tylko powiatowy z ?l=gmi: poziom obniżony do powiatów', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '/?e2e&i=b101&l=gmi');
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'b101');
    expect((await choropleth(page)).level).toBe('pow');
  });

  test('wybór miejsca na mapie zachowuje ?i=b101 w adresie', async ({ page }) => {
    await mockLibrary(page);
    await ready(page, '/?e2e&i=b101&l=pow');
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'b101');
    const canvas = page.locator('.maplibregl-canvas');
    const { x, y } = await canvasPoint(page, canvas, VOIVODESHIP_CENTROIDS.pomorskie.lon, VOIVODESHIP_CENTROIDS.pomorskie.lat);
    await canvas.click({ position: { x, y } });
    await page.waitForFunction(() => new URL(window.location.href).searchParams.has('u'));
    expect(await page.evaluate(() => new URL(window.location.href).searchParams.get('i'))).toBe('b101');
  });
});
