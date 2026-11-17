import { test, expect } from '@playwright/test';

// A02: klik w logo = czysty widok Polski (jak „Home”), z zachowaniem tylko wskaźnika i roku.
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'telefon', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test(`logo wraca na widok Polski i zostawia tylko wskaźnik (${vp.name}) @S17`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/?l=gmi&u=1465011&compare=a,b&wsk=X&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    await page.locator('header a:has(img[alt="Faktografia"])').click();

    await expect.poll(() => page.evaluate(() => window.location.search)).toContain('wsk=X');
    const params = await page.evaluate(() => Object.fromEntries(new URLSearchParams(window.location.search)));
    expect(params.wsk).toBe('X');
    for (const key of ['l', 'u', 'compare', 'c']) expect(params[key]).toBeUndefined();

    await expect
      .poll(() => page.evaluate(() => (window as any).__atlas?.selected ?? null))
      .toBeNull();
    await expect
      .poll(() => page.evaluate(() => (window as any).__atlas?.choropleth?.level))
      .toBe('woj');
    await expect.poll(() => page.evaluate(() => (window as any).__atlas?.profileOpen)).toBe(false);
  });
}

test('logo zachowuje wskaźnik i rok oraz wariant ?logo=znak @S17', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?i=x&y=2020&u=02&l=pow&logo=znak&e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.locator('header a:has(img[alt="Faktografia"])').click();
  await expect.poll(() => page.evaluate(() => window.location.search)).not.toContain('u=');
  const params = await page.evaluate(() => Object.fromEntries(new URLSearchParams(window.location.search)));
  expect(params.y).toBe('2020');
  expect(params.logo).toBe('znak');
  expect(params.l).toBeUndefined();
});
