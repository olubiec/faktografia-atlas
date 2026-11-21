import { test, expect } from '@playwright/test';
import { gzipSync } from 'node:zlib';

// Budżety strony startowej (U07/B07): tylko obrys i start.json, żadnych wartości wskaźników.
test.describe('@B07 budżet strony startowej', () => {
  test('na `/` zero żądań values/, units.json, localities; tylko obrys i start.json mieszczą się w budżecie', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    const urls: string[] = [];
    page.on('request', (req) => urls.push(new URL(req.url()).pathname));
    const bodies = new Map<string, Buffer>();
    page.on('response', async (res) => {
      const p = new URL(res.url()).pathname;
      if (p === '/geo/start-outline.json' || p === '/data/start.json') bodies.set(p, await res.body());
    });

    await page.goto('/?e2e');
    await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
    await page.waitForLoadState('networkidle');

    expect(urls.filter((u) => /\/values\/|units\.json|localities/.test(u))).toEqual([]);
    expect(urls.filter((u) => /\/(data|geo)\//.test(u)).sort()).toEqual(['/data/start.json', '/geo/start-outline.json']);

    const outline = bodies.get('/geo/start-outline.json')!;
    expect(outline.length).toBeLessThanOrEqual(25 * 1024);
    expect(gzipSync(outline).length).toBeLessThanOrEqual(10 * 1024);
    expect(bodies.get('/data/start.json')!.length).toBeLessThanOrEqual(5 * 1024);
  });

  // Liczby orientacyjne (SwiftShader, CPU ×4): werdykt daje telefon właściciela. Test tylko mierzy.
  test('p95 klatki tła mieści się w 33 ms (orientacyjnie, mediana z 3 powtórzeń)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Dławienie CPU działa tylko w Chromium (powód środowiskowy)');
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const runs: number[] = [];
    for (let i = 0; i < 3; i++) {
      await page.goto('/?e2e');
      await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
      const p95 = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const dts: number[] = [];
            let last = performance.now();
            const t0 = last;
            const step = (t: number) => {
              dts.push(t - last);
              last = t;
              if (t - t0 < 3000) requestAnimationFrame(step);
              else {
                dts.sort((a, b) => a - b);
                resolve(dts[Math.floor(dts.length * 0.95)]);
              }
            };
            requestAnimationFrame(step);
          }),
      );
      runs.push(p95);
    }
    runs.sort((a, b) => a - b);
    console.log(`B07 p95 klatki (ms), 3 powtórzenia: ${runs.join(', ')}; mediana ${runs[1]}`);
    expect(runs[1]).toBeLessThanOrEqual(33.5);
  });
});
