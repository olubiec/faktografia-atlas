import { test, expect, type Locator } from '@playwright/test';

// C05: nagłówek i menu telefonu – brak nakładania, nic poza ekranem, pola ≥ 44 px, menu: Esc i fokus.
const SIZES = [360, 390, 768, 1280];

async function boxes(items: Locator[]) {
  const out = [];
  for (const l of items) {
    if (!(await l.first().isVisible())) continue;
    out.push((await l.first().boundingBox())!);
  }
  return out;
}

for (const width of SIZES) {
  test.describe(`@C05 nagłówek ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('elementy nie nachodzą na siebie, mieszczą się w ekranie i mają ≥ 44 px', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      await page.goto('/mapa?e2e');
      const header = page.locator('header');
      await expect(header.getByRole('button', { name: /Kopiuj link/ })).toBeVisible();
      const items = [
        header.locator('a[aria-label^="Faktografia"]'),
        header.getByRole('link', { name: 'Start' }),
        header.getByRole('link', { name: 'Mapa' }),
        header.getByRole('button', { name: /Kopiuj link/ }),
        header.getByRole('button', { name: 'Szukaj miejsca' }),
        header.getByRole('button', { name: /Motyw:/ }),
        header.getByRole('button', { name: 'Menu' }),
      ];
      const found = await boxes(items);
      expect(found.length).toBeGreaterThanOrEqual(4);
      for (const b of found) {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(width);
        expect(b.height).toBeGreaterThanOrEqual(44 - 0.5);
      }
      // Szerokość ≥ 44 px dotyczy przycisków; linki tekstowe (Start, Mapa) mają min. 44 px wysokości.
      for (const button of await header.getByRole('button').all()) {
        if (await button.isVisible()) expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(44 - 0.5);
      }
      for (let i = 0; i < found.length; i++) {
        for (let j = i + 1; j < found.length; j++) {
          const a = found[i]!;
          const b = found[j]!;
          const apart = a.x + a.width <= b.x + 0.5 || b.x + b.width <= a.x + 0.5 || a.y + a.height <= b.y + 0.5 || b.y + b.height <= a.y + 0.5;
          expect(apart, `elementy ${i} i ${j} nachodzą`).toBe(true);
        }
      }
      const logo = await header.locator('img[alt="Faktografia"]').boundingBox();
      expect(logo!.height).toBeGreaterThanOrEqual(28);
      expect(logo!.height).toBeLessThanOrEqual(48);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}

for (const width of [360, 390]) {
  test(`@C05 menu telefonu ${width}px: otwiera się, Esc zamyka i zwraca fokus, linki bez powtórzeń`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await button.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (const name of ['Start', 'Mapa', 'O projekcie', 'Skąd są dane']) {
      await expect(dialog.getByRole('link', { name, exact: true })).toHaveCount(1);
    }
    for (const link of await dialog.getByRole('link').all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44 - 0.5);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
    await button.click();
    await dialog.getByRole('link', { name: 'O projekcie' }).click();
    await expect(page).toHaveURL(/\/o-projekcie/);
    await expect(dialog).toBeHidden();
  });
}
