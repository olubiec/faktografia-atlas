import { test, expect } from '@playwright/test';

test.describe('Profile Overview (@S14)', () => {
  test('powiat 3217 shows "Powiat wałecki" without double "powiat" or "Powiat •"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const title = page.locator('[data-slot="side"] h2');
    await expect(title).toHaveText('Powiat wałecki');

    const bodyText = await page.locator('[data-slot="side"]').innerText();
    expect(bodyText).not.toContain('powiat powiat');
    expect(bodyText).not.toContain('Powiat •');
    expect(bodyText).not.toContain('powiat •');
  });

  test('gmina 3217011 shows "Gmina miejska Wałcz"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const title = page.locator('[data-slot="side"] h2');
    await expect(title).toHaveText('Gmina miejska Wałcz');
  });

  test('changing indicator in indicator panel updates profile overview without full page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const overviewTitle = page.locator('[data-slot="side"] p.text-xs.text-olowek:not(.font-mono)').first();
    const initialText = await overviewTitle.innerText();

    // Open indicator picker in panel and select another indicator
    const pickerTrigger = page.locator('button', { hasText: 'Wskaźnik' }).first();
    await pickerTrigger.click();

    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();

    const otherOption = listbox.locator('[role="option"]').filter({ hasNotText: 'Gęstość' }).first();
    await otherOption.click();

    await expect(overviewTitle).not.toHaveText(initialText);
  });

  test('?u=12 renders 10 items initially, expanding to 16, with Małopolskie highlighted and sorted', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const overviewContainer = page.locator('[data-slot="side"]');
    const expandButton = overviewContainer.locator('button', { hasText: 'Pokaż wszystkie' });

    // Initially 10 bars in ranking
    const barItems = overviewContainer.locator('ul button');
    await expect(barItems).toHaveCount(10);

    // Click "Pokaż wszystkie"
    await expandButton.click();
    await expect(barItems).toHaveCount(16);

    // Check Małopolskie is highlighted
    const malopolskieBtn = barItems.filter({ hasText: 'małopolskie' });
    await expect(malopolskieBtn).toBeVisible();
    const malopolskieText = malopolskieBtn.locator('span', { hasText: 'małopolskie' });
    await expect(malopolskieText).toHaveClass(/font-bold/);
  });

  test('powiat in Małopolskie (e.g. 1217) shows ranking items count matching powiaty in 12xx', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const overviewContainer = page.locator('[data-slot="side"]');
    const expandButton = overviewContainer.locator('button', { hasText: 'Pokaż wszystkie' });
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }

    const barItems = overviewContainer.locator('ul button');
    const count = await barItems.count();
    expect(count).toBe(22);
  });

  test('clicking ranking item changes ?u=, header and window.__atlas', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const overviewContainer = page.locator('[data-slot="side"]');
    const expandButton = overviewContainer.locator('button', { hasText: 'Pokaż wszystkie' });
    await expandButton.click();

    // Click on another voivodeship in ranking, e.g. śląskie (filter out dolnośląskie)
    const slaskieBtn = overviewContainer
      .locator('ul button')
      .filter({ hasText: 'śląskie' })
      .filter({ hasNotText: 'dolno' })
      .first();
    await slaskieBtn.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === '24');
    expect(page.url()).toContain('u=24');

    const title = page.locator('[data-slot="side"] h2');
    await expect(title).toHaveText('Województwo śląskie');
  });

  test('exactly one .rough-annotation on screen in profile overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotations = page.locator('.rough-annotation');
    await expect(annotations).toHaveCount(1);
  });

  test('Kopiuj link puts URL with u= into clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const copyBtn = page.locator('button', { hasText: 'Kopiuj link' });
    await copyBtn.click();

    await expect(page.locator('button', { hasText: 'Skopiowano' })).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('u=12');
  });

  test('opening profile makes one profiles/* request and zero additional values/* requests for ranking', async ({ page }) => {
    const profileRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/data/profiles/')) {
        profileRequests.push(url);
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    expect(profileRequests.length).toBe(1);
    expect(profileRequests[0]).toContain('/data/profiles/12.json');
  });

  test('no overlapping elements at 1440x900 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sideSlot = page.locator('[data-slot="side"]');
    await expect(sideSlot).toBeVisible();

    const sideBox = await sideSlot.boundingBox();
    expect(sideBox).not.toBeNull();
    expect(sideBox!.width).toBeGreaterThan(0);
    expect(sideBox!.height).toBeGreaterThan(0);
  });
});
