import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const explanationsFixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/explanations.json'), 'utf-8')
);

test.describe('Profile Indicator Row Expansion @S14', () => {
  test.beforeEach(async ({ page }) => {
    // Podstawienie fikstury objaśnień pod /data/explanations.json
    await page.route('**/data/explanations.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(explanationsFixture),
      });
    });
  });

  test('clicking row "Gęstość zaludnienia" expands it (aria-expanded="true"), second click collapses it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011&i=unemployment-rate');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Gęstość zaludnienia',
    });
    await expect(rowButton).toBeVisible();
    await expect(rowButton).toHaveAttribute('aria-expanded', 'false');

    // Pierwsze kliknięcie rozwija
    await rowButton.click();
    await expect(rowButton).toHaveAttribute('aria-expanded', 'true');

    // Drugie kliknięcie zwija
    await rowButton.click();
    await expect(rowButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('expanded row displays chart with labeled years and min/max', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011&i=unemployment-rate');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Gęstość zaludnienia',
    });
    await rowButton.click();

    // Wykres TrendChart (region)
    const chartRegion = page.locator('div[role="region"][aria-label*="Gęstość zaludnienia"]');
    await expect(chartRegion).toBeVisible();

    // Sprawdzenie obecności tekstu lat na osi X wewnątrz SVG
    const svgText = chartRegion.locator('svg text');
    const textCount = await svgText.count();
    expect(textCount).toBeGreaterThanOrEqual(2);
  });

  test('explanation short text and "Definicja GUS" link are visible with fixture, omitted on 404', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011&i=unemployment-rate');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Gęstość zaludnienia',
    });
    await rowButton.click();

    // Tekst z fikstury
    const shortText = page.locator('text="Ilu ludzi mieszka średnio na 1 km² powierzchni."');
    await expect(shortText).toBeVisible();

    const defLink = page.locator('a', { hasText: 'Definicja GUS' });
    await expect(defLink).toBeVisible();
    await expect(defLink).toHaveAttribute(
      'href',
      'https://stat.gov.pl/pojecia-w-statystyce-publicznej/'
    );

    // Test 404 dla objaśnień bez błędów w konsoli
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.route('**/data/explanations.json', async (route) => {
      await route.fulfill({ status: 404, body: 'Not found' });
    });

    await page.reload();
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const rowButton404 = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Gęstość zaludnienia',
    });
    await rowButton404.click();

    await expect(shortText).not.toBeVisible();
    await expect(defLink).not.toBeVisible();

    // Brak błędów aplikacji w konsoli
    const appErrors = consoleErrors.filter(
      (err) => !err.includes('404') && !err.includes('Failed to load resource')
    );
    expect(appErrors).toEqual([]);
  });

  test('"Pokaż na mapie" button updates ?i= in URL and window.__atlas choropleth', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await rowButton.click();

    const showOnMapBtn = profileSheet.locator('button', { hasText: 'Pokaż na mapie' });
    await expect(showOnMapBtn).toBeVisible();
    await showOnMapBtn.click();

    // Sprawdzenie URL
    await page.waitForFunction(() => window.location.search.includes('i=unemployment-rate'));
    const url = await page.evaluate(() => window.location.search);
    expect(url).toContain('i=unemployment-rate');
    expect(url).toContain('u=1217011');

    // Sprawdzenie window.__atlas
    await page.waitForFunction(
      () => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate'
    );
    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.choropleth.indicatorId).toBe('unemployment-rate');
  });

  test('expanding row and clicking "Pokaż na mapie" do not fetch any profiles/*.json', async ({
    page,
  }) => {
    const profileRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/data/profiles/')) {
        profileRequests.push(req.url());
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Czyścimy żądania zrobione podczas wstępnego ładowania strony
    profileRequests.length = 0;

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await rowButton.click();

    const showOnMapBtn = profileSheet.locator('button', { hasText: 'Pokaż na mapie' });
    await showOnMapBtn.click();

    await page.waitForFunction(() => window.location.search.includes('i=unemployment-rate'));

    // Żaden plik profile nie powinien zostać powtórnie pobrany
    expect(profileRequests).toEqual([]);
  });

  test('no axe accessibility errors on open profile with expanded row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011&i=unemployment-rate');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSheet = page.locator('[data-slot="side"]');
    const rowButton = profileSheet.locator('button[aria-expanded]', {
      hasText: 'Gęstość zaludnienia',
    });
    await rowButton.click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
