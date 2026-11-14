import { test, expect, type Page } from '@playwright/test';

// Dolny pasek wskaźnika (P1-C @S1): na telefonie pasek nie może być zasłonięty przez pasek zgody.

async function openAtlas(page: Page, consentStorage: 'none' | 'denied') {
  if (consentStorage === 'denied') {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  }
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
}

const bar = (page: Page) => page.locator('[data-slot="mobile-indicator-bar"]');
const consent = (page: Page) => page.locator('[aria-label="Zgoda na analitykę"]');

test.describe('Dolny pasek wskaźnika nad paskiem zgody (P1-C @S1)', () => {
  test('390x844, pierwsza wizyta: oba paski widoczne i nie nakładają się (P1-C @S1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page, 'none');

    await expect(consent(page)).toBeVisible();
    await expect(bar(page)).toBeVisible();

    const barBox = await bar(page).boundingBox();
    const consentBox = await consent(page).boundingBox();
    expect(barBox).not.toBeNull();
    expect(consentBox).not.toBeNull();
    if (barBox && consentBox) {
      // Dolna krawędź paska wskaźnika leży nad górną krawędzią paska zgody
      expect(barBox.y + barBox.height).toBeLessThanOrEqual(consentBox.y + 0.5);
    }
  });

  test('390x844, pierwsza wizyta: nazwa, rok i legenda widoczne, bez ucięcia (P1-C @S1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page, 'none');

    const name = bar(page).locator('button').first().locator('span.font-semibold');
    await expect(name).toBeVisible();
    const fits = await name.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
    expect(fits).toBe(true);

    const year = bar(page).locator('button').first().locator('span.font-mono');
    await expect(year).toBeVisible();

    await expect(bar(page).locator('[data-slot="legend-swatch"]')).toHaveCount(5);
  });

  test('360x740: brak poziomego przewijania i przycisk paska ma min. 44 px (P1-C @S1)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openAtlas(page, 'none');

    const scrollsSideways = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(scrollsSideways).toBe(false);

    const box = await bar(page).locator('button').first().boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('atrapa paska zgody 110 px: pasek wskaźnika podnosi się o jego wysokość (P1-C @S1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page, 'denied');

    // Prawdziwy pasek zgody jest ukryty (odmowa), wstawiamy atrapę 110 px przy dolnej krawędzi
    await page.evaluate(() => {
      const dummy = document.createElement('div');
      dummy.setAttribute('role', 'region');
      dummy.setAttribute('aria-label', 'Zgoda na analitykę');
      dummy.setAttribute('data-testid', 'consent-dummy');
      dummy.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:110px;z-index:40;background:#000;';
      document.body.appendChild(dummy);
    });

    await expect
      .poll(() => bar(page).evaluate((el) => el.style.getPropertyValue('--consent-offset')))
      .toBe('110px');

    const barBox = await bar(page).boundingBox();
    const dummyBox = await page.locator('[data-testid="consent-dummy"]').boundingBox();
    expect(barBox).not.toBeNull();
    expect(dummyBox).not.toBeNull();
    if (barBox && dummyBox) {
      expect(barBox.y + barBox.height).toBeLessThanOrEqual(dummyBox.y + 0.5);
      expect(dummyBox.height).toBe(110);
    }
  });

  test('po zamknięciu paska zgody pasek wraca na dół ekranu (P1-C @S1)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page, 'none');

    await consent(page).getByRole('button', { name: 'Nie' }).click();
    await expect(consent(page)).toHaveCount(0);

    await expect
      .poll(() => bar(page).evaluate((el) => el.style.getPropertyValue('--consent-offset')))
      .toBe('0px');
  });
});
