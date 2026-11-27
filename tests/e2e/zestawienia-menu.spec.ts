import { test, expect, type Page } from '@playwright/test';

// @F03 Okno „Wybierz dane” (logo, „Wróć”, brak zbędnego paska) i spis /zestawienia z tym samym menu co mapa.
async function setup(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(() => localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() })));
}

/** Najbliższy przewijany przodek (okno nie powinno mieć własnego paska, gdy listy mieszczą się w kolumnach). */
const windowOverflows = (page: Page) =>
  page.evaluate(() => {
    const grid = document.querySelector('[data-slot="data-menu-window"] .data-menu-grid') as HTMLElement;
    let el = grid.parentElement as HTMLElement | null;
    while (el && getComputedStyle(el).overflowY !== 'auto') el = el.parentElement;
    return el ? el.scrollHeight > el.clientHeight + 1 : false;
  });

for (const height of [800, 650]) {
  test(`@F03 okno „Wybierz dane” na komputerze: logo, „Wróć”, kółko przewija obie kolumny, okno bez własnego paska (${height})`, async ({ page }) => {
    await setup(page, 1280, height);
    await page.goto('/mapa?menu=dane&e2e');
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-slot="window-logo"]')).toHaveAttribute('href', '/');
    expect(await windowOverflows(page)).toBe(false);

    // Dział → grupy → „Wróć” cofa o jeden poziom, aż do listy wszystkich działów.
    await dialog.getByRole('button', { name: /^Gospodarka mieszkaniowa/ }).click();
    const right = dialog.locator('section[aria-label="Wskaźniki"]');
    await expect(right.locator('[data-slot="data-menu-back"]')).toBeVisible();
    await right.getByRole('button', { name: /^Zasoby mieszkaniowe/ }).click();
    await right.locator('[data-slot="data-menu-back"]').click();
    await expect(right.getByRole('button', { name: /^Zasoby mieszkaniowe/ })).toBeVisible();
    await right.locator('[data-slot="data-menu-back"]').click();
    await expect(right).toContainText('Wybierz dział z listy');

    // Każdy wiersz działu ma pełną wysokość (nie kurczy się i nie nachodzi na sąsiada).
    const rows = dialog.getByRole('navigation', { name: 'Działy' }).getByRole('button');
    const boxes = await Promise.all((await rows.all()).map(async (r) => ({ b: (await r.boundingBox())!, h: await r.evaluate((e) => e.scrollHeight) })));
    for (const { b, h } of boxes) expect(Math.round(b.height)).toBeGreaterThanOrEqual(Math.min(h, 44));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.b.y).toBeGreaterThanOrEqual(boxes[i - 1]!.b.y + boxes[i - 1]!.b.height - 1);

    // Długa lista po prawej przewija się kółkiem myszy.
    await dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('Wskaźnik');
    await expect(right.getByRole('button').nth(5)).toBeVisible();
    const box = (await right.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 120);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => right.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  });
}

test('@F03 logo w oknie prowadzi na stronę startową', async ({ page }) => {
  await setup(page);
  await page.goto('/mapa?menu=dane&e2e');
  await page.locator('[data-slot="window-logo"]').click();
  await expect(page).toHaveURL(/\/(\?|$)/);
});

for (const width of [390, 1280]) {
  test(`@F03 spis /zestawienia: pełny nagłówek i stopka, to samo menu „Wybierz dane”, wybór pokazuje „Pokaż ranking” i mapę (${width})`, async ({ page }) => {
    await setup(page, width);
    await page.goto('/zestawienia?e2e');
    await expect(page.getByRole('heading', { level: 1, name: 'Tematy i zestawienia' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faktografia – strona główna' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toContainText('Skąd są dane');
    const menu = page.locator('[data-slot="discover-menu"]');
    await expect(menu.getByRole('searchbox', { name: 'Szukaj wskaźnika' })).toBeVisible();
    await menu.getByRole('searchbox', { name: 'Szukaj wskaźnika' }).fill('Ludność ogółem');
    await menu.getByRole('button', { name: /Ludność ogółem/ }).first().click();
    const picked = page.locator('[data-slot="discover-picked"]');
    await expect(picked).toContainText('Ludność ogółem');
    await expect(page.getByRole('link', { name: 'Wszystkie rankingi wskaźników' })).toHaveCount(0);
    await expect(picked.getByRole('link', { name: 'Zobacz na mapie' })).toHaveAttribute('href', /\/mapa\?i=population/);
    await picked.getByRole('button', { name: 'Pokaż ranking' }).click();
    await expect(page).toHaveURL(/\/zestawienia\?i=population/);
    await expect(page.getByRole('heading', { name: 'Lista jednostek' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
