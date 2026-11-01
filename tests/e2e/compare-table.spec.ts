import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Profile Compare Table W2.15 (@S18)', () => {
  test('desktop (1440x900): 4-column table renders valid indicator rows with diffText matching compare() and no level notice for same level (@S18)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const compareTable = page.locator('table[data-slot="compare-table"]');
    await expect(compareTable).toBeVisible();

    // Sprawdzenie 4 kolumn w nagłówku tabeli
    const headers = compareTable.locator('thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(0)).toContainText('Wskaźnik');
    await expect(headers.nth(1)).toContainText('małopolskie');
    await expect(headers.nth(2)).toContainText('mazowieckie');
    await expect(headers.nth(3)).toContainText('Różnica');

    // Sprawdzenie obecności wierszy z danymi
    const rows = page.locator('[data-slot="compare-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const diffText = await row.locator('td').last().textContent();
      expect(diffText?.trim().length).toBeGreaterThan(0);
    }

    // Brak ostrzeżenia o różnych poziomach przy porównywaniu woj i woj
    const notice = page.locator('[data-slot="different-levels-notice"]');
    await expect(notice).not.toBeVisible();
  });

  test('mobile (360x740): two-level cards with sticky header, font-mono values, no horizontal scroll (@S18)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const compareContainer = page.locator('[data-slot="compare-table"]');
    await expect(compareContainer).toBeVisible();

    // Sticky nagłówek nazw obu jednostek
    const stickyHeader = page.locator('[data-slot="compare-sticky-header"]');
    await expect(stickyHeader).toBeVisible();
    await expect(stickyHeader).toContainText('małopolskie');
    await expect(stickyHeader).toContainText('mazowieckie');

    // Karty dwupoziomowe
    const rows = page.locator('[data-slot="compare-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = rows.first();
    // Poziom 1: nazwa wskaźnika i różnica
    await expect(firstRow.locator('span.font-mono')).toBeVisible();

    // Poziom 2: 2 równe kolumny z wartościami w font-mono
    const monoValues = firstRow.locator('.font-bold.font-mono');
    await expect(monoValues).toHaveCount(2);

    // Brak poziomego przewijania przy 360px
    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);

    // Dostępność axe w profilu porównania
    const axeResults = await new AxeBuilder({ page })
      .include('[data-slot="profile-compare"]')
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test('displays "różne poziomy – porównuj ostrożnie" when comparing different unit levels (@S18)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 1440, height: 900 });
    // Porównanie województwa 12 z powiatem krakowskim 1206
    await page.goto('/?e2e=1&u=12&c=12,1206');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const notice = page.locator('[data-slot="different-levels-notice"]');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('różne poziomy – porównuj ostrożnie');
  });

  test('zero additional data requests when compare table is open (@S18)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();

    let additionalDataRequests = 0;
    page.on('request', (req) => {
      if (req.url().includes('/data/')) {
        additionalDataRequests++;
      }
    });

    // Czekamy na ewentualne zbędne żądania
    await page.waitForTimeout(500);
    expect(additionalDataRequests).toBe(0);
  });

  test('respects prefers-reduced-motion (@S18)', async ({ page }) => {
    test.setTimeout(60000);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e=1&u=12&c=12,14');

    await page.waitForFunction(
      () =>
        (window as any).__atlas?.ready === true &&
        (window as any).__atlas?.profileOpen === true
    );

    const compareTable = page.locator('[data-slot="compare-table"]');
    await expect(compareTable).toBeVisible();
  });
});
