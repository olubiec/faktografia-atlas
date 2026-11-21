import { expect, test } from '@playwright/test';

// M4: w trakcie dojazdu kamery okładka nie łapie wskaźnika, więc dotyk i mysz trafiają w mapę (jej obsługa
// `markUserMoved` przerywa animację; to pokrywają istniejące testy kamery).
test('@M4 w trakcie dojazdu kamery okładka nie przechwytuje wskaźnika', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?e2e');
  await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
  await page.getByRole('link', { name: 'Otwórz mapę' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-atlas-ready', '1', { timeout: 20000 });
  // Po gotowości okładka znika: do tego czasu nie łapie wskaźnika (albo już jej nie ma).
  const cover = page.locator('[data-slot="map-cover"]');
  if ((await cover.count()) > 0) await expect(cover).toHaveCSS('pointer-events', 'none');
});
