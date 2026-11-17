import { test, expect, type Page } from '@playwright/test';

// W17-A01: poziom mapy idzie za zoomem z gestu użytkownika (oddalenie → województwa, przybliżenie → gminy).

const levelOf = (page: Page) => page.evaluate(() => (window as any).__atlas?.choropleth?.level as string | undefined);
const zoomOf = (page: Page) => page.evaluate(() => (window as any).__atlas.viewState.zoom as number);
const historyLength = (page: Page) => page.evaluate(() => window.history.length);
// Kroki zoomu jak przyciski +/− (zdarzenie atlas:zoom) wysłane naraz: jedno przerysowanie zamiast kilku.
const zoomSteps = (page: Page, delta: 1 | -1, count: number) =>
  page.evaluate(
    ({ delta, count }) => {
      for (let i = 0; i < count; i++) window.dispatchEvent(new CustomEvent('atlas:zoom', { detail: { delta } }));
    },
    { delta, count }
  );

test.describe('Poziom mapy z zoomu (@S17)', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&l=gmi');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.level === 'gmi');
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating !== true);
  });

  test('start ?l=gmi przy zoomie Polski → po ruchu mapy poziom woj, adres ?l=woj (@S17)', async ({ page }) => {
    expect(await zoomOf(page)).toBeLessThan(6.3);
    const historyBefore = await historyLength(page);

    // Gest użytkownika: przesunięcie mapy strzałką (fokus na mapie).
    await page.locator('[aria-label="Mapa Polski"]').first().focus();
    await page.keyboard.press('ArrowRight');

    await expect.poll(() => levelOf(page)).toBe('woj');
    expect(new URL(page.url()).searchParams.get('l')).toBe('woj');
    expect(await historyLength(page)).toBe(historyBefore);
  });

  test('przybliżenie do zoomu ≥ 8.5 → gmi, bez nowych wpisów w historii (@S17)', async ({ page }) => {
    const historyBefore = await historyLength(page);
    await page.locator('[aria-label="Mapa Polski"]').first().focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => levelOf(page)).toBe('woj');

    await zoomSteps(page, 1, 6);
    await expect.poll(() => zoomOf(page)).toBeGreaterThanOrEqual(8.5);

    await expect.poll(() => levelOf(page)).toBe('gmi');
    expect(new URL(page.url()).searchParams.get('l')).toBe('gmi');
    expect(await historyLength(page)).toBe(historyBefore);
  });

  test('oddalenie z gmin wraca do województw (@S17)', async ({ page }) => {
    const start = await zoomOf(page);
    await zoomSteps(page, 1, 6);
    await expect.poll(() => zoomOf(page)).toBeGreaterThanOrEqual(8.5);
    await expect.poll(() => levelOf(page)).toBe('gmi');

    // Powrót do zoomu całej Polski (minZoom zatrzyma nadmiarowe kroki).
    await zoomSteps(page, -1, 8);
    await expect.poll(() => zoomOf(page)).toBeLessThanOrEqual(start);
    await expect.poll(() => levelOf(page)).toBe('woj');
  });
});
