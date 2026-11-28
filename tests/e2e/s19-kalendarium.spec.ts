import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// S19: strona /kalendarium – miesięczny kalendarz; dane z zamockowanego fetch (fixture), bez sieci.
const fixture = readFileSync('tests/fixtures/kalendarium/kalendarium-dni.json', 'utf8');
const DATA = '**/olubiec/faktografia-atlas/data/library/library/kalendarium-dni.json';

async function open(page: Page, url: string, ok = true) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.route(DATA, (r) => (ok ? r.fulfill({ contentType: 'application/json', body: fixture }) : r.abort()));
  await page.goto(url);
}

test.describe('@S19 kalendarium (telefon)', () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test('klik w dzień pokazuje panel: GUS publikuje, co pobieramy, pomysł na media', async ({ page }) => {
    await open(page, '/kalendarium?m=2026-11');
    await expect(page.getByRole('heading', { name: 'listopad 2026' })).toBeVisible();
    await page.locator('[data-day="2026-11-25"]').click();
    const panel = page.getByTestId('day-panel');
    await expect(panel.getByRole('heading', { name: /środa, 25 listopada 2026/ })).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'GUS publikuje' })).toBeVisible();
    await expect(panel.getByRole('link', { name: /Sytuacja demograficzna/ })).toHaveAttribute('href', /^https:\/\/stat\.gov\.pl\//);
    await expect(panel.getByText('Liczba ludności ogółem')).toBeVisible();
    await expect(panel.getByText('czeka na BDL od 2026-11-25')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Pomysł na media w dniu premiery' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Zobacz na mapie' })).toHaveAttribute('href', /faktografia\.eu\/mapa\?i=/);
  });

  test('dzień z materiałem ma gwiazdkę, dzień z publikacją ma liczbę; panel pustego dnia mówi, że nic nie ma', async ({ page }) => {
    await open(page, '/kalendarium?m=2026-11');
    await expect(page.locator('[data-day="2026-11-27"]')).toContainText('★');
    await expect(page.locator('[data-day="2026-11-25"]')).toContainText('1');
    await page.locator('[data-day="2026-11-10"]').click();
    await expect(page.getByTestId('day-panel')).toContainText('nic nie zapisaliśmy');
  });

  test('przyciski miesięcy zmieniają miesiąc, a pola dotykowe mają co najmniej 44 px', async ({ page }) => {
    await open(page, '/kalendarium?m=2026-11');
    await expect(page.locator('[data-day="2026-11-25"]')).toContainText('1');
    await page.getByRole('button', { name: 'Następny miesiąc' }).click();
    await expect(page.getByRole('heading', { name: 'grudzień 2026' })).toBeVisible();
    await page.locator('[data-day="2026-12-01"]').click();
    await expect(page.getByTestId('day-panel')).toContainText('Rynek pracy w 2025 r.');
    await expect(page.getByTestId('day-panel')).toContainText('i 2 więcej');
    for (const l of [page.getByRole('button', { name: 'Poprzedni miesiąc' }), page.locator('[data-day="2026-12-01"]')]) {
      const b = (await l.boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(43.5);
      expect(b.height).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('strona jest poza indeksem Google', async ({ page }) => {
    await open(page, '/kalendarium?m=2026-11');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('błąd sieci pokazuje czytelny komunikat, a kalendarz dalej działa', async ({ page }) => {
    await open(page, '/kalendarium?m=2026-11', false);
    await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać danych kalendarza');
    await page.locator('[data-day="2026-11-25"]').click();
    await expect(page.getByTestId('day-panel')).toBeVisible();
  });
});
