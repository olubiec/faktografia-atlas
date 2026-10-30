import { test, expect } from '@playwright/test';


test.describe('Editorial pages (O projekcie, Zrodla)', () => {
  test('O projekcie renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/o-projekcie');
    await expect(page).toHaveTitle(/Faktografia Atlas/);

    // Check large logo mark
    const logoMark = page.locator('main img[alt="Znak Faktografii"]');
    await expect(logoMark).toBeVisible();
    const box = await logoMark.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(120);

    // Check counters
    await expect(page.getByText('16').locator('..').getByText('województw')).toBeVisible();
    await expect(page.getByText('380').locator('..').getByText('powiatów')).toBeVisible();
    await expect(page.getByText('2477').locator('..').getByText('gmin')).toBeVisible();
    await expect(page.getByText('63 960').locator('..').getByText('zmiennych BDL')).toBeVisible();

    // Check methodology sections
    await expect(page.locator('text=Pułapki w danych GUS')).toBeVisible();
    await expect(page.locator('text=Jak czytać mapę')).toBeVisible();
    await expect(page.locator('text=Deklaracja dostępności')).toBeVisible();
  });

  test('O projekcie renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/o-projekcie');
    await expect(page).toHaveTitle(/Faktografia Atlas/);

    // Check large logo mark
    const logoMark = page.locator('main img[alt="Znak Faktografii"]');
    await expect(logoMark).toBeVisible();
    const box = await logoMark.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(120);

    // Check counters
    await expect(page.getByText('16').locator('..').getByText('województw')).toBeVisible();
    await expect(page.getByText('380').locator('..').getByText('powiatów')).toBeVisible();
    await expect(page.getByText('2477').locator('..').getByText('gmin')).toBeVisible();
    await expect(page.getByText('63 960').locator('..').getByText('zmiennych BDL')).toBeVisible();

    // Check methodology sections
    await expect(page.locator('text=Pułapki w danych GUS')).toBeVisible();
    await expect(page.locator('text=Jak czytać mapę')).toBeVisible();
    await expect(page.locator('text=Deklaracja dostępności')).toBeVisible();
  });

  test('Źródła renders correctly and includes attribution and table', async ({ page }) => {
    await page.goto('/zrodla');
    await expect(page).toHaveTitle(/Faktografia Atlas/);

    // Check attributions
    await expect(page.locator('text=Bank Danych Lokalnych')).toBeVisible();
    await expect(page.locator('text=CC BY 4.0')).toBeVisible();
    await expect(page.locator('text=TERYT SIMC')).toBeVisible();
    await expect(page.locator('text=GUGiK PRNG')).toBeVisible();

    // Check table
    await expect(page.locator('table')).toBeVisible();
    const rows = page.locator('tbody tr');
    expect(await rows.count()).toBe(20);

    // Check links
    const mapLink = page.locator('tbody tr').first().locator('a:has-text("Otwórz na mapie")');
    await expect(mapLink).toBeVisible();

    // Check footer
    await expect(page.locator('footer:has-text("O projekcie")')).toBeVisible();
  });
});
