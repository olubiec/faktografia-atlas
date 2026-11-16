import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// N-24: stan /rankingi (wskaźnik, poziom, rok, szukaj) w adresie (@S21)
type Ind = { id: string; group: string };
const inds: Ind[] = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const target = inds.find((i) => i.group !== 'Ludność')!;

const names = async (page: Page) => (await page.locator('main ul li').allTextContents()).map((t) => t.trim());
const best = (page: Page) => page.getByText(/^Najwyżej:/).innerText();

for (const vp of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`@S21 /rankingi: adres (${vp.width}px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
    });

    test('zmiany list i szukania trafiają do adresu, a link odtwarza ten sam widok', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      await page.getByLabel('Wybierz dział').selectOption(target.group);
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue(target.id);
      await page.getByLabel('Wybierz poziom').selectOption('pow');
      const years = await page.getByLabel('Wybierz rok').locator('option').evaluateAll((o) => o.map((x) => (x as HTMLOptionElement).value));
      const year = years[years.length - 1];
      await page.getByLabel('Wybierz rok').selectOption(year);
      await page.getByLabel('Szukaj jednostki').fill('ski');
      await expect(page).toHaveURL(new RegExp(`i=${target.id}`));
      const u = new URL(page.url());
      expect(u.searchParams.get('i')).toBe(target.id);
      expect(u.searchParams.get('l')).toBe('pow');
      expect(u.searchParams.get('y')).toBe(year);
      expect(u.searchParams.get('q')).toBe('ski');

      await expect(page.locator('main ul li').first()).toBeVisible();
      const list = await names(page);
      const top = await best(page);
      await page.goto(u.pathname + u.search);
      await expect(page.getByLabel('Wybierz dział')).toHaveValue(target.group);
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue(target.id);
      await expect(page.getByLabel('Wybierz poziom')).toHaveValue('pow');
      await expect(page.getByLabel('Wybierz rok')).toHaveValue(year);
      await expect(page.getByLabel('Szukaj jednostki')).toHaveValue('ski');
      await expect.poll(() => names(page).then((n) => n.join('|'))).toBe(list.join('|'));
      expect(await best(page)).toBe(top);
    });

    test('nieznany wskaźnik: widok domyślny bez błędu', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/rankingi?i=nieistnieje');
      await expect(page.getByLabel('Wybierz wskaźnik')).toHaveValue('density');
      await expect(page.getByLabel('Wybierz poziom')).toHaveValue('woj');
      await expect(page.locator('main ul li')).toHaveCount(10);
      expect(errors).toEqual([]);
    });

    test('pisanie w szukaj: bez nowych wpisów historii i bez pobrań danych', async ({ page }) => {
      const urls: string[] = [];
      page.on('request', (r) => {
        if (r.url().includes('/data/values/')) urls.push(r.url());
      });
      await page.goto('/rankingi');
      await expect(page.locator('main ul li')).toHaveCount(10);
      const before = await page.evaluate(() => history.length);
      const reqs = urls.length;
      await page.getByLabel('Szukaj jednostki').pressSequentially('slask');
      await expect(page).toHaveURL(/q=slask/);
      expect(await page.evaluate(() => history.length)).toBe(before);
      expect(urls.length).toBe(reqs);
    });
  });
}
