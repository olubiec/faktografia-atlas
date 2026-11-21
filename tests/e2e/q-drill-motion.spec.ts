import { test, expect, type Page } from '@playwright/test';
import sampleFixture from '../fixtures/prng/sample.json' with { type: 'json' };
import realUnits from '../../public/data/units.json' with { type: 'json' };
import { buildLocalities } from '../../scripts/geo/localities-parse.mjs';
import { openMap } from './helpers/open-map';

// Ruch kamery przy wejściu w głąb i powrocie – @Q404.

type View = { longitude: number; latitude: number; zoom: number };
type Atlas = {
  ready: boolean;
  selected: string | null;
  viewState: View;
  camera: { animating: boolean; trace: View[] };
};
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);
const mockLocalities = buildLocalities(sampleFixture.features, realUnits).localities;

async function open(page: Page, url = '/?e2e') {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('/data/localities.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLocalities) })
  );
  await openMap(page, url.slice(1));
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
}

async function search(page: Page, query: string, group?: string) {
  const trigger = page.locator('#home-search-field');
  if (await trigger.isVisible()) await trigger.click();
  else await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await expect(input).toBeVisible();
  await input.fill(query);
  const scope = group
    ? page.locator('div[role="dialog"] [cmdk-group]').filter({ hasText: group })
    : page.locator('div[role="dialog"]');
  const item = scope.locator('[cmdk-item]').first();
  await expect(item).toBeVisible();
  await item.click();
}

const settled = (page: Page) =>
  page.waitForFunction(() => {
    const a = (window as unknown as { __atlas: Atlas }).__atlas;
    return a.selected !== null && a.camera.animating === false && a.camera.trace.length > 1;
  });

test.describe('Ruch przy wejściu w głąb (@Q404)', () => {
  test.setTimeout(90_000);

  test('województwo: gęsty ślad, zoom niemalejący, koniec = widok mapy (@Q404)', async ({ page }) => {
    await open(page);
    await search(page, 'małopolskie');
    await settled(page);
    const a = await atlas(page);
    const zooms = a.camera.trace.map((v) => v.zoom);
    expect(zooms.length).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < zooms.length; i += 1) expect(zooms[i]).toBeGreaterThanOrEqual(zooms[i - 1] - 1e-9);
    expect(zooms[zooms.length - 1]).toBeCloseTo(a.viewState.zoom, 6);
  });

  test('„Wróć” animuje i kończy w widoku początkowym (@Q404)', async ({ page }) => {
    await open(page);
    const start = (await atlas(page)).viewState;
    await search(page, 'małopolskie');
    await settled(page);
    await page.locator('button', { hasText: 'Wróć' }).click();
    await page.waitForFunction(() => {
      const a = (window as unknown as { __atlas: Atlas }).__atlas;
      return a.selected === null && a.camera.animating === false && a.camera.trace.length > 1;
    });
    const a = await atlas(page);
    expect(a.camera.trace.length).toBeGreaterThanOrEqual(4);
    expect(Math.abs(a.viewState.zoom - start.zoom)).toBeLessThan(1e-6);
    expect(Math.abs(a.viewState.longitude - start.longitude)).toBeLessThan(1e-6);
    expect(Math.abs(a.viewState.latitude - start.latitude)).toBeLessThan(1e-6);
  });

  test('miejscowość: kamera jedzie ≥ 6 klatek do zoomu 11,5 zamiast skoku (@Q404)', async ({ page }) => {
    await open(page);
    const startZoom = (await atlas(page)).viewState.zoom;
    await search(page, 'zakop', 'Miejscowości');
    await page.waitForFunction(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.animating === true);
    await settled(page);
    const a = await atlas(page);
    const zooms = a.camera.trace.map((v) => v.zoom);
    expect(zooms.length).toBeGreaterThanOrEqual(6);
    expect(zooms[0]).toBeCloseTo(startZoom, 6);
    for (let i = 1; i < zooms.length; i += 1) expect(zooms[i]).toBeGreaterThanOrEqual(zooms[i - 1] - 1e-9);
    // Panel profilu otwiera się w trakcie lotu i lekko koryguje cel (≈ ±0,05).
    expect(Math.abs(zooms[zooms.length - 1] - 11.5)).toBeLessThan(0.05);
  });

  test('link ?u= i zmiana rozmiaru okna bez animacji (@Q404)', async ({ page }) => {
    await open(page, '/?e2e&u=12');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    const a = await atlas(page);
    expect(a.camera.animating).toBe(false);
    expect(a.camera.trace.length).toBeLessThanOrEqual(2);
  });

  test('prefers-reduced-motion: miejscowość od razu, bez śladu animacji (@Q404)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await search(page, 'zakop', 'Miejscowości');
    await page.waitForFunction(
      () => Math.abs((window as unknown as { __atlas: Atlas }).__atlas.viewState.zoom - 11.5) < 0.05
    );
    const a = await atlas(page);
    expect(a.camera.animating).toBe(false);
    expect(a.camera.trace.length).toBeLessThanOrEqual(2);
  });
});
