import { test, expect } from '@playwright/test';

// N-06: pole „Szukaj jednostki” na /rankingi filtruje listę (@S21)
for (const vp of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`@S21 /rankingi: szukanie jednostki filtruje listę (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/rankingi');
    const items = page.locator('main ul li');
    await expect(items).toHaveCount(10);

    const input = page.getByLabel('Szukaj jednostki');
    await input.fill('slask');
    // „zawiera” łapie też dolnośląskie, więc 2 pozycje (województwa śląskie i dolnośląskie)
    await expect(items).toHaveCount(2);
    for (const t of await items.allTextContents()) expect(t).toContain('śląskie');

    await input.fill('xyz');
    await expect(page.getByText(/Brak jednostek pasujących/)).toBeVisible();
    await expect(items).toHaveCount(0);

    await input.fill('');
    await expect(items).toHaveCount(10);
    await expect(page.getByText(/Brak jednostek pasujących/)).toHaveCount(0);

    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
}
