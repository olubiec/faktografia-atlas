import { test, expect } from '@playwright/test';

// P1-F: stopka zwijana na telefonie (@S1)
for (const width of [360, 390]) {
  test(`P1-F @S1 stopka zwinięta na ${width} px: niska, bez poziomego przewijania`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('/o-projekcie');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    const details = footer.locator('details');
    await expect(details).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      expect(await details.nth(i).evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
    }

    const box = await footer.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(320);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(overflow).toBe(true);

    // pola dotykowe summary >= 44 px, napisy nie wychodzą poza pola
    const summaries = footer.locator('summary');
    for (let i = 0; i < 3; i++) {
      const b = await summaries.nth(i).boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
      const fits = await summaries.nth(i).evaluate((el) => el.scrollWidth <= el.clientWidth);
      expect(fits).toBe(true);
      await expect(summaries.nth(i)).toHaveAccessibleName(/\S/);
    }
  });
}

test('P1-F @S1 stopka na telefonie: dotknięcie rozwija grupę, klawiatura też', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/o-projekcie');
  const footer = page.locator('footer');
  const first = footer.locator('details').first();
  await footer.locator('summary').first().click();
  expect(await first.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
  const link = first.getByRole('link', { name: 'Rankingi' });
  await expect(link).toBeVisible();
  const b = await link.boundingBox();
  expect(b!.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);

  const second = footer.locator('summary').nth(1);
  await second.focus();
  await page.keyboard.press('Enter');
  expect(await footer.locator('details').nth(1).evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
});

test('P1-F @S1 stopka na komputerze 1280 px: wszystkie grupy rozwinięte i niezwijalne', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/o-projekcie');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Rankingi' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
  // nagłówek nie jest klikalny myszą (pointer-events-none), więc klik programowo
  await footer.locator('summary').first().evaluate((el) => (el as HTMLElement).click());
  expect(await footer.locator('details').first().evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
  await expect(footer.getByRole('link', { name: 'Rankingi' })).toBeVisible();
});

test('P1-F @S1 stopka 768 px: grupy rozwinięte', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/o-projekcie');
  await expect(page.locator('footer').getByRole('link', { name: 'Skąd są dane' })).toBeVisible();
});
