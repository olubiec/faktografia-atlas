import { expect, test, type Page } from '@playwright/test';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import valuesSampleFixture from '../fixtures/library/values-sample.json' with { type: 'json' };

async function mockLibrary(page: Page) {
  await page.route('**/library/index.json', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(indexFixture) }),
  );
  await page.route('**/library/values/101.json', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(valuesSampleFixture),
    }),
  );
}

function trackMapData(page: Page): string[] {
  const hits: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (/\/data\/(values|profiles)\//.test(u.pathname) && !u.pathname.includes('/library/')) {
      hits.push(u.pathname);
    }
  });
  return hits;
}

test.describe('Biblioteka bez danych głównej mapy (@S21)', () => {
  for (const path of ['/biblioteka', '/biblioteka/101']) {
    test(`@S21 ${path}: 0 żądań values/profiles z głównej mapy`, async ({ page }) => {
      await mockLibrary(page);
      const hits = trackMapData(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(hits).toEqual([]);
    });
  }

  test('@S21 /rankingi: stopka nadal pokazuje odświeżenie danych', async ({ page }) => {
    await page.goto('/rankingi');
    await expect(page.getByText(/Dane GUS odświeżone/)).toBeVisible();
  });
});
