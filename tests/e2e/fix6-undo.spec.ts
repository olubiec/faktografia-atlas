import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// „Wróć” tym samym planerem, miękkie lądowanie, wzrost bez szarpnięć – @FIX6E.

type V = { longitude: number; latitude: number; zoom: number };
type Atlas = {
  ready: boolean;
  selected: string | null;
  viewState: V;
  camera: { animating: boolean; trace: V[] };
};
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openMap(page, '?e2e');
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
}

async function search(page: Page, text: string) {
  const trigger = page.locator('#home-search-field');
  if (await trigger.isVisible()) await trigger.click();
  else await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await expect(input).toBeVisible();
  await input.fill(text);
  await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
  await page.keyboard.press('Enter');
}

const settledIn = (page: Page) =>
  page.waitForFunction(() => {
    const a = (window as unknown as { __atlas: Atlas }).__atlas;
    return a.selected !== null && a.camera.animating === false && a.camera.trace.length > 1;
  });

const settledOut = (page: Page) =>
  page.waitForFunction(() => {
    const a = (window as unknown as { __atlas: Atlas }).__atlas;
    return a.selected === null && a.camera.animating === false && a.camera.trace.length > 1;
  });

test.describe('Cofnij z miękkim lądowaniem (@FIX6E)', () => {
  test.setTimeout(90_000);

  test('„Wróć” wraca dokładnie do widoku sprzed wejścia (@FIX6E)', async ({ page }) => {
    await open(page);
    const start = (await atlas(page)).viewState;
    await search(page, 'małopolskie');
    await settledIn(page);
    await page.locator('button', { hasText: 'Wróć' }).click();
    await settledOut(page);
    const end = (await atlas(page)).viewState;
    expect(Math.abs(end.zoom - start.zoom)).toBeLessThan(1e-3);
    expect(Math.abs(end.longitude - start.longitude)).toBeLessThan(1e-4);
    expect(Math.abs(end.latitude - start.latitude)).toBeLessThan(1e-4);
  });

  test('w ostatnich 5 klatkach kroki zoomu maleją do zera (@FIX6E)', async ({ page }) => {
    await open(page);
    await search(page, 'małopolskie');
    await settledIn(page);
    await page.locator('button', { hasText: 'Wróć' }).click();
    await settledOut(page);
    const zooms = (await atlas(page)).camera.trace.map((v) => v.zoom);
    const steps = zooms.slice(1).map((z, i) => Math.abs(z - zooms[i]));
    const last = steps.slice(-5);
    expect(last.length).toBe(5);
    for (let i = 1; i < last.length; i += 1) expect(last[i]).toBeLessThanOrEqual(last[i - 1] + 1e-9);
    expect(last[last.length - 1]).toBeLessThan(0.02);
  });

  test('zmiana jednostki w trakcie jazdy nie robi kroku zoomu > 0,25 (@FIX6E)', async ({ page }) => {
    await open(page);
    await search(page, 'małopolskie');
    await settledIn(page);
    await page.locator('button', { hasText: 'Wróć' }).click();
    await page.waitForFunction(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.animating === true);
    await search(page, 'pomorskie');
    await page.waitForFunction(() => {
      const a = (window as unknown as { __atlas: Atlas }).__atlas;
      return a.selected !== null && a.camera.animating === false;
    });
    const zooms = (await atlas(page)).camera.trace.map((v) => v.zoom);
    const steps = zooms.slice(1).map((z, i) => Math.abs(z - zooms[i]));
    // Złączenie (pierwsze kroki nowego planu) bez szarpnięcia: nowy plan startuje z prędkością 0
    for (const d of steps.slice(0, 2)) expect(d).toBeLessThanOrEqual(0.25);
    // Dalej kroki wynikają z tempa klatek (programowy WebGL jest wolny), ale żaden nie przekracza połowy drogi
    const span = Math.max(...zooms) - Math.min(...zooms);
    for (const d of steps) expect(d).toBeLessThanOrEqual(0.5 * span + 1e-9);
  });
});
