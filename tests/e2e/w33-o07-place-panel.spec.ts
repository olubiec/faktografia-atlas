import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// W33-O07: panel „{Gmina} na tle Polski”. Plik województwa podstawiamy z fixture (nagrane percentyle Maszewa),
// żeby test nie zależał od przebiegu „Fetch data”.
const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);

async function setup(page: Page, width: number) {
  await page.setViewportSize({ width, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    localStorage.setItem('faktografia.place', '3204033');
  });
  const base = JSON.parse(readFileSync('tests/fixtures/facts-roles/maszewo.json', 'utf8'));
  const file = { ...base, generatedAt: '2026-11-27T00:00:00.000Z', near: { '3204033': ['3201011'] } };
  const urls: string[] = [];
  await page.route('**/data/facts/32.json', (route) => {
    urls.push(route.request().url());
    return route.fulfill({ json: file });
  });
  await page.goto('/?e2e');
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  return { section, urls };
}

test.describe('@W33-O07 panel na tle Polski', () => {
  test('@PATH od karty do mapy z rankingiem tego wskaźnika w 1 kliknięciu, z zachowanym miejscem', async ({ page }) => {
    const { section, urls } = await setup(page, 390);
    const panel = section.locator('[data-slot="place-facts"]');
    await expect(panel.getByRole('heading', { name: 'Maszewo na tle Polski' })).toBeVisible();
    await expect(panel.locator('[data-slot="role-card"]')).toHaveCount(4);
    await expect(panel.locator('[data-highlight="korekta"]')).toHaveCount(1);
    expect([...new Set(urls)]).toHaveLength(1);
    const card = panel.locator('[data-role="unusual"]');
    await expect(card).toContainText('1 na 31 mieszkańców');
    const link = card.getByRole('link', { name: 'Ranking gmin' });
    await link.click();
    await expect(page).toHaveURL(/\/mapa\?i=library-readers-per-1000&y=2025&u=3204033&l=gmi/);
    await ready(page);
    const atlas = await page.evaluate(() => (window as any).__atlas);
    expect(atlas.selected).toBe('3204033');
    expect(atlas.choropleth?.indicatorId).toBe('library-readers-per-1000');
  });

  test('na 390 px brak poziomego przewijania, pola dotykowe ≥ 44 px', async ({ page }) => {
    const { section } = await setup(page, 390);
    const panel = section.locator('[data-slot="place-facts"]');
    await expect(panel.locator('[data-slot="role-card"]').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    for (const b of await panel.getByRole('link', { name: 'Ranking gmin' }).all()) {
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('przy prefers-reduced-motion brak animacji w panelu', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const { section } = await setup(page, 390);
    const panel = section.locator('[data-slot="place-facts"]');
    await expect(panel.locator('[data-slot="role-card"]').first()).toBeVisible();
    const animated = await panel.evaluate((el) =>
      [...el.querySelectorAll('*')].filter((n) => {
        // Animacje (keyframes); krótkie przejścia koloru przycisków to element biblioteki, nie ruch treści.
        return getComputedStyle(n).animationName !== 'none';
      }).length,
    );
    expect(animated).toBe(0);
  });
});
