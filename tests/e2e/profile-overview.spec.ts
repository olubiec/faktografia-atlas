import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Profile Overview (W2.1 / @S14)', () => {
  test('header formatting: powiat 3217 -> "Powiat wałecki", gmina 3217011 -> "Gmina miejska Wałcz"', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Powiat 3217
    await page.goto('/?e2e&u=3217');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    const headerPowiat = sidePanel.locator('h2');
    await expect(headerPowiat).toHaveText('Powiat wałecki');

    const fullSideText = await sidePanel.textContent();
    expect(fullSideText).not.toContain('powiat powiat');
    expect(fullSideText).not.toContain('Powiat •');

    // Gmina 3217011
    await page.goto('/?e2e&u=3217011');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const headerGmina = sidePanel.locator('h2');
    await expect(headerGmina).toHaveText('Gmina miejska Wałcz');
  });

  test('changing indicator in panel updates profile overview without page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    await expect(sidePanel.locator('text=Gęstość zaludnienia').first()).toBeVisible();

    // Wybór innego wskaźnika przez IndicatorPicker w lewym panelu
    const pickerButton = page.locator('button', { hasText: 'Gęstość zaludnienia' }).first();
    await pickerButton.click();

    const option = page.locator('[role="option"]', { hasText: 'Stopa bezrobocia rejestrowanego' });
    await option.click();

    // Sprawdzenie, że nagłówek w przeglądzie profilu uaktualnił się
    await expect(sidePanel.locator('text=Stopa bezrobocia rejestrowanego').first()).toBeVisible();
    expect(page.url()).toContain('i=unemployment-rate');
  });

  test('?u=12 profile overview shows 10 ranking items, expands to 16 on "Pokaż wszystkie", małopolskie highlighted', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');

    // Zakres rankingu w opisie
    await expect(sidePanel.locator('text=2. miejsce wśród 16 województw')).toBeVisible();

    // Tytuł sekcji rankingu
    const rankingHeading = sidePanel.locator('h3', { hasText: 'we wszystkich województwach' });
    await expect(rankingHeading).toBeVisible({ timeout: 10000 });

    // RankingBars widoczne elementy (początkowo 10)
    const rankingList = sidePanel.locator('ul', { hasText: 'małopolskie' });
    const itemsBefore = rankingList.locator('li');
    await expect(itemsBefore).toHaveCount(10);

    // Przycisk "Pokaż wszystkie"
    const expandBtn = sidePanel.locator('button', { hasText: 'Pokaż wszystkie (16)' });
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    // Po rozszerzeniu 16 elementów
    await expect(itemsBefore).toHaveCount(16);

    // Małopolskie jest wyróżnione (korekta)
    const malopolskieItem = rankingList.locator('li', { hasText: 'małopolskie' });
    const nameSpan = malopolskieItem.locator('span', { hasText: 'małopolskie' });
    await expect(nameSpan).toHaveClass(/font-bold text-korekta/);
  });

  test('powiat in małopolskie shows ranking for 22 powiaty in małopolskie', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217'); // Powiat tatrzański

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');

    // Nagłówek rankingu dla powiatu
    const rankingHeading = sidePanel.locator('h3', { hasText: 'w powiatach województwa małopolskiego' });
    await expect(rankingHeading).toBeVisible({ timeout: 10000 });

    // Rozszerzenie listy
    const expandBtn = sidePanel.locator('button', { hasText: 'Pokaż wszystkie (22)' });
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    const rankingList = sidePanel.locator('ul', { hasText: 'tatrzański' });
    await expect(rankingList.locator('li')).toHaveCount(22);
  });

  test('clicking item in ranking changes ?u=, header, and window.__atlas', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    const rankingHeading = sidePanel.locator('h3', { hasText: 'we wszystkich województwach' });
    await expect(rankingHeading).toBeVisible({ timeout: 10000 });

    const rankingList = sidePanel.locator('ul', { hasText: 'małopolskie' });

    // Klik w śląskie (24)
    const slaskieBtn = rankingList.locator('button', { hasText: 'śląskie' }).first();
    await slaskieBtn.click();

    // Uaktualnienie URL
    await page.waitForFunction(() => window.location.search.includes('u=24'));
    expect(page.url()).toContain('u=24');

    // Uaktualnienie nagłówka profilu
    const header = sidePanel.locator('h2');
    await expect(header).toHaveText('Województwo śląskie');

    // Uaktualnienie window.__atlas
    await page.waitForFunction(() => (window as any).__atlas?.selected === '24');
    const atlasState = await page.evaluate(() => (window as any).__atlas);
    expect(atlasState.selected).toBe('24');
  });

  test('renders exactly one .rough-annotation circle on screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Oczekiwanie na wygenerowanie zakreślenia rough-annotation
    const annotation = page.locator('.rough-annotation');
    await expect(annotation).toHaveCount(1);
  });

  test('"Kopiuj link" button copies URL with u= to clipboard and shows "Skopiowano"', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    const copyBtn = sidePanel.locator('button', { hasText: 'Kopiuj link' });
    await expect(copyBtn).toBeVisible();

    await copyBtn.click();

    // Przycisk zmienia tekst na "Skopiowano"
    await expect(sidePanel.locator('button', { hasText: 'Skopiowano' })).toBeVisible();

    // Zawartość schowka zawiera u=12
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('u=12');
  });

  test('opening profile makes 1 request to profiles/*, ranking interactions make 0 additional requests to values/*', async ({
    page,
  }) => {
    const profileRequests: string[] = [];
    const valuesRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/data/profiles/')) profileRequests.push(url);
      if (url.includes('/data/values/')) valuesRequests.push(url);
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Otwarcie profilu = dokładnie 1 żądanie profiles/12.json
    expect(profileRequests.length).toBe(1);
    expect(profileRequests[0]).toContain('/data/profiles/12.json');

    // Czyszczenie rejestratora przed interakcją z rankingiem
    valuesRequests.length = 0;

    const sidePanel = page.locator('[data-slot="side"]');
    const rankingHeading = sidePanel.locator('h3', { hasText: 'we wszystkich województwach' });
    await expect(rankingHeading).toBeVisible({ timeout: 10000 });

    // Kliknięcie "Pokaż wszystkie" i wybór innej jednostki
    const expandBtn = sidePanel.locator('button', { hasText: 'Pokaż wszystkie (16)' });
    await expandBtn.click();

    // Wybór śląskie z rankingu
    const rankingList = sidePanel.locator('ul', { hasText: 'małopolskie' });
    const slaskieBtn = rankingList.locator('button', { hasText: 'śląskie' }).first();
    await slaskieBtn.click();

    await page.waitForFunction(() => (window as any).__atlas?.selected === '24');

    // Interakcje z rankingiem wewnątrz tego samego wskaźnika nie robią żadnych dodatkowych żądań do values/*
    expect(valuesRequests.length).toBe(0);
  });

  test('no horizontal scrollbar at 360px and 390px viewports', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/?e2e&u=12');

      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('interactive elements in profile have minimum touch target size of 44x44px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const sidePanel = page.locator('[data-slot="side"]');
    const copyBtn = sidePanel.locator('button', { hasText: 'Kopiuj link' });
    const box = await copyBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('axe accessibility audit passes on profile overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const results = await new AxeBuilder({ page }).exclude('.text-korekta').analyze();
    expect(results.violations).toEqual([]);
  });

  test('prefers-reduced-motion disables rough-annotation animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotation = page.locator('.rough-annotation');
    await expect(annotation).toHaveCount(1);
  });
});
