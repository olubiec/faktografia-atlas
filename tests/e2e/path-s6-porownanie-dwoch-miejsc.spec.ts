import { test, expect, type Page } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers/mobile-audit';
import { openMap } from './helpers/open-map';

// Ścieżka S6 „porównanie dwóch miejsc w profilu” (docs/research/u/U08.md §4):
// profil gminy → „Porównaj z innym miejscem” → szukaj → wybierz → „Kopiuj link” → świeże wejście z linku.

const FIRST = '1465011'; // Warszawa (gmina), TERYT jako tekst

const cParam = async (page: Page) => new URLSearchParams(await page.evaluate(() => window.location.search)).get('c');

async function expectComparison(page: Page) {
  await expect(page.locator('[data-slot="compare-map"]')).toHaveCount(2);
  await expect(page.locator('[data-slot="compare-table"]').filter({ visible: true }).first()).toBeVisible();
}

for (const width of [390, 1280]) {
  test.describe(`@PATH-6 porównanie dwóch miejsc (${width} px)`, () => {
    test(`@PATH-6 c=A,B w adresie, dwa zarysy i tabela, skopiowany link po świeżym wejściu otwiera to samo (${width} px)`, async ({
      page,
      context,
    }) => {
      test.setTimeout(90_000);
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      // Odrzucona zgoda, żeby baner nie zasłaniał dołu ekranu
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });

      // Profil gminy (na telefonie arkusz rozwinięty, żeby przyciski były w zasięgu)
      await openMap(page, `?e2e&u=${FIRST}${width === 390 ? '&sheet=full' : ''}`);
      await page.waitForFunction(
        () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true
      );
      expect(await cParam(page)).toBeNull();

      // „Porównaj z innym miejscem” → wyszukanie drugiego miejsca → wybór
      await page.getByRole('button', { name: 'Porównaj z innym miejscem' }).filter({ visible: true }).first().click({ noWaitAfter: true });
      const search = page.locator('#compare-search-input');
      await expect(search).toBeVisible();
      await search.fill('Kraków');
      const result = page.locator('button', { hasText: 'Kraków' }).filter({ visible: true }).first();
      await expect(result).toBeVisible();
      await result.click();

      // c=A,B w adresie: pierwsze miejsce to profil, drugie to wybrane (oba TERYT jako tekst)
      await expect.poll(() => cParam(page)).toMatch(new RegExp(`^${FIRST},\\d{2,7}$`));
      const c = (await cParam(page)) as string;
      const [a, b] = c.split(',');
      expect(a).toBe(FIRST);
      expect(b).not.toBe(FIRST);

      // Dwa zarysy i tabela
      await expectComparison(page);
      if (width === 390) await expectNoHorizontalScroll(page, 'S6 na telefonie');

      // „Kopiuj link” kopiuje adres z c=A,B
      await page.getByRole('button', { name: 'Kopiuj link' }).filter({ visible: true }).first().click();
      await expect(page.getByRole('button', { name: 'Skopiowano' }).filter({ visible: true }).first()).toBeVisible();
      const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
      expect(copied.searchParams.get('c')).toBe(c);

      // Świeże wejście z skopiowanego linku otwiera to samo porównanie
      const fresh = await context.newPage();
      await fresh.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await fresh.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      await openMap(fresh, `${copied.search}${copied.searchParams.has('e2e') ? '' : '&e2e'}${width === 390 ? '&sheet=full' : ''}`);
      await fresh.waitForFunction(() => (window as any).__atlas?.ready === true);
      await fresh.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      expect(await cParam(fresh)).toBe(c);
      await expectComparison(fresh);
    });
  });
}
