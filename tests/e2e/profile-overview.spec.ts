import { test, expect } from '@playwright/test';

test.describe('Profile Overview (W2.1 @S14)', () => {
  test('powiat 3217 title is "Powiat wałecki" without duplicated words (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const h2 = page.locator('[data-slot="side"] h2');
    await expect(h2).toHaveText('Powiat wałecki');

    const fullText = await page.locator('[data-slot="side"]').innerText();
    expect(fullText).not.toContain('powiat powiat');
    expect(fullText).not.toContain('Powiat •');
  });

  test('gmina 3217011 title is "Gmina miejska Wałcz" (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const h2 = page.locator('[data-slot="side"] h2');
    await expect(h2).toHaveText('Gmina miejska Wałcz');
  });

  test('changing indicator in panel updates overview without reload (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');

    // Initial indicator name in overview ranking header
    const rankingHeader = side.locator('h3').first();
    const initialText = await rankingHeader.innerText();

    // Click indicator picker trigger button in main panel
    const pickerTrigger = page.locator('aside[aria-label="Panel wskaźnika"] button[aria-expanded]').first();
    await expect(pickerTrigger).toBeVisible();
    await pickerTrigger.click();

    // Search and select Stopa bezrobocia
    const searchInput = page.locator('input[aria-label="Szukaj wskaźnika"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('bezrobocia');

    const option = page.locator('[role="option"]', { hasText: 'Stopa bezrobocia' });
    await expect(option).toBeVisible();
    await option.click();

    // Verify overview updated without full reload
    await expect(rankingHeader).not.toHaveText(initialText);
  });

  test('voivodeship 12 ranking shows 10 items initially, 16 on expand, with małopolskie highlighted (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    await expect(side.locator('h2')).toHaveText('Województwo małopolskie');

    // Ranking header
    const rankingHeader = side.locator('h3', { hasText: 'we wszystkich województwach' });
    await expect(rankingHeader).toBeVisible();

    // Check bar items before expand
    const barButtons = side.locator('ul button');
    await expect(barButtons).toHaveCount(10);

    // Click "Pokaż wszystkie"
    const expandButton = side.locator('button', { hasText: 'Pokaż wszystkie' });
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    await expect(barButtons).toHaveCount(16);

    // Małopolskie highlighted (unitLabel returns 'małopolskie' for voivodeships)
    const highlightedBar = side.locator('ul button', { hasText: 'małopolskie' });
    await expect(highlightedBar).toBeVisible();
    await expect(highlightedBar.locator('span', { hasText: 'małopolskie' })).toHaveClass(/font-bold text-korekta/);
  });

  test('małopolskie county (?u=1201) shows ranking with all counties in małopolskie (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1201');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    await expect(side.locator('h2')).toHaveText('Powiat bocheński');

    // Ranking header should mention "w powiatach województwa małopolskiego"
    const rankingHeader = side.locator('h3', { hasText: 'w powiatach województwa' });
    await expect(rankingHeader).toBeVisible();

    // Count items (małopolskie has 22 counties)
    const expandButton = side.locator('button', { hasText: 'Pokaż wszystkie' });
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
    const barButtons = side.locator('ul button');
    await expect(barButtons).toHaveCount(22);
  });

  test('clicking ranking item changes ?u=, header, and atlas state (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    const expandButton = side.locator('button', { hasText: 'Pokaż wszystkie' });
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }

    // Click on another voivodeship in ranking (e.g. mazowieckie)
    const otherItem = side.locator('ul button', { hasText: 'mazowieckie' }).first();
    await expect(otherItem).toBeVisible();
    await otherItem.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === '14');
    expect(page.url()).toContain('u=14');
    await expect(side.locator('h2')).toHaveText('Województwo mazowieckie');
  });

  test('exactly one rough-annotation on screen (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotations = page.locator('svg.rough-annotation');
    await expect(annotations).toHaveCount(1);
  });

  test('Kopiuj link button copies current URL to clipboard (@S14)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const copyBtn = page.locator('button', { hasText: 'Kopiuj link' });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(page.locator('button', { hasText: 'Skopiowano' })).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('u=12');
  });

  test('opening profile triggers 1 profile shard request and zero additional values/* requests (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const profileRequests: string[] = [];
    const valuesRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/data/profiles/')) {
        profileRequests.push(url);
      }
      if (url.includes('/data/values/')) {
        valuesRequests.push(url);
      }
    });

    // Select voivodeship 12
    await page.evaluate(() => {
      window.history.pushState({}, '', '/?e2e&u=12');
      window.dispatchEvent(new Event('popstate'));
    });

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    expect(profileRequests.length).toBe(1);
    expect(profileRequests[0]).toContain('/data/profiles/12.json');
    expect(valuesRequests.length).toBe(0);
  });

  test('1440x900 viewport layout does not overlap (@S14)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    await expect(side).toBeVisible();

    const box = await side.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(400);

    const h2 = side.locator('h2');
    await expect(h2).toBeVisible();
    const h2Box = await h2.boundingBox();
    expect(h2Box).not.toBeNull();
  });
});
