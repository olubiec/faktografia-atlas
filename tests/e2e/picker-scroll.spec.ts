import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { openMap } from './helpers/open-map';

// Na telefonie (< 768 px) panel wskaźnika jest dolnym arkuszem: najpierw trzeba go otworzyć dolnym paskiem.
// Zwraca panel, w którym są wskaźnik i stopka (arkusz na telefonie, kolumna na komputerze).
async function openPanelIfMobile(page: Page) {
  const bar = page.locator('[data-slot="mobile-indicator-bar"] button').first();
  await expect(page.getByRole('complementary', { name: 'Panel wskaźnika' })).toBeVisible();
  if (await bar.isVisible()) {
    await bar.click();
    const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
    await expect(sheet).toBeVisible();
    return sheet;
  }
  return page.getByRole('complementary', { name: 'Panel wskaźnika' });
}

test.describe('Indicator Picker & Panel Scrolling (@S14)', () => {
  const viewports = [
    { name: '390x844 (mobile)', width: 390, height: 844 },
    { name: '1440x600 (low screen desktop)', width: 1440, height: 600 },
  ];

  for (const { name, width, height } of viewports) {
    test(`@S14 indicator panel scrolls completely so ranking and footer are visible on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openMap(page);
      const panel = await openPanelIfMobile(page);
      await expect(panel).toBeVisible();
      const footerText = panel.getByText(/Źródło: GUS, Bank Danych Lokalnych/i);
      await footerText.scrollIntoViewIfNeeded();
      await expect(footerText).toBeInViewport();
    });
  }

  for (const { name, width, height } of viewports.slice(0, 1)) {
    test(`@S14 indicator picker fits in viewport and scrolls internally to select last indicator on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openMap(page);
      await openPanelIfMobile(page);

      // Menu danych w arkuszu telefonu (DataMenu, układ stack): ma ograniczoną wysokość (do połowy ekranu) i przewija się wewnątrz
      const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
      const menu = sheet.locator('[data-slot="sheet-indicator-picker"]');
      const searchInput = menu.getByRole('searchbox', { name: 'Szukaj wskaźnika' });
      await expect(searchInput).toBeVisible();
      // Okno przesuwa się w trakcie animacji otwierania: czekamy, aż jego dolna krawędź zmieści się w ekranie.
      await expect
        .poll(async () => {
          const box = await menu.locator('[data-slot="sheet-data-menu"]').boundingBox();
          return box ? box.height : null;
        })
        .toBeLessThanOrEqual(height * 0.5 + 2);

      // Ostatni dział → ostatnia grupa → ostatni wskaźnik (każdy przewinięty do widoku)
      const lastSection = menu.getByRole('navigation', { name: 'Działy' }).getByRole('button').last();
      await lastSection.scrollIntoViewIfNeeded();
      await expect(lastSection).toBeVisible();
      await lastSection.click();
      const crumbs = menu.getByRole('navigation', { name: 'Ścieżka' });
      await expect(crumbs).toBeVisible();
      const lastGroup = menu.locator('button.cursor-pointer').filter({ hasNot: page.locator('nav') }).last();
      await lastGroup.scrollIntoViewIfNeeded();
      await lastGroup.click();
      const lastOption = menu.getByRole('list', { name: 'Wskaźniki' }).getByRole('button').last();
      await lastOption.scrollIntoViewIfNeeded();
      await expect(lastOption).toBeVisible();
      await lastOption.click();

      // Po wyborze menu się zwija
      await expect(searchInput).toBeHidden();

      // URL should be updated with new indicator parameter ?i=
      await expect(page).toHaveURL(/\?i=/);
    });
  }

  test('@S14 menu wyboru danych mieści się w oknie 1440x600, a szukajka zostaje widoczna przy przewijaniu', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await openMap(page);
    await page.locator('[data-slot="dialog-trigger"]:not([aria-label="Menu"])').click();
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        return box ? box.y + box.height : null;
      })
      .toBeLessThanOrEqual(600 + 2);
    const searchInput = dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' });
    await dialog.evaluate((el) => {
      el.scrollTop = 300;
    });
    await expect(searchInput).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('@S14 no horizontal scroll at 390px and touch targets are at least 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openMap(page);
    await openPanelIfMobile(page);

    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
    });
    expect(isNotHorizontallyScrollable).toBe(true);

    const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
    const box = await triggerButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Menu danych: pierwszy dział na liście też ma min. 44 px
    const firstSection = page.getByRole('navigation', { name: 'Działy' }).getByRole('button').first();
    await expect(firstSection).toBeVisible();
    const optionBox = await firstSection.boundingBox();
    expect(optionBox).not.toBeNull();
    expect(optionBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('@S14 axe accessibility audit passes with data menu open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page);
    await page.locator('[data-slot="dialog-trigger"]:not([aria-label="Menu"])').click();
    await expect(page.getByRole('dialog', { name: 'Wybierz dane' })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
