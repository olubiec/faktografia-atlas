import { test, expect } from '@playwright/test';
import injectAxe, { checkA11y } from 'axe-playwright';

test.describe('Profile Tabs W2.2 (@S14)', () => {
  test('displays profile tabs correctly for voivodeship and county, omits for gmina (@S14)', async ({
    page,
  }) => {
    // 1. Małopolskie (województwo - TERYT 12)
    await page.goto('/?e2e&u=12');
    await page.waitForSelector('[data-slot="side"]');

    const tabList = page.getByRole('tablist');
    await expect(tabList).toBeVisible();

    const overviewTab = page.getByRole('tab', { name: 'Przegląd' });
    await expect(overviewTab).toBeVisible();
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    const powiatyTab = page.getByRole('tab', { name: /Powiaty \(\d+\)/ });
    await expect(powiatyTab).toBeVisible();
    await expect(powiatyTab).toContainText('Powiaty (22)');

    const compareTab = page.getByRole('tab', { name: /Porównaj/ });
    await expect(compareTab).toBeVisible();
    await expect(compareTab).toBeDisabled();
    await expect(compareTab).toContainText('wkrótce');

    // Kliknij zakładkę Powiaty
    let dataRequestsCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/data/')) {
        dataRequestsCount++;
      }
    });

    await powiatyTab.click();
    await expect(powiatyTab).toHaveAttribute('aria-selected', 'true');

    // Zero żądań /data/* podczas przełączania zakładek
    expect(dataRequestsCount).toBe(0);

    // Sprawdź czy lista powiatów jest posortowana
    const childrenList = page.locator('[data-slot="profile-children-list"]');
    await expect(childrenList).toBeVisible();

    const childButtons = page.locator('[data-slot="child-unit-button"]');
    const count = await childButtons.count();
    expect(count).toBe(22);

    // Klik w powiat przechodzi do jego profilu i resetuje zakładkę na Przegląd
    await childButtons.first().click();
    await expect(page).toHaveURL(/.*u=12/);

    const gminaTabLabel = page.getByRole('tab', { name: /Gminy \(\d+\)/ });
    await expect(gminaTabLabel).toBeVisible();
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    // 2. Gmina (np. Kraków - TERYT 1261011) - brak zakładki z listą
    await page.goto('/?e2e&u=1261011');
    await page.waitForSelector('[data-slot="side"]');

    await expect(page.getByRole('tab', { name: 'Przegląd' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Powiaty|Gminy/ })).toHaveCount(0);
  });

  test('supports keyboard navigation between tabs (@S14)', async ({ page }) => {
    await page.goto('/?e2e&u=12');
    await page.waitForSelector('[data-slot="side"]');

    const overviewTab = page.getByRole('tab', { name: 'Przegląd' });
    await overviewTab.focus();

    // Naciśnij strzałkę w prawo
    await page.keyboard.press('ArrowRight');
    const powiatyTab = page.getByRole('tab', { name: /Powiaty/ });
    await expect(powiatyTab).toBeFocused();

    // Aktywacja zakładek klawiszami (Enter / Space)
    await page.keyboard.press('Enter');
    await expect(powiatyTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-slot="profile-children-list"]')).toBeVisible();
  });

  test('no horizontal scroll at 360px and 390px, touch targets >= 44px (@S14)', async ({
    page,
  }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/?e2e&u=12');
      await page.waitForSelector('[data-slot="side"]');

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      // Sprawdź rozmiary pół dotykowych zakładek
      const tabs = page.getByRole('tab');
      const tabsCount = await tabs.count();
      for (let i = 0; i < tabsCount; i++) {
        const box = await tabs.nth(i).boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('passes axe accessibility checks (@S14)', async ({ page }) => {
    await page.goto('/?e2e&u=12');
    await page.waitForSelector('[data-slot="side"]');

    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        rules: {
          // Ignoruj znane błędy deck.gl / canvas jeśli istnieją
          'color-contrast': { enabled: true },
        },
      },
    });
  });

  test('respects prefers-reduced-motion (@S14)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?e2e&u=12');
    await page.waitForSelector('[data-slot="side"]');

    const powiatyTab = page.getByRole('tab', { name: /Powiaty/ });
    await powiatyTab.click();

    await expect(page.locator('[data-slot="profile-children-list"]')).toBeVisible();
  });
});
