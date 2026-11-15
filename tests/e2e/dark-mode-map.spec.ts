import { test, expect, type Page } from '@playwright/test';

// W18-P02: motyw ciemny mapy – kartogram, podkład i obrysy granic (tokeny, bez pikseli WebGL).
const data = {
  id: 'unemployment-rate',
  years: [2021, 2022, 2023],
  values: { '14': [12.1, 11.5, 10.2], '02': [8.5, 8.0, 7.2] },
};

async function openMap(page: Page, errors: string[]) {
  page.on('console', (m) => {
    // "No actors found" to szum biblioteki mapy (luma/MapLibre) bez GPU w CI, niezależny od motywu
    if (m.type() === 'error' && !/Failed to load resource|No actors found/.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => {
    if (!/No actors found/.test(e.message)) errors.push(e.message);
  });
  await page.route('**/data/values/unemployment-rate.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })
  );
  await page.goto('/?e2e&i=unemployment-rate');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth !== null);
}

const setTheme = (page: Page, theme: 'light' | 'dark') =>
  page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);

const luminance = (rgb: string) => {
  const [r, g, b] = (rgb.match(/\d+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

for (const [name, size] of [
  ['komputer', { width: 1440, height: 900 }],
  ['telefon', { width: 390, height: 844 }],
] as const) {
  test(`@S18 ciemny motyw mapy bez błędów w konsoli (${name})`, async ({ page }) => {
    const errors: string[] = [];
    await page.setViewportSize(size);
    await openMap(page, errors);

    await setTheme(page, 'dark');
    await page.waitForFunction(() => (window as any).__atlas?.theme === 'dark');

    const atlas = await page.evaluate(() => (window as any).__atlas);
    expect(atlas.theme).toBe('dark');
    expect(atlas.layers).toContain('choropleth-layer');
    expect(atlas.choropleth?.indicatorId).toBe('unemployment-rate');

    // Tokeny ciemne faktycznie obowiązują: tło ciemne, obrys jaśniejszy niż tło
    const css = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return { arkusz: s.getPropertyValue('--arkusz').trim(), olowek: s.getPropertyValue('--olowek').trim() };
    });
    const hex = (h: string) => {
      const n = parseInt(h.replace('#', ''), 16);
      return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
    };
    expect(luminance(hex(css.arkusz))).toBeLessThan(80);
    expect(luminance(hex(css.olowek))).toBeGreaterThan(luminance(hex(css.arkusz)) + 60);

    // Powrót do jasnego i ponownie ciemny – bez przeładowania i bez błędów
    await setTheme(page, 'light');
    await page.waitForFunction(() => (window as any).__atlas?.theme === 'light');
    await setTheme(page, 'dark');
    await page.waitForFunction(() => (window as any).__atlas?.theme === 'dark');
    expect((await page.evaluate(() => (window as any).__atlas)).layers).toContain('choropleth-layer');

    expect(errors).toEqual([]);
  });
}
