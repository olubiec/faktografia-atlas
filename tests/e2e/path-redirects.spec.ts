import { test, expect, type Page } from '@playwright/test';

// Przekierowania starych linków (docs/research/u/U08.md §4: R4, R5 w części `/?u=invalid999`, R6).
// R2 (/biblioteka*) dopisał B06; R1 (/rankingi) i R3 (/porownaj) dopiszą zadania B08 i B12 do tego pliku.

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

test.describe('@PATH-R2 przekierowania starej Biblioteki', () => {
  const available = {
    version: 1,
    variables: [{ id: '101', n: 'Ludność – ogółem', u: 'osoba', c: 'LUDNOŚĆ > STAN LUDNOŚCI > Ludność wg płci', lv: ['pow', 'gmi'], y: [2023, 2024] }],
  };

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
    });
    // Spis wskaźników podstawiamy próbką (z numerem 101, bez 999); pliki wartości nie są potrzebne.
    await page.route('**/available.json', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(available) }),
    );
  });

  /** Wchodzi na stary adres, zbiera błędy konsoli i zwraca końcowy adres oraz listę błędów. */
  async function visit(page: Page, from: string) {
    const errors: string[] = [];
    // Błędy sieci (np. brak pliku wartości dla podstawionego wskaźnika) nie są błędami przekierowania.
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isEngineNoise(msg.text()) && !msg.text().includes('Failed to load resource')) errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      if (!isEngineNoise(err.message)) errors.push(err.message);
    });
    await page.goto('/o-projekcie');
    await page.goto(from);
    await expect(page).toHaveURL(/\/mapa/);
    return { url: new URL(page.url()), errors };
  }

  test('@PATH-R2 `/biblioteka` → `/mapa?menu=dane` i okno wyboru danych jest otwarte', async ({ page }) => {
    const { url, errors } = await visit(page, '/biblioteka');
    expect(url.pathname + url.search).toBe('/mapa?menu=dane');
    await expect(page.getByRole('dialog', { name: 'Wybierz dane' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('@PATH-R2 `/biblioteka?k=1&q=ludnosc` → `/mapa?menu=dane&q=ludnosc` z wpisaną frazą', async ({ page }) => {
    const { url, errors } = await visit(page, '/biblioteka?k=1&q=ludnosc');
    expect(url.pathname + url.search).toBe('/mapa?menu=dane&q=ludnosc');
    const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
    await expect(dialog.getByRole('searchbox', { name: 'Szukaj wskaźnika' })).toHaveValue('ludnosc');
    expect(errors).toEqual([]);
  });

  test('@PATH-R2 `/biblioteka/101` → `/mapa?i=b101`', async ({ page }) => {
    const { url, errors } = await visit(page, '/biblioteka/101');
    expect(url.pathname + url.search).toBe('/mapa?i=b101');
    expect(errors).toEqual([]);
  });

  test('@PATH-R2 nieistniejące `/biblioteka/999` → `/mapa` bez błędu w konsoli', async ({ page }) => {
    const { url, errors } = await visit(page, '/biblioteka/999');
    expect(url.pathname + url.search).toBe('/mapa');
    // Bez `e2e` mapa nie wystawia stanu testowego: czekamy na nagłówek ekranu mapy.
    await expect(page.getByRole('heading', { level: 1, name: 'Mapa Polski z danymi GUS' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('@PATH-R2 przekierowanie to „replace”: Wstecz wraca przed stary link, bez pętli', async ({ page }) => {
    for (const from of ['/biblioteka', '/biblioteka?k=1&q=ludnosc', '/biblioteka/101', '/biblioteka/999']) {
      await page.goto('/o-projekcie');
      await page.goto(from);
      await expect(page).toHaveURL(/\/mapa/);
      await page.goBack();
      await expect(page).toHaveURL(/\/o-projekcie$/);
    }
  });
});
