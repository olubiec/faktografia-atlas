import { expect, test } from '@playwright/test';

const consent = (page: import('@playwright/test').Page) =>
  page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });

test.describe('@M4b dotyk telefonu 390×844', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('stuknięcie w województwo otwiera mapę z tym województwem', async ({ page }) => {
    await consent(page);
    await page.goto('/?e2e');
    const path = page.locator('svg[data-indicator] path[data-teryt="14"]');
    await expect(path).toHaveCount(1);
    await path.tap();
    await expect(page).toHaveURL(/\/mapa\?.*u=14/);
  });

  test('przeciągnięcie po obrysie przewija stronę i niczego nie otwiera', async ({ page }) => {
    await consent(page);
    await page.goto('/?e2e');
    const path = page.locator('svg[data-indicator] path[data-teryt="14"]');
    await expect(path).toHaveCount(1);
    const b = (await path.boundingBox())!;
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    const cdp = await page.context().newCDPSession(page);
    // Palec przesuwa się w górę o 250 px w 10 krokach (zwykłe przewinięcie strony w dół).
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 25 }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    await expect(page).not.toHaveURL(/\/mapa/);
  });

  test('obrys nie blokuje przewijania w pionie (touch-action: pan-y)', async ({ page }) => {
    await consent(page);
    await page.goto('/?e2e');
    const ta = await page.locator('svg[data-indicator]').evaluate((el) => getComputedStyle(el).touchAction);
    expect(ta).toBe('pan-y');
  });
});

test.describe('@M4b mysz 1440×900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('najechanie podświetla województwo, kliknięcie otwiera mapę z nim', async ({ page }) => {
    await consent(page);
    await page.goto('/?e2e');
    const path = page.locator('svg[data-indicator] path[data-teryt="14"]');
    await expect(path).toHaveCount(1);
    await path.hover();
    await expect(path).toHaveAttribute('data-hot', '1');
    await path.click();
    await expect(page).toHaveURL(/\/mapa\?.*u=14/);
  });

  test('reduced-motion: brak podświetlenia, kliknięcie nadal otwiera mapę', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await consent(page);
    await page.goto('/?e2e');
    const path = page.locator('svg[data-indicator] path[data-teryt="14"]');
    await expect(path).toHaveCount(1);
    await path.hover();
    await expect(path).not.toHaveAttribute('data-hot', '1');
    await path.click();
    await expect(page).toHaveURL(/\/mapa\?.*u=14/);
  });
});
