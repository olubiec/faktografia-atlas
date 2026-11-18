import { test, expect, type Page } from '@playwright/test';

// Strona Porównaj: dwa pola wyboru, „Zamień miejsca”, nazwy w nagłówkach (@Q QC203)
const CRACOW = '1261';
const WROCLAW = '0264';

async function pick(page: Page, label: string, query: string) {
  const input = page.getByRole('combobox', { name: label });
  await input.fill(query);
  await expect(page.getByRole('listbox', { name: label }).getByRole('option').first()).toBeVisible();
  await input.press('Enter');
}

const codes = (search: string) => decodeURIComponent(new URL(search).search);

test.describe('Porównaj: składanie strony (@Q)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
  });

  test('@Q wejście na /porownaj: dwa pola, brak tabeli', async ({ page }) => {
    await page.goto('/porownaj');
    await expect(page.getByRole('combobox', { name: 'Miejsce A' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Miejsce B' })).toBeVisible();
    await expect(page.getByTestId('comparison-result')).toHaveCount(0);
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('@Q wybór dwóch miejsc ustawia ?c=, pokazuje tabelę z nazwami, nie kodami', async ({ page }) => {
    await page.goto('/porownaj');
    await pick(page, 'Miejsce A', 'Kraków');
    await pick(page, 'Miejsce B', 'Wrocław');
    await expect(page.getByTestId('comparison-result')).toBeVisible();
    const [a, b] = codes(page.url()).replace('?c=', '').split(',');
    expect(a.startsWith(CRACOW)).toBe(true);
    expect(b.startsWith(WROCLAW)).toBe(true);
    const header = page.locator('thead');
    await expect(header).toContainText('Kraków');
    await expect(header).toContainText('Wrocław');
    await expect(header).not.toContainText(/\d{7}/);
    await expect(header).not.toContainText(/TERYT/);
  });

  test('@Q „Zamień miejsca” odwraca kolejność w adresie i w nagłówkach', async ({ page }) => {
    await page.goto(`/porownaj?c=${CRACOW},${WROCLAW}`);
    await expect(page.getByTestId('comparison-result')).toBeVisible();
    const swap = page.getByRole('button', { name: 'Zamień miejsca' });
    const box = await swap.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    await swap.click();
    await expect(page).toHaveURL(new RegExp(`c=${WROCLAW}(%2C|,)${CRACOW}`));
    const text = await page.locator('[data-slot="compare-table"]').first().innerText();
    expect(text.indexOf('Wrocław')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('Wrocław')).toBeLessThan(text.indexOf('Kraków'));
  });

  test('@Q × przy B: komunikat, tabela znika, adres ?c=A', async ({ page }) => {
    await page.goto(`/porownaj?c=${CRACOW},${WROCLAW}`);
    await expect(page.getByTestId('comparison-result')).toBeVisible();
    await page.getByRole('button', { name: 'Wyczyść Miejsce B' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Wybierz drugie miejsce' })).toBeVisible();
    await expect(page.getByTestId('comparison-result')).toHaveCount(0);
    await expect(page.locator('table')).toHaveCount(0);
    expect(codes(page.url())).toBe(`?c=${CRACOW}`);
  });

  test('@Q wejście z ?c=A,B od razu pokazuje tabelę', async ({ page }) => {
    await page.goto(`/porownaj?c=${CRACOW},${WROCLAW}`);
    await expect(page.getByTestId('comparison-result')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]').first()).toBeVisible();
  });

  test('@Q powiat + gmina: dopisek o różnych poziomach', async ({ page }) => {
    await page.goto('/porownaj?c=1261,0264011');
    await expect(page.getByText('różne poziomy – porównuj ostrożnie')).toBeVisible();
  });

  test('@Q kliknięcie gotowej pary ustawia oba pola', async ({ page }) => {
    await page.goto('/porownaj');
    await page.getByRole('button', { name: /Warszawa vs Kraków/i }).click();
    await expect(page).toHaveURL(/c=1465(%2C|,)1261/);
    await expect(page.getByText('Gotowe porównania')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyczyść Miejsce A' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyczyść Miejsce B' })).toBeVisible();
    await expect(page.getByTestId('comparison-result')).toBeVisible();
  });
});
