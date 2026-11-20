import { test, expect, type Page } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers/mobile-audit';

// Strażnik układu mobilnego strony Porównaj (@Q)
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
];

/** Wpisuje frazę w polu i wybiera pierwszą pasującą podpowiedź. */
async function pick(page: Page, id: string, query: string, optionText: string) {
  await page.locator(`#${id}`).fill(query);
  const option = page.getByRole('option').filter({ hasText: optionText }).first();
  await expect(option).toBeVisible();
  await option.click();
}

async function pickKrakowWroclaw(page: Page) {
  await pick(page, 'compare-a', 'Kraków', 'Kraków');
  await pick(page, 'compare-b', 'Wrocław', 'Wrocław');
  await expect(page.getByTestId('comparison-result')).toBeVisible();
}

for (const vp of VIEWPORTS) {
  test.describe(`@Q Porównaj na telefonie ${vp.width}x${vp.height}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/porownaj');
      await expect(page.getByRole('heading', { name: 'Porównaj miejsca' })).toBeVisible();
    });

    test('pole A jest nad polem B, „Zamień miejsca” widoczny i klikalny', async ({ page }) => {
      const a = await page.locator('#compare-a').boundingBox();
      const b = await page.locator('#compare-b').boundingBox();
      expect(a && b).toBeTruthy();
      expect(b!.y).toBeGreaterThan(a!.y + a!.height);
      const swap = page.getByRole('button', { name: 'Zamień miejsca' });
      await expect(swap).toBeVisible();
      await swap.click({ trial: true });
    });

    test('po wyborze Krakowa i Wrocławia strona nie przewija się poziomo', async ({ page }) => {
      await pickKrakowWroclaw(page);
      await expectNoHorizontalScroll(page, 'porownaj');
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw).toBeLessThanOrEqual(vp.width);
      // Tabela może być szersza tylko wewnątrz własnego kontenera przewijania
      const outside = await page.evaluate((w) => {
        const table = document.querySelector('[data-slot="compare-table"]');
        if (!table) return false;
        const region = table.closest('[role="region"]');
        const scrolls = !!region && region.scrollWidth > region.clientWidth;
        return table.getBoundingClientRect().right > w && !scrolls;
      }, vp.width);
      expect(outside).toBe(false);
    });

    test('przyciski, pola i opcje mają co najmniej 44 px', async ({ page }) => {
      await pickKrakowWroclaw(page);
      const small = await page.evaluate(() => {
        const bad: string[] = [];
        document.querySelectorAll('button, input, [role="option"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          if (r.width < 43.5 || r.height < 43.5) {
            const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30);
            bad.push(`${el.tagName} "${name}" ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
          }
        });
        return bad;
      });
      expect(small).toEqual([]);
    });

    test('lista podpowiedzi mieści się na ekranie, pozycje mają min. 44 px', async ({ page }) => {
      await page.locator('#compare-a').fill('Kra');
      const list = page.getByRole('listbox', { name: 'Miejsce A' });
      await expect(list).toBeVisible();
      const box = await list.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
      const options = list.getByRole('option');
      const n = await options.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const o = await options.nth(i).boundingBox();
        expect(o!.height).toBeGreaterThanOrEqual(43.5);
        expect(o!.x + o!.width).toBeLessThanOrEqual(vp.width);
      }
    });

    test('najdłuższa nazwa nie wypycha strony ani nagłówków wyniku', async ({ page }) => {
      await pick(page, 'compare-a', 'kędzierzyńsko', 'kędzierzyńsko-kozielski');
      await pick(page, 'compare-b', 'Wrocław', 'Wrocław');
      await expect(page.getByTestId('comparison-result')).toBeVisible();
      await expectNoHorizontalScroll(page, 'długa nazwa');
      const overflow = await page.evaluate((w) => {
        const bad: string[] = [];
        const sel = '[data-testid="comparison-result"] th, [data-testid="comparison-result"] h2, [data-testid="comparison-result"] h3';
        document.querySelectorAll(sel).forEach((el) => {
          const r = el.getBoundingClientRect();
          const region = el.closest('[role="region"]');
          const inScroll = !!region && region.scrollWidth > region.clientWidth;
          if (r.width > 0 && r.right > w + 0.5 && !inScroll) bad.push(el.textContent?.trim().slice(0, 40) ?? '');
        });
        return bad;
      }, vp.width);
      expect(overflow).toEqual([]);
    });

    test('po fokusie na polu jest ono w obrębie ekranu', async ({ page }) => {
      const input = page.locator('#compare-b');
      await input.focus();
      await input.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const box = await input.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
    });
  });
}
