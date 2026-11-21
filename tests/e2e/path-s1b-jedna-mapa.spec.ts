import { expect, test } from '@playwright/test';

type Atlas = { camera: { animating: boolean; trace: { zoom: number }[] }; choropleth: { indicatorId: string } | null };

// @PATH-1b: ze strony startowej do mapy bez przeskoku. Jedna Polska na ekranie, ruch zamiast skoku,
// po otwarciu zwykła mapa, Wstecz wraca na `/`.
for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`@PATH-1b ${vp.width}px: tło → „Otwórz mapę” → mapa → Wstecz`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    await page.setViewportSize(vp);
    await page.goto('/?e2e');
    await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);

    await page.getByRole('link', { name: 'Otwórz mapę' }).click();
    // Od pierwszej klatki okładka z obrysem przykrywa ekran w pełni widoczna.
    await expect(page.locator('[data-slot="map-cover"]')).toHaveCSS('opacity', '1');
    await expect(page).toHaveURL(/\/mapa(\?|$)/);

    // Mapa jest gotowa i pokolorowana, okładka znika (nigdy dwóch Polsk naraz po gotowości).
    await expect(page.locator('html')).toHaveAttribute('data-atlas-ready', '1', { timeout: 20000 });
    await expect(page.locator('[data-slot="map-cover"]')).toHaveCount(0, { timeout: 5000 });
    await page.waitForFunction(() => {
      const a = (window as unknown as { __atlas?: Atlas }).__atlas;
      return !!a && !a.camera.animating && a.choropleth !== null;
    });

    // Kamera jechała z kadru plakatu do widoku mapy (więcej niż jedna klatka).
    const trace = await page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas.camera.trace);
    expect(trace.length).toBeGreaterThanOrEqual(5);

    // Wstecz wraca na stronę startową z tłem.
    await page.goBack();
    await expect(page).not.toHaveURL(/\/mapa/);
    await expect(page.getByRole('img', { name: /Mapa Polski/ }).locator('path')).toHaveCount(16);
  });
}
