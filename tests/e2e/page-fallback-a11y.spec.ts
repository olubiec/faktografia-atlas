import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Ekran ładowania podstrony: dostępność (@S21)', () => {
  test('podczas wczytywania kodu /biblioteka jest main i h1, po wczytaniu dokładnie po jednym', async ({
    page,
  }) => {
    await page.route('**/index.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(indexFixture),
      }),
    );
    // Opóźniamy chunk strony biblioteki, żeby utrzymać Suspense fallback
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/assets/Library-*.js', async (route) => {
      await gate;
      await route.continue();
    });

    await page.goto('/biblioteka', { waitUntil: 'commit' });
    await expect(page.locator('[data-testid="page-fallback"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'page-has-heading-one', 'region'])
      .analyze();
    expect(results.violations).toEqual([]);

    release();
    await expect(page.locator('h1', { hasText: 'Biblioteka wskaźników GUS' })).toBeVisible();
    await expect(page.locator('[data-testid="page-fallback"]')).toHaveCount(0);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });
});
