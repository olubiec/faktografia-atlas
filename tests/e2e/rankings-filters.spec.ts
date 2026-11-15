import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// N-12: cztery listy na /rankingi sterują rankingiem (@S21)
type Ind = { id: string; name: string; unit: string; group: string; minLevel: string };
const inds: Ind[] = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const firstOf = (g: string) => inds.find((i) => i.group === g)!;

const dataRequests = (page: Page) => {
  const urls: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/data/values/')) urls.push(r.url());
  });
  return urls;
};
const names = async (page: Page) => (await page.locator('main ul li').allTextContents()).map((t) => t.trim());

for (const vp of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test.describe(`@S21 /rankingi: listy wyboru (${vp.width}px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(vp);
    });

    test('start: Ludność, density, Województwa, najnowszy rok, 10 pozycji', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      await expect(page.getByLabel('Wybierz dział')).toHaveValue('Ludność');
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('density');
      await expect(page.getByLabel('Wybierz poziom')).toHaveValue('woj');
      const first = await page.getByLabel('Wybierz rok').locator('option').first().getAttribute('value');
      await expect(page.getByLabel('Wybierz rok')).toHaveValue(first!);
    });

    test('Powiaty: inny zestaw, bez nowego żądania density', async ({ page }) => {
      const urls = dataRequests(page);
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      const woj = await names(page);
      const before = urls.length;
      await page.getByLabel('Wybierz poziom').selectOption({ label: 'Powiaty' });
      await expect.poll(async () => (await names(page)).join('|')).not.toBe(woj.join('|'));
      await expect(page.locator('main ul li')).toHaveCount(10);
      expect(urls.length).toBe(before);
    });

    test('dział Pieniądze: pierwszy wskaźnik działu, 1 żądanie, jednostka w „Najwyżej”', async ({ page }) => {
      const urls = dataRequests(page);
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      const target = firstOf('Pieniądze');
      const before = urls.length;
      await page.getByLabel('Wybierz dział').selectOption('Pieniądze');
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue(target.id);
      await expect(page.getByText(/^Najwyżej:/)).toContainText(target.unit);
      const fresh = urls.slice(before).filter((u) => u.includes(`/data/values/${target.id}.json`));
      expect(fresh).toHaveLength(1);
      expect(urls.length - before).toBe(1);
    });

    test('najstarszy rok pokazuje inne wartości niż najnowszy', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      const latest = await names(page);
      const opts = page.getByLabel('Wybierz rok').locator('option');
      const oldest = await opts.last().getAttribute('value');
      await page.getByLabel('Wybierz rok').selectOption(oldest!);
      await expect.poll(async () => (await names(page)).join('|')).not.toBe(latest.join('|'));
    });

    test('wskaźnik z minLevel pow nie ma opcji Gminy', async ({ page }) => {
      const pow = inds.find((i) => i.minLevel === 'pow')!;
      await page.goto('/rankingi');
      await page.getByLabel('Wybierz dział').selectOption(pow.group);
      await page.getByLabel('Wybierz wskaźnik').selectOption(pow.id);
      const level = page.getByLabel('Wybierz poziom');
      await expect(level.locator('option')).toHaveText(['Województwa', 'Powiaty']);
    });
  });
}
