import { expect, test } from '@playwright/test';
import { openMap } from './helpers/open-map';

// Testy starego okna dodawania wskaźników po kategoriach usunięte: okno zastąpiło „Wybierz dane” (C01), pokrywają je c01-data-window.spec.ts i picker-scroll.spec.ts.

test.describe('FIX4: zoom mapy (@FIX4)', () => {
  test('@FIX4 klawisz „+” przybliża mapę, a „-” oddala (po zmianie obsługi klawiatury)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openMap(page, '?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    const zoom = () => page.evaluate(() => (window as any).__atlas.viewState.zoom as number);
    const before = await zoom();
    await page.getByLabel('Mapa Polski').focus();
    await page.keyboard.press('+');
    await expect.poll(zoom).toBeGreaterThan(before);
    const mid = await zoom();
    await page.keyboard.press('-');
    await expect.poll(zoom).toBeLessThan(mid);
  });
});
