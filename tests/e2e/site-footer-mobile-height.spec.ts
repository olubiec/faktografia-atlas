import { test, expect } from '@playwright/test';

// N-33: zwinięta stopka na telefonie ma ≤ 316 px (zapas 4 px wobec limitu 320) (@S1)
for (const [width, height] of [
  [360, 740],
  [390, 844],
] as const) {
  test(`N-33 @S1 stopka na ${width} px: ≤ 316 px, świeżość widoczna i mieści się`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/o-projekcie');
    const footer = page.locator('footer');
    const fresh = footer.getByText(/Dane GUS odświeżone/);
    await expect(fresh).toBeVisible();
    await footer.scrollIntoViewIfNeeded();

    const box = await footer.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(316);

    expect(await fresh.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}

test('N-33 @S1 stopka na komputerze 1280 px: świeżość widoczna w kolumnie z logo', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/o-projekcie');
  const footer = page.locator('footer');
  const fresh = footer.getByText(/Dane GUS odświeżone/);
  await expect(fresh).toBeVisible();
  const logo = footer.getByRole('link', { name: 'Faktografia' }).first();
  const fb = await fresh.boundingBox();
  const lb = await logo.boundingBox();
  // ta sama kolumna (lewa krawędź), świeżość pod logo
  expect(Math.abs(fb!.x - lb!.x)).toBeLessThanOrEqual(2);
  expect(fb!.y).toBeGreaterThan(lb!.y);
});
