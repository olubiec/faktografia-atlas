import { test, expect } from '@playwright/test';

// N-13: geometria na telefonie dla pozostałych stron (@S21)
const viewports = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
];
const routes = [
  '/porownaj',
  '/porownaj?c=1465,1261',
  '/zrodla',
  '/biblioteka/60614',
  '/kontakt',
  '/zastrzezenie',
  '/nie-ma-takiej-strony',
];

type Finding = { selector: string; info: string };

for (const vp of viewports) {
  for (const route of routes) {
    test(`@S21 geometria mobilna ${route} (${vp.width}px)`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() }),
        );
      });
      await page.setViewportSize(vp);
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForLoadState('networkidle').catch(() => undefined);

      const result = await page.evaluate(() => {
        const out = {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          small: [] as { selector: string; info: string }[],
          cut: [] as { selector: string; info: string }[],
        };
        const name = (e: Element) =>
          `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}[${(e.textContent ?? '').trim().slice(0, 30)}]`;
        const visible = (e: Element) => {
          const r = e.getBoundingClientRect();
          const s = getComputedStyle(e);
          return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
        };
        document
          .querySelectorAll('main button, main select, main input, main summary')
          .forEach((e) => {
            if (!visible(e)) return;
            const h = e.getBoundingClientRect().height;
            if (h < 44) out.small.push({ selector: name(e), info: `h=${h}` });
          });
        document.querySelectorAll('main a').forEach((e) => {
          if (!visible(e)) return;
          // wyjątek WCAG 2.5.8: link w tekście akapitu, komórce tabeli, elemencie listy
          if (e.closest('p, td, th, li')) return;
          const h = e.getBoundingClientRect().height;
          if (h < 44) out.small.push({ selector: name(e), info: `h=${h}` });
        });
        document
          .querySelectorAll('main h1, main h2, main h3, main p, main li, main td, main th')
          .forEach((e) => {
            if (!visible(e)) return;
            for (let p = e.parentElement; p; p = p.parentElement) {
              const ox = getComputedStyle(p).overflowX;
              if (ox === 'auto' || ox === 'scroll') return;
            }
            if (e.scrollWidth > e.clientWidth + 1)
              out.cut.push({ selector: name(e), info: `scrollWidth=${e.scrollWidth} clientWidth=${e.clientWidth}` });
          });
        return out;
      });

      const fmt = (l: Finding[]) => l.map((f) => `${f.selector} ${f.info}`).join('; ');
      expect(result.scrollWidth, `${route}: scrollWidth ${result.scrollWidth} > innerWidth ${result.innerWidth}`).toBeLessThanOrEqual(result.innerWidth);
      expect(result.small, `${route}: pola < 44 px: ${fmt(result.small)}`).toEqual([]);
      expect(result.cut, `${route}: ucięty tekst: ${fmt(result.cut)}`).toEqual([]);
    });
  }
}
