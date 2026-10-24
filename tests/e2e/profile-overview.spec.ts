import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Profile Overview (@S14)', () => {
  test('powiat 3217 shows header "Powiat wałecki" without duplicated prefix', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const header = page.locator('[data-slot="side"] h2');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Powiat wałecki');

    const bodyText = await page.locator('[data-slot="side"]').innerText();
    expect(bodyText).not.toContain('powiat powiat');
    expect(bodyText).not.toContain('Powiat •');
  });

  test('gmina 3217011 shows header "Gmina miejska Wałcz"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const header = page.locator('[data-slot="side"] h2');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Gmina miejska Wałcz');
  });

  test('indicator change in panel updates profile overview without page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const profileSide = page.locator('[data-slot="side"]');

    // Domyślny wskaźnik w przeglądzie
    const indicatorHeader = profileSide.locator('button[aria-expanded] span.font-semibold').first();
    await expect(indicatorHeader).toBeVisible();
    const initialIndicatorName = await indicatorHeader.textContent();

    // Zmiana wskaźnika w panelu po lewej stronie
    const indicatorPickerTrigger = page.locator('aside button', { hasText: 'Gęstość zaludnienia' });
    await indicatorPickerTrigger.click();

    const option = page.locator('[role="option"]', { hasText: 'Ludność ogółem' });
    await option.click();

    await page.waitForFunction(
      (oldName) => {
        const el = document.querySelector('[data-slot="side"] button[aria-expanded] span.font-semibold');
        return el && el.textContent !== oldName;
      },
      initialIndicatorName
    );

    const newIndicatorName = await indicatorHeader.textContent();
    expect(newIndicatorName).toContain('Ludność');
  });

  test('?u=12 displays 10 ranking items initially and 16 after "Pokaż wszystkie", with voivodeship highlighted', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const rankingContainer = page.locator('[data-slot="side"]');
    const rankingListItems = rankingContainer.locator('ul[aria-label] li');

    // Domyślnie 10 pozycji w rankingu
    await expect(rankingListItems).toHaveCount(10);

    // Przycisk "Pokaż wszystkie"
    const showAllBtn = rankingContainer.locator('button', { hasText: /Pokaż wszystkie/ });
    await expect(showAllBtn).toBeVisible();
    await showAllBtn.click();

    // Po rozwinięciu 16 województw
    await expect(rankingListItems).toHaveCount(16);

    // Sprawdzenie wyróżnienia dla małopolskiego (klasa lub styl wyróżniający)
    const highlightedItem = rankingContainer.locator('li button .text-korekta, li button.font-bold');
    await expect(highlightedItem.first()).toBeVisible();
  });

  test('county profile ?u=1217 shows ranking with all counties in the voivodeship', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const rankingContainer = page.locator('[data-slot="side"]');
    const rankingTitle = rankingContainer.locator('h3', { hasText: 'w powiatach województwa małopolskiego' });
    await expect(rankingTitle).toBeVisible();

    const showAllBtn = rankingContainer.locator('button', { hasText: /Pokaż wszystkie/ });
    if (await showAllBtn.isVisible()) {
      await showAllBtn.click();
    }

    const rankingListItems = rankingContainer.locator('ul[aria-label] li');
    // Województwo małopolskie ma 22 powiaty (19 ziemskich + 3 miasta na prawach powiatu)
    const count = await rankingListItems.count();
    expect(count).toBe(22);
  });

  test('clicking an item in ranking changes ?u=, header and window.__atlas', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const rankingContainer = page.locator('[data-slot="side"]');
    const showAllBtn = rankingContainer.locator('button', { hasText: /Pokaż wszystkie/ });
    await showAllBtn.click();

    // Klik w inne województwo np. mazowieckie w sekcji Rankingu
    const mazowieckieBtn = rankingContainer.locator('ul[aria-label] button', { hasText: 'mazowieckie' });
    await expect(mazowieckieBtn).toBeVisible();
    await mazowieckieBtn.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === '14');

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('14');

    const urlSearch = await page.evaluate(() => window.location.search);
    expect(urlSearch).toContain('u=14');

    const header = page.locator('[data-slot="side"] h2');
    await expect(header).toHaveText('Województwo mazowieckie', { timeout: 15000 });
  });

  test('exactly one .rough-annotation exists on screen in profile overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotations = page.locator('.rough-annotation');
    await expect(annotations).toHaveCount(1);
  });

  test('"Kopiuj link" copies current URL with u= to clipboard and displays "Skopiowano"', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const copyBtn = page.locator('button', { hasText: 'Kopiuj link' });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    const copiedTextBtn = page.locator('button', { hasText: 'Skopiowano' });
    await expect(copiedTextBtn).toBeVisible();

    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('u=1217011');
  });

  test('opening profile fetches 1 profile shard request and ranking causes 0 extra values/* requests', async ({
    page,
  }) => {
    const profileRequests: string[] = [];
    const valuesRequests: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('/data/profiles/')) {
        profileRequests.push(req.url());
      }
      if (req.url().includes('/data/values/')) {
        valuesRequests.push(req.url());
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Profile shard 12.json should be requested
    expect(profileRequests.length).toBe(1);

    const initialValuesCount = valuesRequests.length;

    // Klik w "Pokaż wszystkie" oraz w inne województwo
    const rankingContainer = page.locator('[data-slot="side"]');
    const showAllBtn = rankingContainer.locator('button', { hasText: /Pokaż wszystkie/ });
    await showAllBtn.click();

    // 0 dodatkowych values/* requestów z tytułu kalkulacji rankingu
    expect(valuesRequests.length).toBe(initialValuesCount);
  });

  test('no layout overlap at 1440x900 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    await expect(sidePanel).toBeVisible();

    const sideBox = await sidePanel.boundingBox();
    expect(sideBox).not.toBeNull();
    expect(sideBox!.width).toBeGreaterThanOrEqual(400);

    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);
  });
});
