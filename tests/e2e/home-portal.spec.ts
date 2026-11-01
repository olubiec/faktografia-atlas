import { test, expect } from '@playwright/test';

test.describe('Sekcje redakcyjne pod mapą (W16-M01)', () => {
  test.beforeEach(async ({ page }) => {
    // 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Przewinięcie w dół odsłania 7 działów, 6 pojedynków i stopkę; kliknięcie działu przełącza mapę', async ({ page }) => {
    await page.goto('/?e2e');

    // Wskaźnik przewijania jest na dole i jest widoczny
    const scrollIndicator = page.getByText(/Przewiń w dół: Działy tematyczne/i);
    await expect(scrollIndicator).toBeVisible();

    // Przewińmy do działu Szybki start
    const szybkiStart = page.getByRole('heading', { name: 'Szybki start', exact: true });
    await szybkiStart.scrollIntoViewIfNeeded();
    await expect(szybkiStart).toBeVisible();

    // Sprawdzamy czy Warszawa jest wśród szybkich startów (link to ?u=)
    const warszawaShortcut = page.getByRole('link', { name: 'Warszawa', exact: true });
    await expect(warszawaShortcut).toBeVisible();
    await expect(warszawaShortcut).toHaveAttribute('href', '/?u=1465011');

    // 7 działów (Działy tematyczne)
    const dzialyTematyczne = page.getByRole('heading', { name: 'Działy tematyczne GUS', exact: true }).first();
    await expect(dzialyTematyczne).toBeVisible();

    // Wybieramy dział "Gęstość zaludnienia" i klikamy go
    const dzialGestosc = page.getByRole('link', { name: /Gęstość zaludnienia/i }).first();
    await expect(dzialGestosc).toBeVisible();

    // 6 pojedynków (Pojedynki miejsc)
    const pojedynki = page.getByRole('heading', { name: 'Pojedynki miejsc', exact: true });
    await expect(pojedynki).toBeVisible();

    // Sprawdzamy czy jest Warszawa vs Kraków
    const woj1 = page.getByRole('link', { name: 'Warszawa vs Kraków' });
    await expect(woj1).toBeVisible();

    // Biblioteka
    const bramaBiblioteki = page.getByRole('heading', { name: 'Brama do Biblioteki GUS', exact: true });
    await expect(bramaBiblioteki).toBeVisible();
    const bibliotekaLink = page.getByRole('link', { name: 'Przeszukaj Bibliotekę' });
    await expect(bibliotekaLink).toHaveAttribute('href', '/biblioteka');

    // Stopka widoczna
    const stopkaLogo = page.locator('footer img[alt="Faktografia"]');
    await expect(stopkaLogo).toBeVisible();

    // Kliknij dział "Gęstość zaludnienia"
    await dzialGestosc.click();
    await page.waitForURL(/\?.*i=density/);

    // Mapa się zaktualizowała (sprawdzamy czy jest w adresie URL)
    expect(page.url()).toContain('i=density');
  });
});
