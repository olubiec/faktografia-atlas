import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Zmiana poziomu animuje się tak samo w obie strony (reveal na CPU), bez przejść GPU atrybutów – @S21.

type Atlas = {
  ready: boolean;
  reveal: { running: boolean; progress: number };
  fill: { ms: number; dataKey: string };
  layerTransitions: Array<{ id: string; transitionMs: number }>;
};
type Win = { __atlas: Atlas };

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openMap(page, '?e2e');
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
  await page.waitForFunction(() => ((window as unknown as Win).__atlas.fill?.dataKey ?? '') !== '');
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

/** Próbkuje reveal co ~30 ms do końca animacji (limit 15 s); zwraca rozpiętość czasu z running=true i największą przerwę między próbkami. */
const watchReveal = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ sawRunning: boolean; span: number; maxGap: number; endRunning: boolean }>((resolve) => {
        const t0 = performance.now();
        let sawRunning = false;
        let firstRunningAt = -1;
        let lastRunningAt = 0;
        let lastSample = t0;
        let maxGap = 0;
        let running = false;
        const finish = () => {
          clearInterval(id);
          clearTimeout(limit);
          resolve({ sawRunning, span: sawRunning ? lastRunningAt - firstRunningAt : 0, maxGap, endRunning: running });
        };
        const id = setInterval(() => {
          const now = performance.now();
          maxGap = Math.max(maxGap, now - lastSample);
          lastSample = now;
          running = (window as unknown as Win).__atlas.reveal.running;
          if (running) {
            sawRunning = true;
            if (firstRunningAt < 0) firstRunningAt = now - t0;
            lastRunningAt = now - t0;
          } else if (sawRunning) {
            finish();
          }
        }, 30);
        const limit = setTimeout(finish, 15_000);
      }),
  );

async function expectReveal(page: Page, act: () => Promise<void>) {
  const watch = watchReveal(page);
  await act();
  const r = await watch;
  expect(r.sawRunning).toBe(true);
  // 900 ms reveal; przerwa między próbkami to tolerancja na wolny render bez GPU
  expect(r.span).toBeLessThanOrEqual(1200 + r.maxGap);
  expect(r.endRunning).toBe(false);
}

test.describe('Animacja zmiany poziomu (@S21)', () => {
  test.setTimeout(120_000);

  test('przybliżanie i oddalanie: reveal true -> false w obie strony, bez transitions na warstwach (@S21)', async ({ page }) => {
    await open(page);
    await expectReveal(page, () => search(page, 'małopolskie'));
    await expectReveal(page, () => search(page, 'krakowski'));
    await expectReveal(page, () => page.locator('button', { hasText: 'Wróć' }).click());
    await expectReveal(page, () => page.locator('button', { hasText: 'Wróć' }).click());

    const atlas = await page.evaluate(() => (window as unknown as Win).__atlas);
    expect(atlas.fill.ms).toBe(0);
    expect(atlas.layerTransitions.length).toBeGreaterThan(0);
    expect(atlas.layerTransitions.every((l) => l.transitionMs === 0)).toBe(true);
  });
});
