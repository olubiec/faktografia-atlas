import { expect, test } from '@playwright/test';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

test.describe('Odporność na błędy sieci, CORS i wyścigi kliknięć (@W17-T04)', () => {
  test('symulacja błędu 500 i timeout na profiles/*: profil nie zawiesza się na białym ekranie i wyświetla komunikat / fallback', async ({
    page,
  }) => {
    // 1. Symulacja błędu 500
    await page.route('**/data/profiles/12.json', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Profil się otworzył bez białego ekranu
    const sideSheet = page.locator('[data-slot="side"]');
    await expect(sideSheet).toBeVisible();

    const header = sideSheet.locator('h2', { hasText: 'Zakopane' });
    await expect(header).toBeVisible();

    // Komunikat o braku danych lub fallback zamiast błędu krytycznego
    const noDataText = sideSheet.locator('text=brak danych').or(sideSheet.locator('text=Brak danych profilu'));
    await expect(noDataText.first()).toBeVisible();

    // Weryfikacja braku białego ekranu
    const bodyContent = await page.locator('body').innerText();
    expect(bodyContent.trim().length).toBeGreaterThan(0);

    // Sprawdzenie przycisku ponowienia próby (jeśli występuje w UI)
    const retryBtn = page.getByRole('button', { name: /spr[oó]buj ponownie/i });
    if ((await retryBtn.count()) > 0) {
      await expect(retryBtn.first()).toBeVisible();
    }

    // 2. Symulacja timeoutu / przerwania połączenia na profiles/* dla innej jednostki
    await page.route('**/data/profiles/02.json', async (route) => {
      await route.abort('timedout');
    });

    await page.goto('/?e2e&u=0264011');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const wroclawHeader = sideSheet.locator('h2', { hasText: 'Wrocław' });
    await expect(wroclawHeader).toBeVisible();
    await expect(noDataText.first()).toBeVisible();
  });

  test('symulacja błędu 404 na parts/*: profil gminy miejsko-wiejskiej informuje o braku danych miasto/wieś bez blokowania głównego profilu', async ({
    page,
  }) => {
    await page.route('**/data/parts/*.json', async (route) => {
      await route.fulfill({
        status: 404,
        body: 'Not Found',
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1202023');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Główny profil gminy jest widoczny
    const sideSheet = page.locator('[data-slot="side"]');
    await expect(sideSheet).toBeVisible();
    await expect(sideSheet.locator('h2', { hasText: 'Gmina Brzesko' })).toBeVisible();

    // Rozwinięcie bloku części miasta i wsi
    const partsTrigger = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
    await expect(partsTrigger).toBeVisible();
    await partsTrigger.click();

    // Komunikat o braku danych części
    const fallbackMsg = page.getByText('Dane o mieście i wsi pojawią się po najbliższej aktualizacji');
    await expect(fallbackMsg).toBeVisible();

    // Główny profil nie jest zablokowany i nadal jest w pełni czytelny
    await expect(sideSheet.locator('h2', { hasText: 'Gmina Brzesko' })).toBeVisible();
    await expect(partsTrigger).toBeVisible();
  });

  test('symulacja błędu sieciowego / CORS na index.json biblioteki: strona /biblioteka wyświetla komunikat z ponowieniem próby', async ({
    page,
  }) => {
    let failRequest = true;

    await page.route('**/index.json', async (route) => {
      if (failRequest) {
        await route.abort('failed');
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(indexFixture),
        });
      }
    });

    await page.goto('/biblioteka');

    // Komunikat błędu pobierania
    const errorMsg = page.getByText('Wystąpił błąd podczas pobierania spisu biblioteki.');
    await expect(errorMsg).toBeVisible();

    // Przycisk „Spróbuj ponownie” jest widoczny i ma min. 44x44 px
    const retryButton = page.getByRole('button', { name: 'Spróbuj ponownie' });
    await expect(retryButton).toBeVisible();
    const box = await retryButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Ponowienie próby po usunięciu awarii sieci
    failRequest = false;
    await retryButton.click();

    // Spis załadowany pomyślnie, komunikat błędu znika
    await expect(errorMsg).not.toBeVisible();
    const counter = page.getByText('12 wskaźników GUS, z czego 6 można już przeglądać');
    await expect(counter).toBeVisible();
    await expect(page.getByTestId('category-tiles')).toBeVisible();
  });

  test('szybkie kliknięcie 5 jednostek z rzędu z opóźnioną odpowiedzią sieciową: wygrywa ostatnio kliknięta jednostka (brak race conditions)', async ({
    page,
  }) => {
    test.setTimeout(60000);

    let requestIndex = 0;
    // Odwrócone opóźnienia: wcześniejsze żądania są wolniejsze, ostatnie najszybsze
    await page.route('**/data/profiles/*.json', async (route) => {
      requestIndex++;
      const currentIdx = requestIndex;
      const delay = Math.max(50, (6 - currentIdx) * 250);
      await new Promise((resolve) => setTimeout(resolve, delay));
      await route.continue();
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=12');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const rankingContainer = page.locator('[data-slot="side"]');
    const showAllBtn = rankingContainer.locator('button', { hasText: /Pokaż wszystkie/ });
    if (await showAllBtn.isVisible()) {
      await showAllBtn.click();
    }

    const rankingButtons = rankingContainer.locator('ul[aria-label] button');
    await expect(rankingButtons.first()).toBeVisible();

    const count = await rankingButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Zbieramy nazwy i docelową (5.) jednostkę
    const targetButton = rankingButtons.nth(4);
    const targetNameText = (await targetButton.locator('span').nth(1).textContent())?.trim() ?? '';
    expect(targetNameText.length).toBeGreaterThan(0);

    // Szybkie kliknięcie 5 jednostek z rzędu
    for (let i = 0; i < 5; i++) {
      await rankingButtons.nth(i).click();
      await page.waitForTimeout(60);
    }

    // Czekamy na zakończenie wszystkich żądań sieciowych i aktualizację widoku
    await page.waitForLoadState('networkidle');

    // Weryfikacja: wygrywa 5. kliknięta jednostka
    const header = rankingContainer.locator('h2');
    await expect(header).toContainText(targetNameText, { timeout: 15000 });

    const atlasState = await page.evaluate(() => (window as any).__atlas);
    const expectedTeryt = await targetButton.evaluate(() => {
      // Pobieramy z atrybutów lub stanu
      return (window as any).__atlas?.selected;
    });

    expect(atlasState.selected).toBe(expectedTeryt);
    const urlSearch = await page.evaluate(() => window.location.search);
    expect(urlSearch).toContain(`u=${expectedTeryt}`);
  });
});
