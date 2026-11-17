import { test, expect, type Page } from '@playwright/test';

/** Zestaw kart w eksporcie porównania: usuwanie (×) i zmiana kolejności przyciskami (@S-share). */

async function openCompareShare(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.goto('/?e2e=1&u=12&c=12,24');
  await page.waitForFunction(
    () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true,
  );
  await page.locator('[data-slot="profile-compare"]').getByRole('button', { name: 'Pobierz i udostępnij' }).click();
  const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('Zestaw kart do pobrania (@S-share)', () => {
  test('porównanie: mapy A i B, tabela, ranking, profile; usunięcie karty zmienia N (@S-share)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCompareShare(page);

    const items = dialog.getByTestId('card-set-item');
    await expect(items).toHaveCount(6);
    await expect(items.nth(0)).toContainText('Mapa');
    await expect(items.nth(0)).toContainText('małopolskie');
    await expect(items.nth(1)).toContainText('śląskie');
    await expect(items.nth(2)).toContainText('Tabela porównawcza');
    await expect(items.nth(3)).toContainText('Ranking');
    await expect(items.nth(4)).toContainText('Profil');
    await expect(dialog.getByTestId('card-set-position')).toHaveText(['1/6', '2/6', '3/6', '4/6', '5/6', '6/6']);

    await dialog.getByRole('button', { name: /^Usuń kartę: Tabela porównawcza/ }).click();
    await expect(items).toHaveCount(5);
    await expect(dialog.getByTestId('card-set-position')).toHaveText(['1/5', '2/5', '3/5', '4/5', '5/5']);
    await expect(dialog.getByTestId('card-set')).not.toContainText('Tabela porównawcza');
    await expect(dialog.getByTestId('card-set-total')).toHaveText('(5)');

    // Przyciski zestawu mają pole dotykowe co najmniej 44 px.
    for (const btn of await dialog.getByTestId('card-set').getByRole('button').all()) {
      const box = await btn.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(43.5);
      expect(box!.width).toBeGreaterThanOrEqual(43.5);
    }
  });

  test('przestawienie w górę/w dół zmienia kolejność i numerację (@S-share)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCompareShare(page);
    const items = dialog.getByTestId('card-set-item');
    await expect(items).toHaveCount(6);

    const firstId = await items.nth(0).getAttribute('data-card-id');
    const secondId = await items.nth(1).getAttribute('data-card-id');
    await items.nth(1).getByRole('button', { name: /^Przesuń wyżej/ }).click();
    await expect(items.nth(0)).toHaveAttribute('data-card-id', secondId!);
    await expect(items.nth(1)).toHaveAttribute('data-card-id', firstId!);

    // Ostatnia karta w górę: numer pozycji 6/6 → 5/6.
    const lastId = await items.nth(5).getAttribute('data-card-id');
    await items.nth(5).getByRole('button', { name: /^Przesuń wyżej/ }).click();
    const moved = dialog.locator(`[data-card-id="${lastId}"]`);
    await expect(moved.getByTestId('card-set-position')).toHaveText('5/6');

    // Na krawędziach przyciski są wyłączone.
    await expect(items.nth(0).getByRole('button', { name: /^Przesuń wyżej/ })).toBeDisabled();
    await expect(items.nth(5).getByRole('button', { name: /^Przesuń niżej/ })).toBeDisabled();

    // Wybór karty z zestawu pokazuje ją w podglądzie z numerem n/N.
    await items.nth(0).getByRole('button', { name: /^1\/6/ }).click();
    await expect(dialog.getByRole('img', { name: 'Podgląd karty, strona 1/6' })).toContainText('śląskie');
  });
});
