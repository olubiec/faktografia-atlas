import { test, expect } from '@playwright/test';

/** „Udostępnij zestaw” wysyła ten sam zestaw co „Pobierz wszystkie”: bez usuniętych kart, w wybranej kolejności (@S-share). */

test('Udostępnij zestaw pomija usuniętą kartę i zachowuje kolejność (@S-share)', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    // Podmiana systemowego okna udostępniania: zapamiętuje nazwy plików.
    (window as any).__shared = null;
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (d: { files?: File[] }) => {
        (window as any).__shared = (d.files ?? []).map((f) => f.name);
      },
    });
  });
  await page.goto('/?e2e=1&u=12&c=12,24');
  await page.waitForFunction(
    () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true,
  );
  await page.locator('[data-slot="profile-compare"]').getByRole('button', { name: 'Pobierz i udostępnij' }).click();
  const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
  await expect(dialog).toBeVisible();

  const items = dialog.getByTestId('card-set-item');
  await expect(items).toHaveCount(6);
  await dialog.getByRole('button', { name: /^Usuń kartę: Tabela porównawcza/ }).click();
  await expect(items).toHaveCount(5);
  await items.nth(1).getByRole('button', { name: /^Przesuń wyżej/ }).click();

  await dialog.getByRole('button', { name: 'Udostępnij zestaw' }).click();
  await page.waitForFunction(() => (window as any).__shared !== null, null, { timeout: 60000 });
  const names: string[] = await page.evaluate(() => (window as any).__shared);

  expect(names).toHaveLength(5);
  expect(new Set(names).size).toBe(5);
  expect(names.every((n) => n.endsWith('.png'))).toBe(true);
});
