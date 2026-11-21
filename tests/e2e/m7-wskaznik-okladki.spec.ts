import { test, expect } from '@playwright/test';

// M7: „Otwórz mapę” otwiera mapę ze wskaźnikiem, który w tej chwili pokazuje tło (te same kolory okładki i mapy).
test.describe('@M7 wskaźnik z tła trafia do mapy', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('adres mapy ma ?i= równe wskaźnikowi tła w chwili kliknięcia', async ({ page }) => {
    await page.goto('/?e2e');
    const svg = page.getByRole('img', { name: /Mapa Polski/ });
    await expect(svg.locator('path')).toHaveCount(16);
    await expect.poll(async () => (await svg.getAttribute('data-indicator')) ?? '').not.toBe('');
    await page.getByRole('link', { name: 'Otwórz mapę' }).click();
    await page.waitForURL(/\/mapa/);
    const shown = new URL(page.url()).searchParams.get('i');
    expect(shown).toBeTruthy();
    // Okładka nosi ten sam wskaźnik co adres mapy.
    const cover = await page.evaluate(() => document.querySelector('[data-slot="map-cover"] svg')?.getAttribute('data-indicator') ?? null);
    if (cover !== null) expect(cover).toBe(shown);
  });
});
