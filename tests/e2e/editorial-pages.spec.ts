import { test, expect } from '@playwright/test';

test.describe('Editorial Pages: O projekcie i Źródła', () => {
  test('O projekcie wyświetla duży znak marki, 4 liczniki i sekcje metodologii', async ({ page }) => {
    await page.goto('/o-projekcie');
    await expect(page.locator('h1')).toContainText('O projekcie');

    // Duży znak marki >= 120 px
    const mark = page.locator('img[alt="Znak Faktografia"]');
    await expect(mark).toBeVisible();
    const box = await mark.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(120);

    // 4 liczniki jednostek
    await expect(page.getByText('16')).toBeVisible();
    await expect(page.getByText('380')).toBeVisible();
    await expect(page.getByText('2477')).toBeVisible();
    await expect(page.getByText('63 960')).toBeVisible();

    // Sekcje metodologii
    await expect(page.getByRole('heading', { name: 'Jak czytać mapę' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pułapki w danych GUS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Dostępność/ })).toBeVisible();
  });

  test('Źródła wyświetlają atrybucje rejestrów i tabelę 20 wskaźników z linkami do mapy', async ({ page }) => {
    await page.goto('/zrodla');
    await expect(page.locator('h1')).toContainText('Źródła danych i rejestry');

    // Atrybucje rejestrów
    await expect(page.getByText('Bank Danych Lokalnych (BDL)')).toBeVisible();
    await expect(page.getByText('Główny Urząd Geodezji i Kartografii (GUGiK)')).toBeVisible();

    // Tabela 20 wskaźników
    const table = page.locator('table[aria-label="Wykaz 20 głównych wskaźników BDL GUS"]');
    await expect(table).toBeVisible();
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(20);

    // Link "Otwórz na mapie"
    const firstMapLink = table.locator('a[href*="/?i="]').first();
    await expect(firstMapLink).toBeVisible();
  });
});
