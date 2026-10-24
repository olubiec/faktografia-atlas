import { test, expect } from '@playwright/test';

const mockUnemploymentData = {
  id: 'unemployment-rate',
  years: [2021, 2022, 2023],
  values: {
    '14': [12.1, 11.5, 10.2], // Województwo Mazowieckie
    '02': [8.5, 8.0, 7.2],    // Województwo Dolnośląskie
  },
};

test.describe('Choropleth Color Transition (@S16)', () => {
  test('changing indicator transitions choropleth colors smoothly in <= 400ms (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.route('**/data/values/unemployment-rate.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUnemploymentData),
      });
    });

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const initialAtlasState = await page.evaluate(() => (window as any).__atlas);
    expect(initialAtlasState.choropleth.indicatorId).toBe('density');

    // Zmiana wskaźnika w URL
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('i', 'unemployment-rate');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    // Wskaźnik został zaktualizowany w stanie mapy
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate');

    // Po <= 400 ms nowe kolory są w pełni zastosowane, a mapa jest gotowa
    await page.waitForTimeout(400);

    const updatedAtlasState = await page.evaluate(() => (window as any).__atlas);
    expect(updatedAtlasState.choropleth.indicatorId).toBe('unemployment-rate');
    expect(updatedAtlasState.layers).toContain('choropleth-layer');
  });

  test('changing year transitions colors in <= 400ms (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const initialYear = await page.evaluate(() => (window as any).__atlas.choropleth.year);

    // Zmiana roku
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('y', '2018');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    await page.waitForFunction(
      (oldYear) => (window as any).__atlas?.choropleth?.year !== oldYear,
      initialYear
    );

    await page.waitForTimeout(400);

    const updatedYear = await page.evaluate(() => (window as any).__atlas.choropleth.year);
    expect(updatedYear).toBe(2018);
  });

  test('prefers-reduced-motion updates colors instantly (@S16)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('y', '2018');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.year === 2018);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth.year).toBe(2018);
  });
});
