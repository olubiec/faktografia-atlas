import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Profil: odblokowanie zakładki Porównaj i wybór drugiego miejsca (W15-M03)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
  });

  test('na 1440x900: zakładka Porównaj jest aktywna, wyszukanie i wybór 2. miejsca ustawia ?c=, pokazuje mapki i tabelę, a × czyści (@S18)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e=1');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true
    );

    // Zakładka „Porównaj” jest aktywna (brak disabled) i nie zawiera dopisku „(wkrótce)”
    const compareTab = page.locator('[data-slot="tabs-trigger"]', { hasText: 'Porównaj' });
    await expect(compareTab).toBeVisible();
    await expect(compareTab).toBeEnabled();
    await expect(compareTab).not.toContainText('(wkrótce)');

    // Kliknięcie w zakładkę „Porównaj”
    await compareTab.click({ noWaitAfter: true });

    // Sprawdzenie dostępności (axe) na zakładce przed wyborem drugiego miejsca
    const axeResultsInitial = await new AxeBuilder({ page })
      .include('[data-slot="profile-compare"]')
      .disableRules(['color-contrast'])
      .analyze();
    expect(axeResultsInitial.violations).toEqual([]);

    // Wyszukanie drugiego miejsca (np. „Warszawa” lub „Mazowieckie”)
    const searchInput = page.locator('#compare-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('mazowieckie');

    // Kliknięcie wyniku wyszukiwania
    const searchResultItem = page.locator('button', { hasText: 'mazowieckie' }).first();
    await expect(searchResultItem).toBeVisible();
    await searchResultItem.click();

    // Weryfikacja parametru ?c= w adresie URL
    await expect(page).toHaveURL(/c=12(%2C|,)14/);
    expect(decodeURIComponent(page.url())).toContain('c=12,14');

    // Wyświetla obie mapki oraz tabelę porównania
    const compareMaps = page.locator('[data-slot="compare-maps"]');
    await expect(compareMaps).toBeVisible();

    const compareTable = page.locator('[data-slot="compare-table"]');
    await expect(compareTable).toBeVisible();

    // Brak błędów axe na zakładce porównania po wyborze obu jednostek
    const axeResultsCompare = await new AxeBuilder({ page })
      .include('[data-slot="profile-compare"]')
      .disableRules(['color-contrast'])
      .analyze();
    expect(axeResultsCompare.violations).toEqual([]);

    // Przycisk × czyści porównanie
    const clearButton = page.locator('button[aria-label*="drugie miejsce"], button[aria-label*="Wyczyść"]').first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Po wyczyszczeniu: parametr c usunięty z adresu, mapki i tabela znikają
    await expect(page).not.toHaveURL(/c=/);
    await expect(compareTable).not.toBeVisible();
  });

  test('na 360x740: pasek zakładek mieści się bez poziomego scrolla i bez ucinania etykiet, wybór drugiego miejsca i × działa (@S18)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/?u=12&e2e=1&sheet=full');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true
    );

    // Weryfikacja braku poziomego przewijania
    const isNotHorizontallyScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(isNotHorizontallyScrollable).toBe(true);

    // Sprawdzenie paska zakładek: mieści się w kontenerze bez przewijania
    const tabsList = page.locator('[data-slot="tabs-list"]').first();
    await expect(tabsList).toBeVisible();
    const tabsOverflow = await page.evaluate(() => {
      const el = document.querySelector('[data-slot="tabs-list"]');
      return el ? el.scrollWidth <= el.clientWidth + 1 : false;
    });
    expect(tabsOverflow).toBe(true);

    // Etykiety zakładek są w pełni widoczne
    const compareTab = page.locator('[data-slot="tabs-trigger"]', { hasText: 'Porównaj' }).first();
    await expect(compareTab).toBeVisible();
    await expect(compareTab).toBeEnabled();
    await expect(compareTab).not.toContainText('(wkrótce)');

    // Kliknięcie zakładki Porównaj
    await compareTab.click({ force: true, noWaitAfter: true });

    // Szybki wybór przykładowej jednostki kontrastowej
    const quickPickButton = page.locator('button', { hasText: 'Mazowieckie' }).first();
    await expect(quickPickButton).toBeVisible();
    await quickPickButton.click();

    // Potwierdzenie obecności parametru ?c= w URL
<<<<<<< HEAD
    await page.waitForFunction(() => page.url().includes('c=12,14'));
    expect(page.url()).toContain('c=12,14');
=======
    await expect(page).toHaveURL(/c=12(%2C|,)14/);
    expect(decodeURIComponent(page.url())).toContain('c=12,14');
>>>>>>> origin/main

    // Wyświetlenie tabeli i mapek
    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();

    // Brak błędów axe na telefonie na zakładce porównania
    const axeResults = await new AxeBuilder({ page })
      .include('[data-slot="profile-compare"]')
      .disableRules(['color-contrast'])
      .analyze();
    expect(axeResults.violations).toEqual([]);

    // Przycisk × czyści drugie miejsce
    const clearButton = page.locator('button[aria-label*="drugie miejsce"], button[aria-label*="Wyczyść"]').first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await expect(page).not.toHaveURL(/c=/);
  });

  test('przycisk „Porównaj z innym miejscem” w profilu przełącza na zakładkę porównania', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&e2e=1');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true
    );

    const compareBtn = page.locator('button', { hasText: 'Porównaj z innym miejscem' }).first();
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Po kliknięciu zakładka Porównaj jest aktywna
    const compareTab = page.locator('[data-slot="tabs-trigger"]', { hasText: 'Porównaj' });
    await expect(compareTab).toHaveAttribute('data-state', 'active');
  });

  test('bezpośrednie wejście z ?c=A,B otwiera zakładkę porównania z obiema mapkami i tabelą', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?u=12&c=12,14&e2e=1');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true
    );

    const compareTab = page.locator('[data-slot="tabs-trigger"]', { hasText: 'Porównaj' });
    await expect(compareTab).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-slot="compare-maps"]')).toBeVisible();
    await expect(page.locator('[data-slot="compare-table"]')).toBeVisible();
  });
});
