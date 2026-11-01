import { test, expect } from '@playwright/test';

test.describe('Responsive Resize and Camera Behavior - W16-M05 (@S16)', () => {
  test.setTimeout(60000);

  test('resizing viewport 1440x900 -> 360x740 -> 1440x900 preserves selected unit and active profile tab without new network requests (@S16)', async ({
    page,
  }) => {
    // 1. Otwórz stronę na pulpicie (1440x900) z wybranym województwem małopolskim (TERYT 12)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const desktopSide = page.locator('[data-slot="side"]');
    await expect(desktopSide).toBeVisible();

    const overviewTab = desktopSide.getByRole('tab', { name: 'Przegląd' });
    await expect(overviewTab).toBeVisible();
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    // 2. Kliknij zakładkę Powiaty
    const powiatyTab = desktopSide.getByRole('tab', { name: /Powiaty \(\d+\)/ });
    await expect(powiatyTab).toBeVisible();
    await powiatyTab.click();
    await expect(powiatyTab).toHaveAttribute('aria-selected', 'true');

    // Sprawdź czy lista powiatów jest widoczna
    await expect(desktopSide.locator('[data-slot="profile-children-list"]')).toBeVisible();

    // 3. Rozpocznij monitorowanie żądań sieciowych /data/*
    let dataRequestsCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/data/')) {
        dataRequestsCount++;
      }
    });

    // 4. Zmień rozmiar okna na urządzenie mobilne (360x740)
    await page.setViewportSize({ width: 360, height: 740 });

    // Czekamy na pojawienie się mobilnego arkusza (BottomSheet)
    const mobileSheet = page.locator('[role="dialog"]');
    await expect(mobileSheet).toBeVisible();

    // Wybrana jednostka jest zachowana (u=12 w adresie i w profilu)
    await expect(page).toHaveURL(/.*u=12/);
    await expect(mobileSheet.getByText('Małopolskie').first()).toBeVisible();

    // Aktywna zakładka Powiaty jest zachowana na telefonie
    const mobilePowiatyTab = mobileSheet.getByRole('tab', { name: /Powiaty \(\d+\)/ });
    await expect(mobilePowiatyTab).toBeVisible();
    await expect(mobilePowiatyTab).toHaveAttribute('aria-selected', 'true');
    await expect(mobileSheet.locator('[data-slot="profile-children-list"]')).toBeVisible();

    // 5. Zmień rozmiar okna z powrotem na pulpit (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });

    // Boczna kolumna jest widoczna, a BottomSheet zniknął
    await expect(desktopSide).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Wybrana jednostka i zakładka Powiaty są nadal aktywne
    await expect(page).toHaveURL(/.*u=12/);
    const desktopPowiatyTabBack = desktopSide.getByRole('tab', { name: /Powiaty \(\d+\)/ });
    await expect(desktopPowiatyTabBack).toBeVisible();
    await expect(desktopPowiatyTabBack).toHaveAttribute('aria-selected', 'true');
    await expect(desktopSide.locator('[data-slot="profile-children-list"]')).toBeVisible();

    // 6. Zero nowych żądań sieciowych podczas zmiany rozmiaru
    expect(dataRequestsCount).toBe(0);
  });

  test('resizing window does not trigger long camera animation (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);

    // Zmiana rozmiaru okna na 360x740
    await page.setViewportSize({ width: 360, height: 740 });

    // Kamera powinna dostosować się w trybie instant (animating === false, brak 600 ms animacji)
    const isAnimatingAfterMobile = await page.evaluate(
      () => (window as any).__atlas?.camera?.animating
    );
    expect(isAnimatingAfterMobile).toBe(false);

    // Zmiana rozmiaru z powrotem na 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });

    const isAnimatingAfterDesktop = await page.evaluate(
      () => (window as any).__atlas?.camera?.animating
    );
    expect(isAnimatingAfterDesktop).toBe(false);
  });

  test('ConsentBar contains safe-area-inset-bottom styling (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?e2e');

    const consentBar = page.locator('div[aria-label="Zgoda na analitykę"]');
    if (await consentBar.isVisible()) {
      const className = await consentBar.getAttribute('class');
      expect(className).toContain('safe-area-inset-bottom');
    }
  });
});
