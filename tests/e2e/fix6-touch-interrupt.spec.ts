import { test, expect, type CDPSession, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Pinch i dotyk przerywają animację kamery – @FIX6D.

type Atlas = {
  ready: boolean;
  selected: string | null;
  viewState: { longitude: number; latitude: number; zoom: number };
  camera: { animating: boolean };
};
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);
const CENTRE = { x: 195, y: 420 };

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] },
});

async function open(page: Page) {
  await openMap(page, '?e2e');
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
  const decline = page.getByRole('button', { name: 'Nie', exact: true });
  if (await decline.isVisible().catch(() => false)) await decline.click({ timeout: 5000 }).catch(() => undefined);
}

async function startAnimation(page: Page) {
  await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await input.fill('małopolskie');
  await page.locator('div[role="dialog"] [cmdk-item]').first().waitFor();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.animating === true);
}

const pts = (d: number) => [
  { x: CENTRE.x - d, y: CENTRE.y, id: 1 },
  { x: CENTRE.x + d, y: CENTRE.y, id: 2 },
];

async function pinch(cdp: CDPSession): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(20) });
  // krok geometryczny (×1,1): płynny gest; zoom MapLibre = log2 stosunku odległości palców
  for (let d = 20; d <= 100; d *= 1.1) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) });
    await new Promise((r) => setTimeout(r, 16));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

test.describe('Dotyk i pinch (@FIX6D)', () => {
  test.setTimeout(90_000);

  test('dotyk w trakcie animacji zatrzymuje kamerę w ≤ 100 ms i nie wraca do celu (@FIX6D)', async ({ page }) => {
    await open(page);
    const cdp = await page.context().newCDPSession(page);
    await startAnimation(page);
    await page.waitForTimeout(150);
    // Czas liczymy w stronie (od zdarzenia touchstart do pierwszego odczytu animating === false),
    // bo opóźnienie protokołu CDP w programowym WebGL nie jest opóźnieniem aplikacji
    await page.evaluate(() => {
      const w = window as unknown as { __atlas: Atlas; __stopMs: number | null };
      w.__stopMs = null;
      document.addEventListener(
        'touchstart',
        () => {
          const t0 = performance.now();
          const poll = () => {
            if (!w.__atlas.camera.animating) w.__stopMs = performance.now() - t0;
            else requestAnimationFrame(poll);
          };
          poll();
        },
        { capture: true, once: true }
      );
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: CENTRE.x, y: CENTRE.y, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: CENTRE.x + 12, y: CENTRE.y, id: 1 }] });
    await page.waitForFunction(() => (window as unknown as { __stopMs: number | null }).__stopMs !== null);
    const stopMs = await page.evaluate(() => (window as unknown as { __stopMs: number }).__stopMs);
    expect(stopMs).toBeLessThanOrEqual(100);
    const stopped = (await atlas(page)).viewState;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(1000);
    const later = (await atlas(page)).viewState;
    // kamera nie jedzie dalej do celu: zoom został tam, gdzie ją złapano
    expect(Math.abs(later.zoom - stopped.zoom)).toBeLessThan(0.05);
    expect((await atlas(page)).camera.animating).toBe(false);
  });

  test('pinch: zoom rośnie ≥ 0,5, monotonicznie i bez skoków > 0,25 na klatkę (@FIX6D)', async ({ page }) => {
    await open(page);
    const cdp = await page.context().newCDPSession(page);
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const w = window as unknown as { __atlas: Atlas; __zs: number[] };
      w.__zs = [];
      const tick = () => {
        w.__zs.push(w.__atlas.viewState.zoom);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await pinch(cdp);
    await page.waitForTimeout(1000);
    const zs = await page.evaluate(() => (window as unknown as { __zs: number[] }).__zs);
    const first = zs.findIndex((z) => z !== zs[0]);
    expect(first).toBeGreaterThanOrEqual(0);
    const samples = zs.slice(first);
    expect(samples[samples.length - 1] - samples[0]).toBeGreaterThanOrEqual(0.5);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] - 1e-9);
      expect(samples[i] - samples[i - 1]).toBeLessThanOrEqual(0.25);
    }
  });
});
