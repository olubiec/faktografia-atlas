import { test, expect, type Page } from '@playwright/test';

// Kamera sterowana przez sterownik (bez setState na klatkę) – @FIX6H2.

type Atlas = {
  ready: boolean;
  selected: string | null;
  viewState: { longitude: number; latitude: number; zoom: number };
  camera: { animating: boolean; trace: { zoom: number }[] };
};
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);

async function openDesktop(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
}

/** Wejście w województwo przez wyszukiwarkę (jak w camera.spec.ts). */
async function searchVoivodeship(page: Page) {
  const trigger = page.locator('#home-search-field');
  if (await trigger.isVisible()) await trigger.click();
  else await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await expect(input).toBeVisible();
  await input.fill('małopolskie');
  await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
  await page.keyboard.press('Enter');
}

const settled = (page: Page) =>
  page.waitForFunction(() => {
    const a = (window as unknown as { __atlas: Atlas }).__atlas;
    return a.selected !== null && a.camera.animating === false && a.camera.trace.length > 1;
  });

test.describe('Kamera przez sterownik (@FIX6H2)', () => {
  test.setTimeout(90_000);

  test('wejście w województwo: gęsty ślad, zoom rośnie, koniec = widok mapy (@FIX6H2)', async ({ page }) => {
    await openDesktop(page);
    await searchVoivodeship(page);
    await settled(page);
    const a = await atlas(page);
    const zooms = a.camera.trace.map((v) => v.zoom);
    expect(zooms.length).toBeGreaterThanOrEqual(20);
    for (let i = 1; i < zooms.length; i += 1) expect(zooms[i]).toBeGreaterThanOrEqual(zooms[i - 1] - 1e-9);
    expect(zooms[zooms.length - 1]).toBeCloseTo(a.viewState.zoom, 6);
  });

  test('„Wróć” kończy w widoku początkowym (@FIX6H2)', async ({ page }) => {
    await openDesktop(page);
    const start = (await atlas(page)).viewState;
    await searchVoivodeship(page);
    await settled(page);
    await page.locator('button', { hasText: 'Wróć' }).click();
    await page.waitForFunction(() => {
      const a = (window as unknown as { __atlas: Atlas }).__atlas;
      return a.selected === null && a.camera.animating === false;
    });
    const end = (await atlas(page)).viewState;
    expect(Math.abs(end.zoom - start.zoom)).toBeLessThan(1e-3);
  });

  test('kółko w trakcie animacji przerywa ją i zmienia zoom (@FIX6H2)', async ({ page }) => {
    await openDesktop(page);
    await searchVoivodeship(page);
    await page.waitForFunction(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.animating === true);
    const before = (await atlas(page)).viewState.zoom;
    const box = await page.locator('[aria-label="Mapa Polski"]').boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, 600);
    await page.waitForFunction(
      () => (window as unknown as { __atlas: Atlas }).__atlas.camera.animating === false,
      undefined,
      { timeout: 100 }
    );
    await page.waitForTimeout(800);
    const after = (await atlas(page)).viewState.zoom;
    expect(after).toBeLessThan(before - 0.01);
  });

  test('pomiar klatek „Wróć” przy dławieniu ×4: żadna klatka > 100 ms (@FIX6H2)', async ({ browser }) => {
    test.skip(!process.env.PERF, 'pomiar wydajności: tylko z PERF=1');
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 3 });
    const page = await context.newPage();
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
    const decline = page.getByRole('button', { name: 'Nie', exact: true });
    if (await decline.isVisible().catch(() => false)) await decline.click().catch(() => undefined);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.evaluate(() => {
      const w = window as unknown as { __stamps: number[] };
      w.__stamps = [];
      const tick = (t: number) => {
        w.__stamps.push(t);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.waitForTimeout(500);
    const from = await page.evaluate(() => (window as unknown as { __stamps: number[] }).__stamps.length);
    await page.locator('nav[aria-label="Ścieżka"] button[aria-label="Wróć"]').click();
    await page.waitForTimeout(2500);
    const gaps = await page.evaluate((f) => {
      const s = (window as unknown as { __stamps: number[] }).__stamps.slice(f);
      return s.slice(1).map((t, i) => t - s[i]);
    }, from);
    const sorted = [...gaps].sort((x, y) => x - y);
    console.log(`WYNIK H2 max=${sorted[sorted.length - 1]} p95=${sorted[Math.floor(sorted.length * 0.95)]} n=${gaps.length}`);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(100);
    await context.close();
  });
});
