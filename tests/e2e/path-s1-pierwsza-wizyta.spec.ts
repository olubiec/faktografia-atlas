import { test, expect, type Page } from '@playwright/test';

// Ścieżka S1 (B07): `/` → zdanie i 3 kroki → „Otwórz mapę” (obrys się powiększa) → `/mapa`.
type Atlas = { ready: boolean; viewState: { longitude: number; latitude: number; zoom: number }; choropleth: { level: string } | null };
const atlas = (page: Page) => page.evaluate(() => (window as unknown as { __atlas: Atlas }).__atlas);
const ready = (page: Page) => page.waitForFunction(() => (window as any).__atlas?.ready === true);
const isEngineNoise = (text: string) => text.includes('No actors found');
const consent = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });

for (const width of [390, 1280]) {
  test.describe(`@PATH-1 pierwsza wizyta @ ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await consent(page);
    });

    test(`@PATH-1 czytam zdanie i 3 kroki, „Otwórz mapę” prowadzi na /mapa (${width})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error' && !isEngineNoise(m.text())) errors.push(m.text());
      });
      page.on('pageerror', (e) => {
        if (!isEngineNoise(e.message)) errors.push(e.message);
      });

      await page.goto('/?e2e');
      await expect(page.getByText('Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.')).toBeVisible();
      for (const step of ['1. Wybierz dane', '2. Dotknij miejsca', '3. Zobacz profil']) {
        await expect(page.getByText(step)).toBeVisible();
      }
      // Tło: obrys z 16 polami i opisem „Mapa Polski: Liczba ludności” (pierwszy kadr = ludność).
      const bg = page.getByRole('img', { name: 'Mapa Polski: Liczba ludności' });
      await expect(bg).toBeVisible();
      await expect(bg.locator('path')).toHaveCount(16);

      await page.getByRole('link', { name: 'Otwórz mapę' }).click();
      await expect(page).toHaveURL(/\/mapa(\?|$)/);
      await ready(page);
      const state = await atlas(page);
      // Cała Polska widoczna (zoom krajowy, środek w Polsce) i domyślny wskaźnik na województwach.
      expect(state.viewState.zoom).toBeGreaterThan(3);
      expect(state.viewState.zoom).toBeLessThan(7.5);
      expect(state.viewState.longitude).toBeGreaterThan(17);
      expect(state.viewState.longitude).toBeLessThan(22);
      expect(state.viewState.latitude).toBeGreaterThan(50);
      expect(state.viewState.latitude).toBeLessThan(54);
      await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
      expect((await atlas(page)).choropleth!.level).toBe('woj');
      expect(errors).toEqual([]);
    });

    // D4 (zgoda właściciela): zamiast powiększania obrysu na stronie okładka stoi w kadrze mapy od pierwszej klatki.
    test(`@PATH-1 podczas wejścia okładka z obrysem jest od razu w pełni widoczna, potem /mapa (${width})`, async ({ page }) => {
      await page.goto('/?e2e');
      await expect(page.getByRole('img', { name: /Mapa Polski/ })).toBeVisible();
      await page.getByRole('link', { name: 'Otwórz mapę' }).click();
      const cover = page.locator('[data-slot="map-cover"]');
      await expect(cover).toHaveCount(1);
      await expect(cover).toHaveCSS('opacity', '1');
      await expect(page).toHaveURL(/\/mapa(\?|$)/);
    });

    test(`@PATH-1 /mapa nie ma sekcji pod mapą ani napisu „Rekordy Polski” (${width})`, async ({ page }) => {
      await page.goto('/mapa?e2e');
      await ready(page);
      await expect(page.getByText('Rekordy Polski')).toHaveCount(0);
      await expect(page.getByText(/Przewiń w dół/)).toHaveCount(0);
      await expect(page.getByRole('heading', { name: /Działy tematyczne|Pojedynki/ })).toHaveCount(0);
    });
  });
}

test.describe('@PATH-1 prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('@PATH-1 kolory tła nie zmieniają się przez 6 s, a link otwiera mapę bez czekania', async ({ page }) => {
    await consent(page);
    await page.goto('/?e2e');
    const bg = page.getByRole('img', { name: 'Mapa Polski: Liczba ludności' });
    await expect(bg.locator('path')).toHaveCount(16);
    const fills = () => bg.locator('path').evaluateAll((els) => els.map((e) => getComputedStyle(e).fill).join('|'));
    const before = await fills();
    await page.waitForTimeout(6000);
    expect(await fills()).toBe(before);
    await expect(bg).toHaveAttribute('data-indicator', 'population');
    await page.getByRole('link', { name: 'Otwórz mapę' }).click();
    await expect(page).toHaveURL(/\/mapa(\?|$)/);
  });
});

test.describe('@PATH-1 zmiana wskaźnika i reakcja na ruch', () => {
  test('@PATH-1 po 5 s tło pokazuje inny wskaźnik; ruch myszy daje podpis z województwem', async ({ page }) => {
    await consent(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?e2e');
    const bg = page.locator('svg[data-indicator]');
    await expect(bg).toHaveAttribute('data-indicator', 'population');
    await expect(bg).toHaveAttribute('data-indicator', 'unemployment-rate', { timeout: 9000 });
    const b = (await bg.boundingBox())!;
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.4);
    await page.mouse.move(b.x + b.width * 0.52, b.y + b.height * 0.42);
    await expect(page.getByTestId('start-caption')).toContainText(/ · .+: /);
    await expect(bg).toHaveAttribute('data-mode', 'react');
  });
});
