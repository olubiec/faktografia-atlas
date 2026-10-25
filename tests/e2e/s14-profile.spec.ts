import { test, expect } from '@playwright/test';

test.describe('Full Desktop Profile Flow (@S14)', () => {
  test('@s14 profil – komputer', async ({ page }) => {
    test.setTimeout(60000);

    const profileRequests: string[] = [];
    const valuesRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/data/profiles/')) {
        profileRequests.push(url);
      } else if (url.includes('/data/values/')) {
        valuesRequests.push(url);
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Wejście na stronę główną / z ?e2e
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const initialProfileReqCount = profileRequests.length;

    // 2. Wyszukiwarka „małopolskie” (użycie przycisku w nagłówku dla pełnej niezawodności w e2e)
    const searchTrigger = page.locator('header button', { hasText: 'Szukaj miejsca...' });
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const searchInput = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('małopolskie');

    const firstResult = page.locator('div[role="dialog"] [cmdk-item]').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('małopolskie');
    await page.keyboard.press('Enter');

    // Czekaj na otwarcie profilu i wybór Małopolskiego (?u=12)
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.waitForFunction(() => (window as any).__atlas?.selected === '12');

    // Sprawdź nagłówek
    const sidePanel = page.locator('[data-slot="side"]');
    const header = sidePanel.locator('h2');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Województwo małopolskie');

    // Wybór jednostki 12 wywołuje 1 żądanie profiles/12.json
    expect(profileRequests.length - initialProfileReqCount).toBe(1);
    expect(profileRequests[profileRequests.length - 1]).toContain('/data/profiles/12.json');

    // Sprawdź przegląd: duża liczba, kółko, ranking z 16 pozycjami po "Pokaż wszystkie"
    const showAllBtn = sidePanel.locator('button', { hasText: /Pokaż wszystkie/ });
    await expect(showAllBtn).toBeVisible();
    await showAllBtn.click();

    const rankingItems = sidePanel.locator('ul[aria-label] li');
    await expect(rankingItems).toHaveCount(16);

    const annotation = page.locator('.rough-annotation');
    await expect(annotation).toHaveCount(1);

    // 3. Rozwinięcie „Stopa bezrobocia rejestrowanego”
    const reqCountBeforeExpandProfiles = profileRequests.length;
    const reqCountBeforeExpandValues = valuesRequests.length;

    const unemploymentRowBtn = sidePanel.locator('button[aria-expanded]', {
      hasText: 'Stopa bezrobocia rejestrowanego',
    });
    await expect(unemploymentRowBtn).toBeVisible();
    await unemploymentRowBtn.click();
    await expect(unemploymentRowBtn).toHaveAttribute('aria-expanded', 'true');

    // Rozwinięcie wiersza = 0 żądań
    expect(profileRequests.length).toBe(reqCountBeforeExpandProfiles);
    expect(valuesRequests.length).toBe(reqCountBeforeExpandValues);

    // 4. „Pokaż na mapie” zmienia ?i= i window.__atlas
    const showOnMapBtn = sidePanel.locator('button', { hasText: 'Pokaż na mapie' });
    await expect(showOnMapBtn).toBeVisible();

    const valuesReqBeforeMapClick = valuesRequests.length;
    await showOnMapBtn.click();

    await page.waitForFunction(
      () => (window as any).__atlas?.choropleth?.indicatorId === 'unemployment-rate'
    );

    const urlSearch = await page.evaluate(() => window.location.search);
    expect(urlSearch).toContain('i=unemployment-rate');

    // Zmiana wskaźnika ≤ 1 values/*
    expect(valuesRequests.length - valuesReqBeforeMapClick).toBeLessThanOrEqual(1);

    // 5. Zakładka „Powiaty (n)”
    const reqCountBeforeTabsProfiles = profileRequests.length;
    const reqCountBeforeTabsValues = valuesRequests.length;

    const powiatyTab = page.getByRole('tab', { name: /Powiaty \(\d+\)/ });
    await expect(powiatyTab).toBeVisible();
    await powiatyTab.click();
    await expect(powiatyTab).toHaveAttribute('aria-selected', 'true');

    // Przełączenie zakładki = 0 żądań
    expect(profileRequests.length).toBe(reqCountBeforeTabsProfiles);
    expect(valuesRequests.length).toBe(reqCountBeforeTabsValues);

    // Klik w pierwszy powiat na liście
    const childUnitBtn = page.locator('[data-slot="child-unit-button"]').first();
    await expect(childUnitBtn).toBeVisible();
    const childUnitName = await childUnitBtn.locator('span').first().textContent();

    const reqCountBeforeChildUnitProfiles = profileRequests.length;
    await childUnitBtn.click();

    // Wybór powiatu: wy wybranym TERYT w window.__atlas selected się zmienia ORAZ profil jest otwarty
    await page.waitForFunction(
      () => (window as any).__atlas?.selected !== '12' && (window as any).__atlas?.profileOpen === true,
      { timeout: 15000 }
    );

    // Wybór jednostki powoduje ≤ 1 żądanie profiles/* (0 gdy szard zkeszowany)
    expect(profileRequests.length - reqCountBeforeChildUnitProfiles).toBeLessThanOrEqual(1);

    const newHeader = sidePanel.locator('h2');
    await expect(newHeader).toBeVisible({ timeout: 15000 });
    const newHeaderText = await newHeader.textContent();
    expect(newHeaderText).toContain('Powiat');
    if (childUnitName) {
      expect(newHeaderText.toLowerCase()).toContain(childUnitName.toLowerCase());
    }

    const overviewTab = sidePanel.getByRole('tab', { name: 'Przegląd' });
    await expect(overviewTab).toBeVisible({ timeout: 15000 });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    // Walidacja braku niepożądanych tekstów w całym drzewie DOM profilu
    const sideText = await sidePanel.innerText();
    expect(sideText).not.toContain('powiat powiat');
    expect(sideText).not.toContain('undefined');
    expect(sideText).not.toContain('NaN');
  });
});
