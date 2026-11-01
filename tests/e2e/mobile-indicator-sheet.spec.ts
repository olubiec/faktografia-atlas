import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Mobile Indicator Bar & Sheet (@S15)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
  });

  test('tapping bottom bar opens indicator sheet and selecting an indicator updates ?i= (@S15)', async ({
    page,
  }) => {
    const barButton = page.locator('[data-slot="mobile-indicator-bar"] button').first();
    await expect(barButton).toBeVisible();

    const barBox = await barButton.boundingBox();
    expect(barBox).not.toBeNull();
    if (barBox) {
      expect(barBox.height).toBeGreaterThanOrEqual(48);
    }

    await barButton.click();

    const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
    await expect(sheet).toBeVisible();

    // Wybór wskaźnika wewnątrz arkusza zmienia ?i= i stan mapy
    const pickerButton = sheet.getByRole('button', { name: /^Wskaźnik/ });
    await expect(pickerButton).toBeVisible();
    await pickerButton.click();

    const option = page.getByRole('option', { name: /Stopa bezrobocia rejestrowanego/ });
    await expect(option).toBeVisible();
    await option.click();

    await page.waitForFunction(
      () => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate'
    );
    expect(new URL(page.url()).searchParams.get('i')).toBe('unemployment-rate');

    // Dolny pasek odzwierciedla nowy wskaźnik
    const bottomBar = page.locator('[data-slot="mobile-indicator-bar"]');
    await expect(bottomBar).toContainText('Stopa bezrobocia rejestrowanego');
  });

  test('opening a unit profile automatically closes the indicator sheet (@S15)', async ({
    page,
  }) => {
    const barButton = page.locator('[data-slot="mobile-indicator-bar"] button').first();
    await barButton.click();

    const indicatorSheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
    await expect(indicatorSheet).toBeVisible();

    // Kliknięcie jednostki w rankingu „Najwyżej” w arkuszu otwiera profil jednostki i zamyka arkusz wskaźnika
    const firstRankButton = indicatorSheet
      .getByRole('list', { name: 'Najwyżej' })
      .getByRole('button')
      .first();
    await firstRankButton.scrollIntoViewIfNeeded();
    await expect(firstRankButton).toBeVisible();
    await firstRankButton.click();

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await expect(indicatorSheet).toBeHidden();
  });

  test('indicator sheet closes via close button (×) and passes axe audit (@S15)', async ({
    page,
  }) => {
    const barButton = page.locator('[data-slot="mobile-indicator-bar"] button').first();
    await barButton.click();

    const indicatorSheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
    await expect(indicatorSheet).toBeVisible();

    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(results.violations).toEqual([]);

    const closeBtn = indicatorSheet.getByRole('button', { name: 'Zamknij' });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(indicatorSheet).toBeHidden();
  });
});
