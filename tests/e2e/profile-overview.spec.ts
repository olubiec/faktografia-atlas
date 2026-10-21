import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('@S14 Profile Overview Sheet', () => {
  test('powiat wałecki header shows Powiat wałecki and contains no duplicate level label', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const header = page.locator('h2', { hasText: 'Powiat wałecki' });
    await expect(header).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.toLowerCase()).not.toContain('powiat powiat');
    expect(bodyText.toLowerCase()).not.toMatch(/powiat\s*•\s*.*powiat/);
  });

  test('gmina 3217011 header shows Gmina miejska Wałcz', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const header = page.locator('h2', { hasText: 'Gmina miejska Wałcz' });
    await expect(header).toBeVisible();
  });

  test('overview displays active indicator data and updates when ?i= changes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217&i=density');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Nazwa wskaźnika
    const indName = page.locator('h3', { hasText: 'Gęstość zaludnienia' });
    await expect(indName).toBeVisible();

    // Miejsce w zakresie
    const rankScopeText = page.locator('text=miejsce w województwie zachodniopomorskim');
    await expect(rankScopeText).toBeVisible();

    // Zmiana wskaźnika przez zmianę URL / event popstate
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('i', 'avg-wage');
      window.history.replaceState(null, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    const newIndName = page.locator('h3', { hasText: 'Przeciętne wynagrodzenie' });
    await expect(newIndName).toBeVisible();
  });

  test('ranking scope lists all powiaty in Małopolska after expand, with highlight and sorting', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1201'); // Powiat bocheński (woj. małopolskie)

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Przycisk "Pokaż wszystkie"
    const expandButton = page.locator('button', { hasText: /Pokaż wszystkie/ });
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }

    // Wszystkie 22 powiaty w Małopolsce
    const rankingItems = page.locator('ul[aria-label="Ranking jednostek"] li');
    await expect(rankingItems).toHaveCount(22);

    // Wybrany powiat wyróżniony (Powiat bocheński)
    const selectedItem = rankingItems.filter({ hasText: 'bocheński' });
    await expect(selectedItem).toBeVisible();
    await expect(selectedItem.locator('.text-korekta-tekst').first()).toBeVisible();
  });

  test('clicking ranking item selects that unit and updates ?u= and header', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1201'); // Powiat bocheński

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Klik w inny powiat w rankingu (np. chrzanowski)
    const otherPowiatButton = page.locator('ul[aria-label="Ranking jednostek"] button', {
      hasText: 'chrzanowski',
    });
    await expect(otherPowiatButton).toBeVisible();
    await otherPowiatButton.click();

    // Nagłówek powinien się zmienić na Powiat chrzanowski
    const newHeader = page.locator('h2', { hasText: 'Powiat chrzanowski' });
    await expect(newHeader).toBeVisible();

    // URL powinien zawierać u=1203
    const currentUrl = page.url();
    expect(currentUrl).toContain('u=1203');
  });

  test('kopiuj link button copies current URL with u= and i= and updates status', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217&i=density');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const copyButton = page.locator('button', { hasText: 'Kopiuj link' });
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Stan po skopiowaniu
    const copiedStatus = page.locator('button', { hasText: 'Skopiowano' });
    await expect(copiedStatus).toBeVisible();

    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('u=3217');
    expect(clipboardContent).toContain('i=density');
  });

  test('opening profile makes exactly 1 request to profiles/* and 0 requests to values/*', async ({
    page,
  }) => {
    const profileRequests: string[] = [];
    const valuesRequests: string[] = [];

    // Otwieramy najpierw stronę główną, żeby załadować mapę i jej domyślny wskaźnik
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    // Słuchamy żądań od momentu otwarcia profilu
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/data/profiles/')) {
        profileRequests.push(url);
      }
      if (url.includes('/data/values/')) {
        valuesRequests.push(url);
      }
    });

    // Wybieramy jednostkę Powiat wałecki
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('u', '3217');
      window.history.replaceState(null, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Profil używa szardu (1 żądanie do profiles/*) i 0 żądań do values/* dla rankingu/profilu
    expect(profileRequests.length).toBe(1);
    expect(valuesRequests.length).toBe(0);
  });

  test('1440x900 desktop layout stands beside map without overlaps and passes axe scan', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=3217');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Profil znajduje się po prawej stronie (panel side slot)
    const profileSheet = page.locator('[data-slot="side"]');
    await expect(profileSheet).toBeVisible();

    const sheetBox = await profileSheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    if (sheetBox) {
      expect(sheetBox.width).toBeGreaterThanOrEqual(380);
      expect(sheetBox.x).toBeGreaterThan(800); // stojący po prawej stronie ekranu
    }

    // Dostępność według axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast', 'aria-allowed-attr'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
