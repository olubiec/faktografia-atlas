import { test, expect, type Page } from '@playwright/test';

// Przekierowania starych linków (docs/research/u/U08.md §4: R4, R5 w części `/?u=invalid999`, R6).
// R2 (/biblioteka*) usunięte razem z trasami; R1 (/rankingi) i R3 (/porownaj) dopiszą zadania B08 i B12 do tego pliku.

const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);
const isEngineNoise = (text: string) => text.includes('No actors found');

test.describe('@PATH-R4 @PATH-R6 przekierowania', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
  });

  test('@PATH-R4 `/?u=1217&i=density&y=2023&l=pow&e2e` → `/mapa` z identycznym zapisem', async ({ page }) => {
    await page.goto('/?u=1217&i=density&y=2023&l=pow&e2e');
    await expect(page).toHaveURL(/\/mapa\?u=1217&i=density&y=2023&l=pow&e2e$/);
    await ready(page);
    const url = new URL(page.url());
    expect(url.pathname).toBe('/mapa');
    expect(url.search).toBe('?u=1217&i=density&y=2023&l=pow&e2e');
  });

  test('@PATH-R1 `/rankingi?i=density&l=pow` → ten sam ranking na `/zestawienia`', async ({ page }) => {
    await page.goto('/rankingi?i=density&l=pow&e2e');
    await expect(page).toHaveURL(/\/zestawienia\?i=density&l=pow&e2e$/);
    await expect(page.getByRole('heading', { name: 'Lista jednostek' })).toBeVisible({ timeout: 20000 });
  });

  test('@PATH-R4 parametry techniczne `logo` i `tune` przeżywają przekierowanie', async ({ page }) => {
    await page.goto('/?u=1217&e2e&logo=znak&tune=1');
    await expect(page).toHaveURL(/\/mapa\?/);
    const params = new URL(page.url()).searchParams;
    expect(params.get('u')).toBe('1217');
    expect(params.get('logo')).toBe('znak');
    expect(params.get('tune')).toBe('1');
    expect(params.has('e2e')).toBe(true);
  });

  test('@PATH-R4 `/` bez parametrów i `/?logo=znak` zostają ekranem startowym', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Faktografia' })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');

    await page.goto('/?logo=znak');
    await expect(page.getByRole('heading', { level: 1, name: 'Faktografia' })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(new URL(page.url()).search).toBe('?logo=znak');
  });

  test('@PATH-R5 `/?u=invalid999` → `/mapa` bez błędu w konsoli', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isEngineNoise(msg.text())) errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!isEngineNoise(err.message)) errors.push(err.message);
    });
    await page.goto('/?u=invalid999&e2e');
    await expect(page).toHaveURL(/\/mapa\?/);
    await ready(page);
    await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
    expect((await page.evaluate(() => (window as any).__atlas)).selected).toBeNull();
    expect(errors).toEqual([]);
  });

  test('@PATH-R6 przekierowanie to „replace”: Wstecz nie wpada w pętlę', async ({ page }) => {
    await page.goto('/o-projekcie');
    await page.goto('/?u=1217&e2e');
    await expect(page).toHaveURL(/\/mapa\?u=1217/);
    await page.goBack();
    // Jeden krok wstecz wraca na stronę sprzed starego linku, nie na `/?u=1217`.
    await expect(page).toHaveURL(/\/o-projekcie$/);
  });

  test('@PATH-R6 `/mapa?u=…` nie przekierowuje się drugi raz', async ({ page }) => {
    const navigations: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });
    await page.goto('/mapa?u=1217&e2e');
    await ready(page);
    expect(new URL(page.url()).pathname).toBe('/mapa');
    expect(new URL(page.url()).search).toBe('?u=1217&e2e');
    expect(navigations.every((u) => new URL(u).pathname === '/mapa')).toBe(true);
  });
});
