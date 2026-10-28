import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import shard12Fixture from '../fixtures/parts/shard-12.json' with { type: 'json' };

test.describe('Profile Parts Block (@S20)', () => {
  test('urban-rural gmina profile has collapsed parts block, opens with 0 requests, expanding fetches 1 shard and shows numbers', async ({
    page,
  }) => {
    const partsRequests: string[] = [];

    await page.route('**/data/parts/12.json', async (route) => {
      partsRequests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(shard12Fixture),
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1202023');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Initial load: 0 parts requests made
    expect(partsRequests.length).toBe(0);

    const partsTrigger = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTrigger).toBeVisible();
    await expect(partsTrigger).toHaveAttribute('aria-expanded', 'false');

    // Expand the parts block
    await partsTrigger.click();

    await expect(partsTrigger).toHaveAttribute('aria-expanded', 'true');

    // Exactly 1 request made to /data/parts/12.json upon expansion
    expect(partsRequests.length).toBe(1);
    expect(partsRequests[0]).toContain('/data/parts/12.json');

    // City and rural numbers from fixture should be visible
    const partsTable = page.locator('[data-testid="parts-table"]');
    await expect(partsTable).toBeVisible();

    await expect(partsTable).toContainText(/16[\s  ]500/);
    await expect(partsTable).toContainText(/20[\s  ]200/);
  });

  test('404 response on parts shard displays fallback message', async ({ page }) => {
    await page.route('**/data/parts/12.json', async (route) => {
      await route.fulfill({
        status: 404,
        body: 'Not Found',
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1202023');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const partsTrigger = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTrigger).toBeVisible();
    await partsTrigger.click();

    const fallbackMsg = page.getByText('Dane o mieście i wsi pojawią się po najbliższej aktualizacji');
    await expect(fallbackMsg).toBeVisible();
  });

  test('urban gmina and county profiles do not show the parts block', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Gmina miejska (Kraków - 1261011)
    await page.goto('/?e2e&u=1261011');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const partsTriggerCity = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTriggerCity).toHaveCount(0);

    // 2. Powiat (Powiat brzeski - 1202)
    await page.goto('/?e2e&u=1202');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const partsTriggerPowiat = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTriggerPowiat).toHaveCount(0);
  });

  test('mobile 390px viewport: no horizontal scroll, touch targets >= 44px, axe clean', async ({
    page,
  }) => {
    await page.route('**/data/parts/12.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(shard12Fixture),
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&sheet=full&u=1202023');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const partsTrigger = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await partsTrigger.scrollIntoViewIfNeeded();
    await expect(partsTrigger).toBeVisible();

    // Verify touch target size >= 44px
    const box = await partsTrigger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await partsTrigger.click();

    // Verify mobile cards rendered
    const partsCards = page.locator('[data-testid="parts-cards"]');
    await expect(partsCards).toBeVisible();

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Accessibility check on mobile profile sheet
    const axeResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .disableRules(['color-contrast'])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });
});
