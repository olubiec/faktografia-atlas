import { test, expect, type Page } from '@playwright/test';

// Ekran główny (PRODUKT.md §3, makieta 02): panel wskaźnika po lewej, mapa na resztę szerokości.

async function ready(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
}

const atlas = (page: Page) => page.evaluate(() => (window as any).__atlas);

test.describe('Ekran główny (CC13.B)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('na wejściu mapa jest w kolorach gęstości zaludnienia na poziomie województw', async ({ page }) => {
    await ready(page, '/?e2e');
    const state = await atlas(page);
    expect(state.choropleth.indicatorId).toBe('density');
    expect(state.choropleth.level).toBe('woj');
    expect(state.layers).toContain('choropleth-layer');

    const panel = page.getByRole('complementary', { name: 'Panel wskaźnika' });
    await expect(panel).toContainText('Gęstość zaludnienia');
    await expect(panel.getByRole('list', { name: 'Najwyżej' })).toBeVisible();
    await expect(panel.getByRole('list', { name: 'Najniżej' })).toBeVisible();
    await expect(panel.getByRole('list').filter({ hasText: 'brak danych' })).toBeVisible();
  });

  test('panel, mapa i nagłówek nie nachodzą na siebie', async ({ page }) => {
    await ready(page, '/?e2e');
    const rect = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
    const header = await rect('header');
    const panel = await rect('aside[aria-label="Panel wskaźnika"]');
    const map = await rect('[aria-label="Mapa Polski"]');

    expect(panel.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
    expect(map.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
    expect(panel.x + panel.width).toBeLessThanOrEqual(map.x + 1);
    expect(panel.width).toBeGreaterThanOrEqual(380);
    expect(map.width).toBeGreaterThan(700);
  });

  test('zmiana wskaźnika, poziomu i roku zmienia stan mapy i adres', async ({ page }) => {
    await ready(page, '/?e2e');

    await page.getByRole('button', { name: /^Wskaźnik/ }).click();
    await page.getByRole('option', { name: /Stopa bezrobocia rejestrowanego/ }).click();
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate');
    expect(new URL(page.url()).searchParams.get('i')).toBe('unemployment-rate');

    await page.getByRole('button', { name: 'Powiaty' }).click();
    await page.waitForFunction(() => (window as any).__atlas?.choropleth?.level === 'pow');
    expect(new URL(page.url()).searchParams.get('l')).toBe('pow');

    const before = (await atlas(page)).choropleth.year;
    await page.getByRole('slider', { name: 'Wybierz rok' }).press('ArrowLeft');
    await page.waitForFunction((y) => (window as any).__atlas?.choropleth?.year === y - 1, before);
    expect(new URL(page.url()).searchParams.get('y')).toBe(String(before - 1));
  });

  test('wskaźnik z adresu i poziom bez danych są wyłączone', async ({ page }) => {
    await ready(page, '/?e2e&i=unemployment-rate&l=gmi');
    const state = await atlas(page);
    expect(state.choropleth.indicatorId).toBe('unemployment-rate');
    // stopa bezrobocia jest tylko do powiatów: żądany poziom gmin spada do powiatów
    expect(state.choropleth.level).toBe('pow');
    await expect(page.getByRole('button', { name: 'Gminy' })).toBeDisabled();
  });

  test('najechanie na województwo pokazuje dymek z wartością i miejscem w rankingu', async ({ page }) => {
    await ready(page, '/?e2e');
    const map = (await page.locator('[aria-label="Mapa Polski"]').boundingBox())!;
    await page.mouse.move(map.x + map.width / 2, map.y + map.height / 2);
    const tooltip = page.getByRole('status').filter({ hasText: 'miejsce wśród 16 województw' });
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('os./km²');
    await page.mouse.move(map.x + 5, map.y + map.height - 5);
    await expect(tooltip).toBeHidden();
  });

  test('kliknięcie w zestawieniu „Najwyżej” wybiera jednostkę i otwiera profil obok mapy', async ({ page }) => {
    await ready(page, '/?e2e');
    const first = page.getByRole('list', { name: 'Najwyżej' }).getByRole('button').first();
    await first.click();
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    const side = (await page.locator('[data-slot="side"]').boundingBox())!;
    const map = (await page.locator('[aria-label="Mapa Polski"]').boundingBox())!;
    expect(map.x + map.width).toBeLessThanOrEqual(side.x + 1);
  });
});
