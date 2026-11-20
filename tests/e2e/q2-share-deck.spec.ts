import { test, expect } from '@playwright/test';

// Okno udostępniania z panelu wskaźnika: dane mają tylko mapa i ranking, więc menu „Dodaj stronę” oferuje tylko te rodzaje.
async function openShare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => sessionStorage.setItem('atlas-share', '1'));
  await page.goto('/?i=density&l=pow');
  const panel = page.locator('aside[aria-label="Panel wskaźnika"]');
  await expect(panel).toBeVisible({ timeout: 15000 });
  await panel.getByRole('button', { name: 'Pobierz i udostępnij mapę' }).click();
  const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
  await expect(dialog).toBeVisible();
  return dialog;
}

// Menu „Dodaj stronę” to osobny popover poza oknem udostępniania.
const menu = (page: import('@playwright/test').Page) => page.locator('[data-radix-popper-content-wrapper]');

test.describe('Okno udostępniania: pasek stron i CSV zestawu (@S19)', () => {
  test('z 1 stroną brak „Pobierz CSV zestawu”, po dodaniu 2. strony jest', async ({ page }) => {
    const dialog = await openShare(page);
    const strip = dialog.getByRole('group', { name: 'Strony zestawu' });
    // Panel wskaźnika startuje z zestawem mapa + ranking: z 2 stronami przycisk jest, po usunięciu jednej znika.
    await expect(strip.locator('[data-strip-tile]')).toHaveCount(2);
    await expect(dialog.getByRole('button', { name: 'Pobierz CSV zestawu' })).toBeVisible();
    await strip.getByRole('button', { name: /^Usuń stronę 2/ }).click();
    await expect(strip.locator('[data-strip-tile]')).toHaveCount(1);
    await expect(dialog.getByRole('button', { name: 'Pobierz CSV zestawu' })).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Dodaj stronę' }).click();
    await menu(page).getByRole('button', { name: 'Mapa', exact: true }).click();

    await expect(strip.locator('[data-strip-tile]')).toHaveCount(2);
    await expect(dialog.getByRole('button', { name: 'Pobierz CSV zestawu' })).toBeVisible();
  });

  test('menu „Dodaj stronę” nie oferuje rodzajów bez danych', async ({ page }) => {
    const dialog = await openShare(page);
    await dialog.getByRole('button', { name: 'Dodaj stronę' }).click();

    await expect(menu(page).getByRole('button', { name: 'Mapa', exact: true })).toBeVisible();
    await expect(menu(page).getByRole('button', { name: 'Ranking – najwyżej', exact: true })).toBeVisible();
    for (const name of ['Profil', 'Porównanie', 'A vs B', 'Tabela', 'Duża liczba', 'Wykres lat', 'Rozkład']) {
      await expect(menu(page).getByRole('button', { name, exact: true })).toHaveCount(0);
    }
  });
});
