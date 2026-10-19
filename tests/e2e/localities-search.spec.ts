import { test, expect } from '@playwright/test';
import sampleFixture from '../fixtures/prng/sample.json' with { type: 'json' };
import realUnits from '../../public/data/units.json' with { type: 'json' };
import { buildLocalities } from '../../scripts/geo/localities-parse.mjs';

const mockLocalities = buildLocalities(sampleFixture.features, realUnits).localities;

test.describe('Localities Search & Lazy Loading (CC5.4a)', () => {
  test('localities.json nie jest pobierany przed otwarciem Ctrl+K, a po otwarciu dokładnie raz', async ({ page }) => {
    const localitiesRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/data/localities.json')) {
        localitiesRequests.push(req.url());
      }
    });

    await page.route('/data/localities.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLocalities),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(localitiesRequests).toHaveLength(0);

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('zakop');
    await page.waitForTimeout(100);

    expect(localitiesRequests.length).toBeGreaterThanOrEqual(1);

    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await searchInput.fill('zakop');

    expect(localitiesRequests).toHaveLength(1);
  });

  test('wyszukuje miejscowość "Zakopane" i wyświetla w osobnej grupie "Miejscowości"', async ({ page }) => {
    await page.route('/data/localities.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLocalities),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('zakop');

    const localityGroup = page.locator('div[role="dialog"] [cmdk-group]').filter({ hasText: 'Miejscowości' });
    await expect(localityGroup).toBeVisible();

    const localityItem = localityGroup.locator('[cmdk-item]').first();
    await expect(localityItem).toBeVisible();
    await expect(localityItem).toContainText('Zakopane');
    await expect(localityItem).toContainText('gmina Zakopane');
  });

  test('brak pliku localities.json (404) nie psuje wyszukiwania jednostek i nie zgłasza błędów w konsoli', async ({ page }) => {
    const localitiesErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('localities')) {
        localitiesErrors.push(msg.text());
      }
    });

    await page.route('/data/localities.json', async (route) => {
      await route.fulfill({
        status: 404,
        body: 'Not Found',
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('lodz');

    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('Łódź');

    expect(localitiesErrors).toHaveLength(0);
  });
});
