import { test, expect } from '@playwright/test';

const mockUnemploymentData = {
  id: 'unemployment-rate',
  years: [2021, 2022, 2023],
  values: {
    '14': [12.1, 11.5, 10.2], // Województwo Mazowieckie
    '02': [8.5, 8.0, 7.2],    // Województwo Dolnośląskie
    '1415': [5.1, 4.8, 4.2],   // Powiat Pruszkowski
  },
};

test.describe('Choropleth Map (CC8.2a-2)', () => {
  test('/?e2e&i=unemployment-rate colors map and sets window.__atlas.choropleth', async ({ page }) => {
    await page.route('**/data/values/unemployment-rate.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUnemploymentData),
      });
    });

    await page.goto('/?e2e&i=unemployment-rate');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth !== null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth).toEqual({
      indicatorId: 'unemployment-rate',
      year: 2023,
      level: 'woj',
      classes: 5,
    });
    expect(atlasState.layers).toContain('choropleth-layer');
  });

  test('drilling down into voivodeship updates level to pow', async ({ page }) => {
    await page.route('**/data/values/unemployment-rate.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUnemploymentData),
      });
    });

    await page.goto('/?e2e&i=unemployment-rate&u=14');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.level === 'pow');

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth).toEqual({
      indicatorId: 'unemployment-rate',
      year: 2023,
      level: 'pow',
      classes: 5,
    });
    expect(atlasState.layers).toContain('choropleth-layer');
  });

  test('without ?i= parameter the map is colored with the default indicator (density, voivodeships)', async ({ page }) => {
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth.indicatorId).toBe('density');
    expect(atlasState.choropleth.level).toBe('woj');
    expect(atlasState.layers).toContain('choropleth-layer');
  });

  test('unknown ?i= falls back to the default indicator', async ({ page }) => {
    await page.goto('/?e2e&i=non-existent-indicator');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth.indicatorId).toBe('density');
  });

  test('404 missing values file leaves the map uncolored', async ({ page }) => {
    await page.route('**/data/values/density.json', async (route) => {
      await route.fulfill({ status: 404, body: 'Not found' });
    });

    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForTimeout(300);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth).toBeNull();
    expect(atlasState.layers).not.toContain('choropleth-layer');
  });

  test('explicit ?y= year parameter overrides default year', async ({ page }) => {
    await page.route('**/data/values/unemployment-rate.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUnemploymentData),
      });
    });

    await page.goto('/?e2e&i=unemployment-rate&y=2021');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth !== null);

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth?.year).toBe(2021);
  });
});
