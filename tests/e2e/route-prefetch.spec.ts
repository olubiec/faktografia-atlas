import { test, expect } from '@playwright/test';

test.describe('Prefetch kodu podstron (N-11)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  test('najechanie na „Rankingi” pobiera kod przed kliknięciem, klik nie pobiera drugi raz (@S99)', async ({ page }) => {
    const hits: string[] = [];
    page.on('request', (r) => {
      if (/\/Rankings-[^/]*\.js$/.test(new URL(r.url()).pathname)) hits.push(r.url());
    });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForLoadState('networkidle');
    expect(hits).toHaveLength(0);

    const link = page.locator('header nav a', { hasText: 'Rankingi' });
    const req = page.waitForRequest((r) => /\/Rankings-[^/]*\.js$/.test(new URL(r.url()).pathname));
    await link.hover();
    await req;
    expect(page.url()).not.toContain('/rankingi');

    await link.click();
    await expect(page.getByText(/Mediana/).first()).toBeVisible();
    expect(hits).toHaveLength(1);
  });

  test('fokus na „Porównaj” pobiera kod podstrony (@S99)', async ({ page }) => {
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    const req = page.waitForRequest((r) => /\/ComparePage-[^/]*\.js$/.test(new URL(r.url()).pathname));
    await page.locator('header nav a', { hasText: 'Porównaj' }).focus();
    await req;
  });
});
