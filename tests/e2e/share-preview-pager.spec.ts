import { test, expect, type Page } from '@playwright/test';

/** Podgląd zestawu kart: licznik „n / N”, strzałki, kropki i przesunięcie palcem (@S-share). */

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

/** Domyślnie podgląd pokazuje kartę z przełącznika „Karta” (tu tabelę), więc cofamy się na początek zestawu. */
async function goToFirst(dialog: ReturnType<Page['getByRole']>) {
  const counter = dialog.getByTestId('preview-pager-counter');
  const prev = dialog.getByRole('button', { name: 'Poprzednia karta' });
  while (await prev.isEnabled()) await prev.click();
  await expect(counter).toHaveText(/^1 \/ \d+$/);
}

test.describe('Pager podglądu zestawu (@S-share)', () => {
  test('licznik 1 / N, klik w strzałkę zmienia kartę, kropki i pola dotykowe (@S-share)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCompareShare(page);
    const counter = dialog.getByTestId('preview-pager-counter');
    const preview = dialog.getByTestId('share-preview');

    await goToFirst(dialog);
    await expect(counter).toHaveAttribute('aria-live', 'polite');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    const total = Number((await counter.textContent())!.split('/')[1]);
    expect(total).toBeGreaterThanOrEqual(2);
    await expect(dialog.getByTestId('preview-pager-dot')).toHaveCount(total);

    const firstId = await preview.getAttribute('data-card-id');
    const prev = dialog.getByRole('button', { name: 'Poprzednia karta' });
    const next = dialog.getByRole('button', { name: 'Następna karta' });
    await expect(prev).toBeDisabled();
    for (const btn of [prev, next]) {
      const box = await btn.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(43.5);
      expect(box!.width).toBeGreaterThanOrEqual(43.5);
    }

    await next.click();
    await expect(counter).toHaveText(`2 / ${total}`);
    await expect(preview).not.toHaveAttribute('data-card-id', firstId!);

    await prev.click();
    await expect(counter).toHaveText(`1 / ${total}`);
    await expect(preview).toHaveAttribute('data-card-id', firstId!);
  });

  test('przesunięcie w lewo/prawo po podglądzie zmienia kartę (próg 40 px) (@S-share)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCompareShare(page);
    const counter = dialog.getByTestId('preview-pager-counter');
    const preview = dialog.getByTestId('share-preview');
    await goToFirst(dialog);
    const total = Number((await counter.textContent())!.split('/')[1]);
    const box = (await preview.boundingBox())!;
    const y = box.y + box.height / 2;
    const cx = box.x + box.width / 2;

    // Za krótkie przesunięcie (20 px) nic nie zmienia.
    await page.mouse.move(cx, y);
    await page.mouse.down();
    await page.mouse.move(cx - 20, y, { steps: 4 });
    await page.mouse.up();
    await expect(counter).toHaveText(`1 / ${total}`);

    // Swipe w lewo → następna karta.
    await page.mouse.move(cx + 60, y);
    await page.mouse.down();
    await page.mouse.move(cx - 60, y, { steps: 6 });
    await page.mouse.up();
    await expect(counter).toHaveText(`2 / ${total}`);

    // Swipe w prawo → poprzednia karta.
    await page.mouse.move(cx - 60, y);
    await page.mouse.down();
    await page.mouse.move(cx + 60, y, { steps: 6 });
    await page.mouse.up();
    await expect(counter).toHaveText(`1 / ${total}`);
  });

  test('pojedyncza karta: pager jest ukryty (@S-share)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await page.goto('/?e2e=1&u=12&c=12,24');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.locator('[data-slot="profile-compare"]').getByRole('button', { name: 'Pobierz i udostępnij' }).click();
    const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
    // Usuwamy karty aż zostanie jedna.
    while ((await dialog.getByTestId('card-set-item').count()) > 1) {
      await dialog.getByRole('button', { name: /^Usuń kartę:/ }).first().click();
    }
    await expect(dialog.getByTestId('preview-pager')).toHaveCount(0);
  });
});
