import { test, expect, type Page } from '@playwright/test';

// @F04 Strona Rankingi: pełne menu wskaźników, poziom, województwo, „Najwyższe | Najniższe”, lista z nazwami i klik w wiersz.
async function setup(page: Page, width = 1280) {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(() => localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() })));
}

const firstRowName = (page: Page) => page.locator('[data-slot="rankings-row"]').first().locator('span').first().innerText();

for (const width of [390, 1280]) {
  test(`@F04 ranking na /zestawienia: lista z nazwami, kolejność i poziom zmieniają listę, klik otwiera mapę (${width})`, async ({ page }) => {
    await setup(page, width);
    await page.goto('/zestawienia?i=population&l=pow&e2e');
    const rows = page.locator('[data-slot="rankings-row"]');
    await expect(rows).toHaveCount(50);
    const top = await firstRowName(page);
    expect(top).not.toMatch(/^\d+$/); // nazwa, nie kod TERYT

    await page.getByRole('group', { name: 'Który koniec skali' }).getByRole('button', { name: 'Najniższe' }).click();
    await expect(page).toHaveURL(/d=low/);
    await expect.poll(() => firstRowName(page)).not.toBe(top);

    await page.getByLabel('Województwo').selectOption({ index: 1 });
    await expect(page).toHaveURL(/w=\d\d/);
    expect(await rows.count()).toBeLessThan(50);

    await page.getByRole('group', { name: 'Poziom' }).getByRole('button', { name: 'Województwa' }).click();
    await expect(rows).toHaveCount(16);

    await rows.first().click();
    await expect(page).toHaveURL(/\/mapa\?i=population.*u=\d{2}/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test('@F04 ranking na /zestawienia: „Wybierz dane” otwiera pełne menu, wybór zmienia wskaźnik rankingu', async ({ page }) => {
  await setup(page);
  await page.goto('/zestawienia?i=population&e2e');
  await page.locator('[data-slot="rankings-pick"]').click();
  const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
  await expect(dialog.getByRole('navigation', { name: 'Działy' })).toBeVisible();
  await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('Ludność ogółem');
  await dialog.getByRole('button', { name: /Ludność ogółem/ }).first().click();
  await expect(page).toHaveURL(/i=population/);
  await expect(page.getByRole('heading', { name: 'Lista jednostek' })).toBeVisible();
});

test('@F04 ranking na /zestawienia: szukajka po nazwie i numeracja stron pod listą', async ({ page }) => {
  await setup(page);
  await page.goto('/zestawienia?i=population&l=gmi&e2e');
  await expect(page.locator('[data-slot="rankings-row"]')).toHaveCount(50);
  await page.getByRole('button', { name: 'Następna' }).click();
  await expect(page).toHaveURL(/p=2/);
  await page.getByRole('searchbox', { name: 'Szukaj jednostki' }).fill('Gdańsk');
  await expect(page.locator('[data-slot="rankings-row"]').first()).toContainText('Gdańsk');
  await expect(page).not.toHaveURL(/p=2/);
});
