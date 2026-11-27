import { test, expect, type Page } from '@playwright/test';
import availableFixture from '../fixtures/library/available.json' with { type: 'json' };

// @F03 Klik w jednostkę z listy zestawień (także dla wskaźnika z biblioteki) otwiera mapę z jej profilem i tym wskaźnikiem.
async function mock(page: Page) {
  const units = (await (await page.request.get('/data/units.json')).json()) as { level: string; bdlId: string | null }[];
  const d: Record<string, number[]> = {};
  units.filter((u) => u.level === 'pow' && u.bdlId).forEach((u, k) => (d[u.bdlId!] = [100 + k, 100 + k, 100 + k]));
  const body = JSON.stringify({ v: '101', l5: { y: [2022, 2023, 2024], d } });
  await page.route('**/available.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(availableFixture) }));
  await page.route('**/values/101.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body }));
}

test('@F03 klik w powiat z listy wskaźnika z biblioteki otwiera jego profil z tym wskaźnikiem', async ({ page }) => {
  await mock(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() })));
  await page.goto('/?e2e');
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  await section.getByRole('button', { name: /^Wybierz dane · \d+ wskaźnik/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
  await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('Liczba ludności ogółem');
  await dialog.getByRole('button', { name: /Liczba ludności ogółem/ }).first().click();
  const row = section.locator('[data-slot="start-list-row"]').first();
  await expect(row).toBeVisible();
  const name = (await row.locator('[data-slot="start-list-name"]').innerText()).trim();
  await row.click();
  await expect(page).toHaveURL(/\/mapa\?i=b101&.*u=\d+/);
  const profile = page.getByRole('heading', { level: 2 }).filter({ hasText: name });
  await expect(profile.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('TERYT')).toBeVisible();
});
