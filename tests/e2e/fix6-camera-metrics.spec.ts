import { test, expect, type Browser, type CDPSession, type Page } from '@playwright/test';
import { summarizeFrames, type FrameSummary } from '../../src/core/map/frame-stats';

// Pomiar „przed/po” ruchu kamery z progami FIX6 (@FIX6I). Metoda jak w PF01:
// dławienie CPU ×4, SwiftShader, 390×844. Domyślnie test tylko zbiera i drukuje;
// progi sprawdzane są wyłącznie przy PERF=1 i FIX6_GATE=1.

const THROTTLE_RATE = 4;
const SETTLE_MS = 2500;
const RUNS = 3;
const CENTRE = { x: 195, y: 420 };

/** Progi z §5 research (p-animacja-kamery.md). */
export const GATES = { p95: 33, droppedShare: 0.1, max: 100, zoomStep: 0.25 };

export const medianOf = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Największy skok zoomu między sąsiednimi klatkami. */
export const skokZoomu = (zooms: number[]): number => {
  let max = 0;
  for (let i = 1; i < zooms.length; i += 1) max = Math.max(max, Math.abs(zooms[i] - zooms[i - 1]));
  return max;
};

type Run = FrameSummary & { zoomStep: number };
type Row = { scenario: string; p95: number; droppedShare: number; max: number; zoomStep: number; frames: number };

declare global {
  interface Window {
    __frameStamps?: number[];
    __frameZooms?: number[];
  }
}

/** Próbnik rAF: w tej samej klatce zapisuje znacznik czasu i zoom kamery. */
async function installProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__frameStamps = [];
    window.__frameZooms = [];
    const tick = (t: number) => {
      const atlas = (window as unknown as { __atlas?: { viewState: { zoom: number } } }).__atlas;
      window.__frameStamps?.push(t);
      window.__frameZooms?.push(atlas?.viewState.zoom ?? 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function openPage(browser: Browser, query: string) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window as unknown as { __atlas?: { ready: boolean } }).__atlas?.ready === true);
  // Baner zgody zasłania dół ekranu – odrzucamy go, żeby nie zakłócał ruchu
  const decline = page.getByRole('button', { name: 'Nie', exact: true });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click({ timeout: 5000 }).catch(() => undefined);
  }
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE_RATE });
  return { context, page, cdp };
}

async function pinch(cdp: CDPSession): Promise<void> {
  const pts = (d: number) => [
    { x: CENTRE.x - d, y: CENTRE.y, id: 1 },
    { x: CENTRE.x + d, y: CENTRE.y, id: 2 },
  ];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(20) });
  for (let d = 20; d <= 100; d += 8) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) });
    await new Promise((r) => setTimeout(r, 16));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

const wheel = (count: number, delay: number) => async (page: Page) => {
  await page.mouse.move(CENTRE.x, CENTRE.y);
  for (let i = 0; i < count; i += 1) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(delay);
  }
};

// Na telefonie panel wskaźnika otwiera się dotknięciem paska u dołu ekranu
const openIndicatorSheet = async (page: Page) => {
  await page.getByRole('button', { name: /^Wskaźnik/ }).click();
};

type Scenario = {
  name: string;
  query: string;
  setup?: (page: Page) => Promise<void>;
  action: (page: Page, cdp: CDPSession) => Promise<void>;
};

const SCENARIOS: Scenario[] = [
  { name: 'wheel_x3', query: '?e2e', action: wheel(3, 120) },
  { name: 'pinch', query: '?e2e', action: async (_page, cdp) => pinch(cdp) },
  {
    name: 'cofnij',
    query: '?u=12&e2e',
    // Na telefonie „Wróć” jest strzałką w pasku ścieżki
    action: async (page) => {
      await page.locator('nav[aria-label="Ścieżka"] button[aria-label="Wróć"]').click();
    },
  },
  {
    name: 'powrot_z_powiatow',
    query: '?l=pow&e2e',
    setup: openIndicatorSheet,
    action: async (page) => {
      await page.getByRole('button', { name: 'Województwa' }).click();
      await page.waitForTimeout(SETTLE_MS);
      await page.getByRole('button', { name: 'Powiaty' }).click();
    },
  },
  { name: 'zoom_do_gminy', query: '?e2e', action: wheel(15, 120) },
];

async function measureOnce(browser: Browser, sc: Scenario): Promise<Run> {
  const { context, page, cdp } = await openPage(browser, sc.query);
  if (sc.setup) {
    await sc.setup(page);
    await page.waitForTimeout(1500);
  }
  await installProbe(page);
  await page.waitForTimeout(500);
  const from = await page.evaluate(() => (window.__frameStamps ?? []).length);
  await sc.action(page, cdp);
  await page.waitForTimeout(SETTLE_MS);
  const data = await page.evaluate(
    (f) => ({ stamps: (window.__frameStamps ?? []).slice(f), zooms: (window.__frameZooms ?? []).slice(f) }),
    from
  );
  await context.close();
  return { ...summarizeFrames(data.stamps), zoomStep: skokZoomu(data.zooms) };
}

const rows: Row[] = [];

// Programowy WebGL (SwiftShader), jak w PF01
test.use({ launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] } });

test.describe('Pomiar FIX6 (@FIX6I)', () => {
  test('funkcje pomocnicze: mediana i skok zoomu (@FIX6I)', () => {
    expect(medianOf([3, 1, 2])).toBe(2);
    expect(medianOf([4, 1, 3, 2])).toBe(2.5);
    expect(skokZoomu([5, 5.1, 5.4])).toBeCloseTo(0.3, 10);
  });

  for (const sc of SCENARIOS) {
    test(`pomiar ${sc.name} ×${RUNS}, dławienie CPU ×${THROTTLE_RATE} (@FIX6I)`, async ({ browser }, testInfo) => {
      // Wynik zależy od maszyny i SwiftShader – pomiar tylko na żądanie, nie w CI
      test.skip(!process.env.PERF, 'pomiar wydajności: tylko z PERF=1');
      test.setTimeout(240_000);
      const runs: Run[] = [];
      for (let i = 0; i < RUNS; i += 1) runs.push(await measureOnce(browser, sc));
      const row: Row = {
        scenario: sc.name,
        p95: medianOf(runs.map((r) => r.p95)),
        droppedShare: medianOf(runs.map((r) => r.droppedShare)),
        max: medianOf(runs.map((r) => r.max)),
        zoomStep: medianOf(runs.map((r) => r.zoomStep)),
        frames: medianOf(runs.map((r) => r.frames)),
      };
      rows.push(row);
      console.log(`WYNIK ${JSON.stringify({ ...row, runs })}`);
      await testInfo.attach('fix6-metrics.json', { body: JSON.stringify({ row, runs }, null, 2), contentType: 'application/json' });
      expect(row.frames).toBeGreaterThan(0);
      if (process.env.FIX6_GATE) {
        expect(row.p95).toBeLessThanOrEqual(GATES.p95);
        expect(row.droppedShare).toBeLessThan(GATES.droppedShare);
        expect(row.max).toBeLessThanOrEqual(GATES.max);
        expect(row.zoomStep).toBeLessThanOrEqual(GATES.zoomStep);
      }
    });
  }

  test.afterAll(() => {
    if (rows.length === 0) return;
    console.table(
      rows.map((r) => ({
        scenariusz: r.scenario,
        klatki: r.frames,
        p95: +r.p95.toFixed(1),
        zgubione: `${Math.round(r.droppedShare * 100)}%`,
        max: +r.max.toFixed(1),
        'skok zoomu': +r.zoomStep.toFixed(3),
      }))
    );
  });
});
