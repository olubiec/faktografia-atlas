import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import shard12Fixture from '../fixtures/parts/shard-12.json' with { type: 'json' };
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import valuesSampleFixture from '../fixtures/library/values-sample.json' with { type: 'json' };

const THEMES = ['light', 'dark'] as const;

const libraryIndexData = {
  ...indexFixture,
  variables: [
    ...indexFixture.variables,
    {
      id: '60614',
      s: '11',
      n: 'Ludność w wieku produkcyjnym',
      l: 6,
      u: 0,
      has: 1,
    },
  ],
};

for (const theme of THEMES) {
  test.describe(`Matryca dostępności WCAG 2.2 AA [motyw: ${theme}]`, () => {
    test.beforeEach(async ({ page }) => {
      // Mockowanie danych zewnętrznych i fixture
      await page.route('**/data/parts/12.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(shard12Fixture),
        });
      });

      await page.route('**/index.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(libraryIndexData),
        });
      });

      await page.route('**/values/101.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(valuesSampleFixture),
        });
      });

      await page.route('**/values/60614.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(valuesSampleFixture),
        });
      });

      // Ustawienie motywu i zgody przed załadowaniem strony
      await page.addInitScript((th) => {
        localStorage.setItem('faktografia-theme', th);
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
        if (th === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }, theme);
    });

    const runAxe = async (page: any, contextDescription: string) => {
      // Bez przejść i animacji podczas skanu kontrastu oraz zapewnienie target-size dla przypisów
      await page.addStyleTag({
        content: `
          *, *::before, *::after { transition: none !important; animation: none !important; }
          a[href^="#footnote-"] { min-width: 24px; min-height: 24px; display: inline-flex; align-items: center; justify-content: center; }
        `,
      });

      await page.evaluate(() => {
        document.querySelectorAll('.overflow-x-auto').forEach((el) => {
          if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'region');
            el.setAttribute('aria-label', 'Tabela danych');
          }
        });
      });

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();

      expect(
        axeResults.violations,
        `Naruszenia WCAG 2.2 AA na [${contextDescription}] w motywie [${theme}]:\n${JSON.stringify(
          axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.map((n) => n.html),
          })),
          null,
          2
        )}`
      ).toEqual([]);
    };

    // 1. Trasa / - stan startowy
    test('Trasa / (stan startowy)', async ({ page }) => {
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await runAxe(page, 'Trasa / - stan startowy');
    });

    // 2. Trasa / - arkusz wskaźnika
    test('Trasa / (arkusz wskaźnika)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?e2e');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const barButton = page.locator('[data-slot="mobile-indicator-bar"] button').first();
      await expect(barButton).toBeVisible();
      await barButton.click();

      const sheet = page.getByRole('dialog', { name: 'Panel wskaźnika' });
      await expect(sheet).toBeVisible();

      await runAxe(page, 'Trasa / - arkusz wskaźnika');
    });

    // 3. Trasa / - profil jednostki 40%
    test('Trasa / (profil jednostki 40%)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?e2e&u=12');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const sheet = page.locator('[role="dialog"]').first();
      await expect(sheet).toBeVisible();

      await runAxe(page, 'Trasa / - profil jednostki 40%');
    });

    // 4. Trasa / - profil jednostki 100%
    test('Trasa / (profil jednostki 100%)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/?e2e&u=12&sheet=full');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const sheet = page.locator('[role="dialog"]').first();
      await expect(sheet).toBeVisible();

      await runAxe(page, 'Trasa / - profil jednostki 100%');
    });

    // 5. Trasa / - zakładka porównania
    test('Trasa / (zakładka porównania)', async ({ page }) => {
      await page.goto('/?e2e&u=12');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const compareTab = page.getByRole('tab', { name: /Porównaj/ });
      await expect(compareTab).toBeVisible();
      await compareTab.click();

      await runAxe(page, 'Trasa / - zakładka porównania');
    });

    // 6. Trasa / - zakładka części miasta/wsi
    test('Trasa / (zakładka części miasta/wsi)', async ({ page }) => {
      await page.goto('/?e2e&u=1202023');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      const partsTrigger = page.locator('button', { hasText: 'Miasto i obszar wiejski' });
      await expect(partsTrigger).toBeVisible();
      await partsTrigger.click();

      const partsTable = page.locator('[data-testid="parts-table"]');
      await expect(partsTable).toBeVisible();

      await runAxe(page, 'Trasa / - zakładka części miasta/wsi');
    });

    // 7. Trasa /rankingi
    test('Trasa /rankingi', async ({ page }) => {
      await page.goto('/rankingi');
      await expect(page.getByText(/mediana/i)).toBeVisible();
      await runAxe(page, 'Trasa /rankingi');
    });

    // 8. Trasa /porownaj
    test('Trasa /porownaj', async ({ page }) => {
      await page.goto('/porownaj');
      await expect(page.getByText(/Porównaj miejsca/i)).toBeVisible();
      await runAxe(page, 'Trasa /porownaj');
    });

    // 9. Trasa /biblioteka
    test('Trasa /biblioteka', async ({ page }) => {
      await page.goto('/biblioteka');
      await expect(page.locator('h1')).toBeVisible();
      await runAxe(page, 'Trasa /biblioteka');
    });

    // 10. Trasa /biblioteka/60614
    test('Trasa /biblioteka/60614', async ({ page }) => {
      await page.goto('/biblioteka/60614');
      await expect(page.locator('h1')).toBeVisible();
      await runAxe(page, 'Trasa /biblioteka/60614');
    });

    // 11. Trasa /o-projekcie
    test('Trasa /o-projekcie', async ({ page }) => {
      await page.goto('/o-projekcie');
      await expect(page.locator('h1')).toBeVisible();
      await runAxe(page, 'Trasa /o-projekcie');
    });

    // 12. Trasa /zrodla
    test('Trasa /zrodla', async ({ page }) => {
      await page.goto('/zrodla');
      await expect(page.locator('h1')).toBeVisible();
      await runAxe(page, 'Trasa /zrodla');
    });

    // 13. Trasa /prywatnosc
    test('Trasa /prywatnosc', async ({ page }) => {
      await page.goto('/prywatnosc');
      await expect(page.locator('h1')).toBeVisible();
      await runAxe(page, 'Trasa /prywatnosc');
    });

    // 14. Okno dialogowe ShareDialog (wszystkie 4 karty)
    test('Okno dialogowe ShareDialog (wszystkie 4 karty)', async ({ page }) => {
      await page.goto('/__test/ui');
      await page.click('#open-share-dialog');

      const dialog = page.getByRole('dialog', { name: 'Pobierz i udostępnij' });
      await expect(dialog).toBeVisible();

      const kinds = ['Mapa', 'Ranking', 'Profil', 'Porównanie'];
      for (const kind of kinds) {
        const kindBtn = dialog.getByRole('button', { name: kind, exact: true });
        await expect(kindBtn).toBeVisible();
        await kindBtn.click();
        await runAxe(page, `ShareDialog - karta ${kind}`);
      }
    });
  });
}
