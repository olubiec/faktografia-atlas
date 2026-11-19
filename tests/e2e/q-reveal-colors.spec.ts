import { test, expect, type Page } from '@playwright/test';

// Próbkuje postęp „reveal” co klatkę do jego końca (albo do limitu czasu).
async function sampleReveal(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ values: number[]; ms: number; running: boolean }>((resolve) => {
        const t0 = performance.now();
        const values: number[] = [];
        const tick = () => {
          const r = (window as any).__atlas?.reveal;
          if (r) values.push(r.progress);
          const done = r && r.progress === 1 && !r.running && values.some((v) => v < 1);
          if (done || performance.now() - t0 > 8000) {
            resolve({ values, ms: performance.now() - t0, running: !!r?.running });
          } else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
}

const drillDown = (page: Page) =>
  page.evaluate(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('u', '12');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  });

test.describe('Kafelki i kolory (@Q405)', () => {
  test('wejście w głąb: postęp dochodzi do 1, potem running=false', async ({ page }) => {
    await open(page);
    await drillDown(page);
    const s = await sampleReveal(page);
    expect(s.values.at(-1)).toBe(1);
    expect(s.running).toBe(false);
    // Czasu (< 1 s) i liczby wartości pośrednich nie sprawdzamy: na renderingu programowym (CI, headless)
    // wątek główny potrafi stać kilka sekund, więc taki pomiar byłby losowy. Czas pilnuje test jednostkowy revealPlan.
  });

  test('reduced motion: postęp od razu 1, bez wartości pośrednich', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await drillDown(page);
    const s = await page.evaluate(() => (window as any).__atlas.reveal);
    expect(s.progress).toBe(1);
    expect(s.running).toBe(false);
  });
});
