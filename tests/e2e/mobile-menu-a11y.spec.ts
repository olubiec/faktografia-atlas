import { test, expect, type Page } from '@playwright/test';

// N-16: menu telefonu zamyka się Escape i dotknięciem obok, fokus wraca na „Menu”.
test.use({ viewport: { width: 390, height: 844 } });

async function start(page: Page, url: string) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.goto(url);
}

const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu', exact: true });

test.describe('Menu telefonu: zamykanie i fokus (N-16, @S15)', () => {
  test('otwarcie ustawia aria-expanded i aria-controls na widoczny element (@S15)', async ({ page }) => {
    await start(page, '/rankingi');
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
    const id = await menuButton(page).getAttribute('aria-controls');
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  });

  test('Escape zamyka menu i oddaje fokus przyciskowi Menu (@S15)', async ({ page }) => {
    await start(page, '/rankingi');
    await menuButton(page).click();
    const id = (await menuButton(page).getAttribute('aria-controls'))!;
    await page.keyboard.press('Escape');
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(0);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton(page)).toBeFocused();
  });

  test('dotknięcie treści poza menu zamyka menu (@S15)', async ({ page }) => {
    await start(page, '/rankingi');
    await menuButton(page).click();
    const id = (await menuButton(page).getAttribute('aria-controls'))!;
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    await page.mouse.click(195, 820);
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(0);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('kliknięcie linku w menu przechodzi na stronę i zamyka menu (@S15)', async ({ page }) => {
    await start(page, '/rankingi');
    await menuButton(page).click();
    await page.locator('header a:visible', { hasText: 'Prywatność' }).click();
    await expect(page).toHaveURL(/\/prywatnosc/);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape przy otwartym menu zamyka menu, a profil zostaje otwarty (@S15)', async ({ page }) => {
    await start(page, '/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => (window as any).__atlas?.profileOpen)).toBe(true);
  });
});
