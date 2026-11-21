import { test, expect, type Browser, type CDPSession, type Page } from '@playwright/test';
import { summarizeFrames, type FrameSummary } from '../../src/core/map/frame-stats';
import { openMap } from './helpers/open-map';

// Pomiar płynności kamery przy dławieniu procesora ×4 (≈ średni telefon).
// Liczby zależą od maszyny i od programowego WebGL (SwiftShader) – to pomiar względny.

const THROTTLE_RATE = 4;
const SETTLE_MS = 2500;
const CENTRE = { x: 195, y: 420 };

type Zoomed = { start: number; end: number };
type Row = FrameSummary & { scenario: string; longTasks: number; zoom: Zoomed };

declare global {
  interface Window {
    __frameStamps?: number[];
    __longTasks?: number;
  }
}

/** Próbnik rAF i obserwator długich zadań, instalowany w stronie. */
async function installProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__frameStamps = [];
    window.__longTasks = 0;
    try {
      new PerformanceObserver((list) => {
        window.__longTasks = (window.__longTasks ?? 0) + list.getEntries().length;
      }).observe({ entryTypes: ['longtask'] });
    } catch {
      // brak wsparcia longtask – licznik zostaje 0
    }
    const tick = (t: number) => {
      window.__frameStamps?.push(t);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const readZoom = (page: Page) =>
  page.evaluate(() => (window as unknown as { __atlas: { viewState: { zoom: number } } }).__atlas.viewState.zoom);

async function openPage(browser: Browser, query: string) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await openMap(page, query);
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

async function measure(
  browser: Browser,
  scenario: string,
  query: string,
  action: (page: Page, cdp: CDPSession) => Promise<void>,
  setup?: (page: Page) => Promise<void>
): Promise<Row> {
  const { context, page, cdp } = await openPage(browser, query);
  if (setup) {
    await setup(page);
    await page.waitForTimeout(1500);
  }
  await installProbe(page);
  await page.waitForTimeout(500);
  const startZoom = await readZoom(page);
  const from = await page.evaluate(() => (window.__frameStamps ?? []).length);
  await action(page, cdp);
  await page.waitForTimeout(SETTLE_MS);
  const stamps = await page.evaluate((f) => (window.__frameStamps ?? []).slice(f), from);
  const longTasks = await page.evaluate(() => window.__longTasks ?? 0);
  const endZoom = await readZoom(page);
  await context.close();
  return { scenario, ...summarizeFrames(stamps), longTasks, zoom: { start: startZoom, end: endZoom } };
}

// Na telefonie panel wskaźnika otwiera się dotknięciem paska u dołu ekranu
const openIndicatorSheet = async (page: Page) => {
  await page.getByRole('button', { name: /^Wskaźnik/ }).click();
};

const searchPick = (text: string) => async (page: Page) => {
  await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await input.fill(text);
  await page.locator('div[role="dialog"] [cmdk-item]').first().waitFor();
  await page.keyboard.press('Enter');
};

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

type Scenario = {
  name: string;
  query: string;
  /** Przygotowanie poza oknem pomiaru (np. otwarcie arkusza wskaźnika). */
  setup?: (page: Page) => Promise<void>;
  action: (page: Page, cdp: CDPSession) => Promise<void>;
};

const SCENARIOS: Scenario[] = [
  { name: 'a_wyszukiwarka_wojewodztwo', query: '?e2e', action: searchPick('małopolskie') },
  {
    name: 'b_plus',
    query: '?e2e',
    action: async (page) => {
      await page.locator('[aria-label="Mapa Polski"]').focus().catch(() => undefined);
      await page.keyboard.press('+');
    },
  },
  {
    name: 'c_kolko_x3',
    query: '?e2e',
    action: async (page) => {
      await page.mouse.move(CENTRE.x, CENTRE.y);
      for (let i = 0; i < 3; i += 1) {
        await page.mouse.wheel(0, -100);
        await page.waitForTimeout(120);
      }
    },
  },
  { name: 'd_pinch', query: '?e2e', action: async (_page, cdp) => pinch(cdp) },
  {
    name: 'e_wroc',
    query: '?u=12&e2e',
    action: async (page) => {
      // Na telefonie „Wróć” jest strzałką w pasku ścieżki (przycisk z napisem jest tylko na komputerze)
      await page.locator('nav[aria-label="Ścieżka"] button[aria-label="Wróć"]').click();
    },
  },
  {
    name: 'f_zmiana_wskaznika',
    query: '?e2e',
    setup: openIndicatorSheet,
    action: async (page) => {
      await page.getByRole('option', { name: /Stopa bezrobocia rejestrowanego/ }).click();
    },
  },
  {
    name: 'g_powiaty',
    query: '?e2e',
    setup: openIndicatorSheet,
    action: async (page) => {
      await page.getByRole('button', { name: 'Powiaty' }).click();
    },
  },
];

const rows: Row[] = [];

// Programowy WebGL (SwiftShader), jak w raporcie QC401 – bez niego mapa w headless prawie nie rysuje
test.use({ launchOptions: { args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] } });

test.describe('Pomiar klatek kamery (@P1)', () => {
  test('próbnik rAF na bezczynnej stronie zbiera > 30 klatek w 1 s i p50 < 100 ms (@P1)', async ({ page }) => {
    // Pusta strona bez mapy: sprawdzamy samo narzędzie, nie wydajność aplikacji
    await page.goto('about:blank');
    await installProbe(page);
    await page.waitForTimeout(1000);
    const stamps = await page.evaluate(() => window.__frameStamps ?? []);
    expect(stamps.length).toBeGreaterThan(30);
    expect(summarizeFrames(stamps).p50).toBeLessThan(100);
  });

  for (const sc of SCENARIOS) {
    test(`pomiar ${sc.name} przy dławieniu CPU ×${THROTTLE_RATE} (@P1)`, async ({ browser }, testInfo) => {
      test.skip(!process.env.PERF, 'pomiar wydajności: tylko na żądanie, wynik zależy od maszyny');
      test.setTimeout(120_000);
      const row = await measure(browser, sc.name, sc.query, sc.action, sc.setup);
      rows.push(row);
      console.log(`WYNIK ${JSON.stringify(row)}`);
      await testInfo.attach('camera-frames.json', {
        body: JSON.stringify({ throttle: THROTTLE_RATE, row }, null, 2),
        contentType: 'application/json',
      });
      expect(row.frames).toBeGreaterThan(0);
    });
  }

  test.afterAll(() => {
    if (rows.length === 0) return;
    console.table(
      rows.map((r) => ({
        scenariusz: r.scenario,
        klatki: r.frames,
        'czas ms': Math.round(r.durationMs),
        p50: +r.p50.toFixed(1),
        p95: +r.p95.toFixed(1),
        max: +r.max.toFixed(1),
        dlugie: r.longFrames,
        zgubione: `${Math.round(r.droppedShare * 100)}%`,
        zadania: r.longTasks,
        'zoom od': +r.zoom.start.toFixed(2),
        'zoom do': +r.zoom.end.toFixed(2),
      }))
    );
  });
});
