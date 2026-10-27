import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import shard12Fixture from '../fixtures/parts/shard-12.json' with { type: 'json' };

test.describe('Full Urban-Rural Parts Flow (@S20)', () => {
  test.setTimeout(90000);

  test('desktop 1440x900 full path: search urban-rural gmina -> open profile -> expand parts block (@S20)', async ({
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

    // 1. Enter main page
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // 2. Search urban-rural gmina "Brzesko"
    const searchTrigger = page.locator('header button', { hasText: 'Szukaj miejsca...' });
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Brzesko');

    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('Brzesko');
    await page.keyboard.press('Enter');

    // Wait for profile to open for Brzesko (1202023)
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.waitForFunction(() => (window as any).__atlas?.selected === '1202023');

    // Confirm profile opened without making any requests to parts/
    expect(partsRequests.length).toBe(0);

    // Verify profile header shows Gmina miejsko-wiejska Brzesko
    const sidePanel = page.locator('[data-slot="side"]');
    const header = sidePanel.locator('h2');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Brzesko');

    // 3. Expand parts block
    const partsTrigger = sidePanel.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTrigger).toBeVisible();
    await expect(partsTrigger).toHaveAttribute('aria-expanded', 'false');

    // Verify touch target height >= 44px
    const triggerBox = await partsTrigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

    await partsTrigger.click();
    await expect(partsTrigger).toHaveAttribute('aria-expanded', 'true');

    // Exactly 1 request made to parts/12.json upon expanding
    expect(partsRequests.length).toBe(1);
    expect(partsRequests[0]).toContain('/data/parts/12.json');

    // Verify desktop table with city and rural values from fixture
    const partsTable = sidePanel.locator('[data-testid="parts-table"]');
    await expect(partsTable).toBeVisible();

    const tableText = (await partsTable.innerText()).replace(/\u00a0/g, ' ');
    expect(tableText).toContain('16 500');
    expect(tableText).toContain('20 200');

    // Verify max 1 red annotation
    const annotationCount = await page.locator('.rough-annotation').count();
    expect(annotationCount).toBeLessThanOrEqual(1);

    // Axe accessibility check
    const axeResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast', 'scrollable-region-focusable'])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  const mobileViewports = [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
  ];

  for (const viewport of mobileViewports) {
    test(`mobile ${viewport.width}x${viewport.height} full path: search urban-rural gmina -> profile -> expand parts cards (@S20)`, async ({
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

      await page.setViewportSize(viewport);

      // Dismiss consent bar via pre-set localStorage
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });

      // 1. Enter main page with ?sheet=full for full height mobile sheet in tests
      await page.goto('/?e2e&sheet=full');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      // Check no horizontal overflow
      let noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noOverflow).toBe(true);

      // 2. Search urban-rural gmina "Brzesko" via visible search button (lupa in mobile header)
      const searchTrigger = page.locator('header button[aria-label="Szukaj miejsca"]');
      await expect(searchTrigger).toBeVisible();
      await searchTrigger.click();

      const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('Brzesko');

      const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
      await expect(firstResult).toBeVisible();
      await expect(firstResult).toContainText('Brzesko');
      await page.keyboard.press('Enter');

      // Wait for profile to open on mobile sheet
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await page.waitForFunction(() => (window as any).__atlas?.selected === '1202023');

      // Confirm profile opened with 0 requests to parts/
      expect(partsRequests.length).toBe(0);

      const sheet = page.locator('[role="dialog"]').filter({ hasText: 'Brzesko' });
      await expect(sheet).toBeVisible();

      // Check no horizontal overflow with profile sheet open
      noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noOverflow).toBe(true);

      // 3. Expand parts block inside mobile profile sheet
      const partsTrigger = sheet.locator('button', { hasText: 'Miasto i obszar wiejski' });
      await partsTrigger.scrollIntoViewIfNeeded();
      await expect(partsTrigger).toBeVisible();

      // Verify touch target height >= 44px
      const triggerBox = await partsTrigger.boundingBox();
      expect(triggerBox).not.toBeNull();
      expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

      await partsTrigger.click();
      await expect(partsTrigger).toHaveAttribute('aria-expanded', 'true');

      // Exactly 1 request made to parts/12.json upon expanding
      expect(partsRequests.length).toBe(1);
      expect(partsRequests[0]).toContain('/data/parts/12.json');

      // Verify mobile cards rendered with city and rural numbers from fixture
      const partsCards = sheet.locator('[data-testid="parts-cards"]');
      await expect(partsCards).toBeVisible();

      const cardsText = (await partsCards.innerText()).replace(/\u00a0/g, ' ');
      expect(cardsText).toContain('16 500');
      expect(cardsText).toContain('20 200');

      // Check no horizontal overflow with cards expanded
      noOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      );
      expect(noOverflow).toBe(true);

      // Verify max 1 red annotation
      const annotationCount = await page.locator('.rough-annotation').count();
      expect(annotationCount).toBeLessThanOrEqual(1);

      // Axe accessibility check on mobile sheet
      const axeResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .disableRules(['color-contrast', 'scrollable-region-focusable'])
        .analyze();
      expect(axeResults.violations).toEqual([]);
    });
  }

  test('respects prefers-reduced-motion in full path (@S20)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.route('**/data/parts/12.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(shard12Fixture),
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Enter main page with ?sheet=full
    await page.goto('/?e2e&sheet=full');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // 2. Search urban-rural gmina "Brzesko" via visible search button
    const searchTrigger = page.locator('header button[aria-label="Szukaj miejsca"]');
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Brzesko');

    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('Brzesko');
    await page.keyboard.press('Enter');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sheet = page.locator('[role="dialog"]').filter({ hasText: 'Brzesko' });
    await expect(sheet).toBeVisible({ timeout: 10000 });

    const partsTrigger = sheet.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await partsTrigger.scrollIntoViewIfNeeded();
    await partsTrigger.click();

    const partsCards = sheet.locator('[data-testid="parts-cards"]');
    await expect(partsCards).toBeVisible();
  });
});
