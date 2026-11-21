import { test, expect } from '@playwright/test';

// M1: okładka po kliknięciu „Otwórz mapę” jest od razu w pełni widoczna (bez przenikania na wejściu).
for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test.describe(`@M1 okładka ${size.width}px`, () => {
    test.use({ viewport: size });

    test('pierwsza klatka okładki ma opacity 1 i leży w kadrze mapy', async ({ page }) => {
      await page.goto('/?e2e');
      await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
      await page.evaluate(() => {
        (window as any).__cover = [];
        const tick = () => {
          const el = document.querySelector('[data-slot="map-cover"]') as HTMLElement | null;
          if (el) (window as any).__cover.push(Number(getComputedStyle(el).opacity));
          if ((window as any).__cover.length < 1) requestAnimationFrame(tick);
        };
        tick();
      });
      await page.getByRole('link', { name: 'Otwórz mapę' }).click();
      await page.waitForFunction(() => (window as any).__cover.length > 0);
      const first: number = await page.evaluate(() => (window as any).__cover[0]);
      expect(first).toBe(1);
    });
  });
}
