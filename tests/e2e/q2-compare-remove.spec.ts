import { test, expect, type Page } from '@playwright/test';
import availableFixture from '../fixtures/library/available.json' with { type: 'json' };

// Porównaj: wiersz ze wskaźnika z biblioteki znika po × i nie wraca po odświeżeniu (@S21 QT01)
const KEY = 'faktografia-my-indicators';
const LIB_ID = 'b101';
const LIB_NAME = 'Liczba ludności ogółem';
const URL = '/porownaj?c=1261,0264';

// Wartości z fixture’a (powiat Kraków, powiat Wrocław), bez sieci
const valuesBody = {
  v: '101',
  l5: { y: [2023, 2024], d: { '011212161000': [800000, 810000], '030210564000': [640000, 650000] } },
};

async function prepare(page: Page) {
  await page.addInitScript(
    ([key, id]) => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      // Lista startowa tylko raz: po × i odświeżeniu nie nadpisujemy zapisu przeglądarki
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(['population', 'density', id]));
      }
    },
    [KEY, LIB_ID],
  );
  await page.route('**/available.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(availableFixture) }),
  );
  await page.route('**/values/101.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(valuesBody) }),
  );
}

const stored = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null') as string[] | null, KEY);

test.describe('Porównaj: × usuwa wiersz z biblioteki (@S21)', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test('@S21 × usuwa wiersz, localStorage bez id, po odświeżeniu wiersza nie ma', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL);
    await expect(page.getByTestId('comparison-result')).toBeVisible();

    const row = page.locator('[data-slot="compare-row"]').filter({ hasText: LIB_NAME });
    await expect(row).toHaveCount(1);

    await page.getByRole('button', { name: `Usuń wiersz: ${LIB_NAME}` }).click();

    await expect(row).toHaveCount(0);
    await expect.poll(() => stored(page)).not.toContain(LIB_ID);
    expect(await stored(page)).toEqual(['population', 'density']);

    await page.reload();
    await expect(page).toHaveURL(/c=1261(%2C|,)0264/);
    await expect(page.getByTestId('comparison-result')).toBeVisible();
    await expect(page.locator('[data-slot="compare-row"]').filter({ hasText: LIB_NAME })).toHaveCount(0);
    expect(await stored(page)).not.toContain(LIB_ID);
  });

  test('@S21 układ 390 px: × ma co najmniej 44 px, bez przewijania w poziomie', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await expect(page.getByTestId('comparison-result')).toBeVisible();

    const row = page.locator('[data-slot="compare-row"]').filter({ hasText: LIB_NAME });
    await expect(row).toHaveCount(1);

    const remove = page.getByRole('button', { name: `Usuń wiersz: ${LIB_NAME}` });
    const box = await remove.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    const noHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
    expect(noHScroll).toBe(true);
  });
});
