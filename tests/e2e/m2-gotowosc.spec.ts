import { expect, test } from '@playwright/test';

// M2: mapa zgłasza gotowość dopiero, gdy jest bezczynna i pokolorowana.
test('mapa wysyła atlas:ready i ustawia flagę @M2', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __readyAt: number }).__readyAt = 0;
    window.addEventListener('atlas:ready', () => {
      (window as unknown as { __readyAt: number }).__readyAt = performance.now();
    });
  });
  await page.goto('/mapa?e2e');
  await expect(page.locator('html')).toHaveAttribute('data-atlas-ready', '1', { timeout: 20000 });
  const readyAt = await page.evaluate(() => (window as unknown as { __readyAt: number }).__readyAt);
  expect(readyAt).toBeGreaterThan(0);
  const atlas = await page.evaluate(() => (window as unknown as { __atlas: { choropleth: unknown } }).__atlas.choropleth);
  expect(atlas).not.toBeNull();
});
