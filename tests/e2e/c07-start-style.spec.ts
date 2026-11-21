import { test, expect, type Page } from '@playwright/test';

const SIZES = [360, 390, 768, 1280] as const;
const THEMES = ['light', 'dark'] as const;

async function openStart(page: Page, theme: (typeof THEMES)[number], width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((th) => {
    localStorage.setItem('faktografia-theme', th);
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    if (th === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, theme);
  await page.goto('/?e2e');
  await expect(page.getByRole('link', { name: 'Otwórz mapę' })).toBeVisible();
}

for (const theme of THEMES) {
  for (const width of SIZES) {
    test.describe(`@C07 strona / ${width}px, motyw ${theme}`, () => {
      test.beforeEach(async ({ page }) => openStart(page, theme, width));

      test('kontrast tekstu ≥ 4,5:1 (wyliczone kolory)', async ({ page }) => {
        const worst = await page.evaluate(() => {
          // Canvas zamienia dowolny zapis koloru (też color-mix, oklab) na sRGB.
          const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
          const rgba = (css: string): [number, number, number, number] => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = '#000';
            ctx.fillStyle = css;
            ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2], d[3] / 255];
          };
          const lum = ([r, g, b]: number[]) => {
            const f = (v: number) => {
              const c = v / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const backdrop = (el: Element): number[] => {
            const layers: [number, number, number, number][] = [];
            for (let n: Element | null = el; n; n = n.parentElement) {
              const bg = rgba(getComputedStyle(n).backgroundColor);
              if (bg[3] > 0) layers.push(bg);
              if (bg[3] === 1) break;
            }
            let out = [255, 255, 255];
            for (const l of layers.reverse()) out = out.map((v, i) => l[i] * l[3] + v * (1 - l[3]));
            return out;
          };
          let min = Infinity;
          let who = '';
          const els = document.querySelectorAll('main h1, main h2, main h3, main p, main li, main a, main span');
          for (const el of els) {
            if (![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent?.trim())) continue;
            const fg = rgba(getComputedStyle(el).color);
            const bg = backdrop(el);
            const [a, b] = [lum(fg), lum(bg)];
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            if (ratio < min) {
              min = ratio;
              who = `${el.tagName} ${el.textContent?.trim().slice(0, 30)}`;
            }
          }
          return { min, who };
        });
        expect(worst.min, worst.who).toBeGreaterThanOrEqual(4.5);
      });

      test('pola dotykowe ≥ 44 px, napisy nie wychodzą poza pola', async ({ page }) => {
        const links = page.locator('main a');
        const n = await links.count();
        expect(n).toBeGreaterThan(3);
        for (let i = 0; i < n; i++) {
          const box = await links.nth(i).boundingBox();
          expect(box!.height, `link ${i}`).toBeGreaterThanOrEqual(44);
          expect(box!.width, `link ${i}`).toBeGreaterThanOrEqual(44);
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
        }
        const overflow = await page.evaluate(() => {
          const bad: string[] = [];
          for (const el of document.querySelectorAll('main a, main h1, main h2, main h3, main p, main li')) {
            // Przycinane „…” (truncate) jest dozwolone: napis nie wychodzi poza pole.
            const own = el as HTMLElement;
            const clipped = getComputedStyle(own).textOverflow === 'ellipsis';
            if (!clipped && own.scrollWidth > own.clientWidth + 1 && getComputedStyle(own).display !== 'inline') {
              bad.push(own.textContent?.slice(0, 30) ?? '');
            }
          }
          return bad;
        });
        expect(overflow).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      });

      test('najwyżej jeden element w kolorze korekta, bez cieni i zaokrągleń', async ({ page }) => {
        const res = await page.evaluate(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const canon = (v: string) => {
            const c = document.createElement('canvas').getContext('2d')!;
            c.fillStyle = '#000';
            c.fillStyle = v;
            return c.fillStyle;
          };
          const targets = ['--korekta', '--korekta-tekst'].map((k) => canon(rootStyle.getPropertyValue(k).trim()));
          let red = 0;
          let shadows = 0;
          let rounded = 0;
          for (const el of document.querySelectorAll('main *')) {
            const s = getComputedStyle(el);
            const hasRed = [s.color, s.backgroundColor, s.borderTopColor, s.outlineColor]
              .some((c, i) => canon(c) !== undefined && targets.includes(canon(c)) && (i < 2 || parseFloat(i === 2 ? s.borderTopWidth : s.outlineWidth) > 0));
            if (hasRed) red++;
            if (s.boxShadow !== 'none') shadows++;
            if (s.borderTopLeftRadius !== '0px') rounded++;
          }
          return { red, shadows, rounded };
        });
        expect(res.red).toBeLessThanOrEqual(1);
        expect(res.shadows).toBe(0);
        expect(res.rounded).toBe(0);
      });

      test('tytuł 800, logo w nagłówku z /brand/ o wysokości 28–40 px', async ({ page }) => {
        const h1 = page.locator('main h1');
        await expect(h1).toHaveText('Faktografia');
        expect(await h1.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('800');
        const logo = page.locator('header img[alt="Faktografia"]').first();
        await expect(logo).toHaveAttribute('src', /^\/brand\//);
        const box = await logo.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(28);
        expect(box!.height).toBeLessThanOrEqual(40);
      });
    });
  }
}

test('@C07 zrzuty: nagłówek i sekcja z przyciskiem (wzorce odświeża CI)', async ({ page }) => {
  test.skip(!process.env.CI, 'Zrzuty tylko w CI (kontener Docker, wzorce z workflow „Update snapshots”)');
  for (const theme of THEMES) {
    await openStart(page, theme, 390);
    const options = { animations: 'disabled' as const, maxDiffPixelRatio: 0.005 };
    await expect(page.locator('main h1')).toHaveScreenshot(`c07-title-${theme}.png`, options);
    await expect(page.locator('main a[data-slot="button"][data-variant="default"]')).toHaveScreenshot(`c07-button-${theme}.png`, options);
  }
});
