import { test, expect, type Page } from '@playwright/test';
import units from '../../public/data/units.json' with { type: 'json' };
import { canvasPoint, VOIVODESHIP_CENTROIDS } from './helpers/map-tap';
import { expectNoHorizontalScroll } from './helpers/mobile-audit';
import { openMap } from './helpers/open-map';

// Ścieżka S3 „od kraju do gminy” (docs/research/u/U08.md §4): kraj → województwo → powiat → gmina → profil → okruszki wstecz.
// Dziś mapa jest pod `/`; adres mapy bierzemy z openMap(), więc test działa też po przestawieniu tras.

type Unit = { teryt: string; name: string; level: string; parent: string | null };
const all = units as Unit[];

const VOIVODESHIP = all.find((u) => u.teryt === '22')!; // pomorskie – ma środek w VOIVODESHIP_CENTROIDS
const POWIAT = all.find((u) => u.level === 'pow' && u.parent === VOIVODESHIP.teryt)!;
const GMINA = all.find((u) => u.level === 'gmi' && u.parent === POWIAT.teryt)!;

const INDICATOR = 'density';

const search = async (page: Page) => new URLSearchParams(await page.evaluate(() => window.location.search));
const uParam = async (page: Page) => (await search(page)).get('u');
const selected = (page: Page) =>
  page.evaluate(() => (window as unknown as { __atlas: { selected: string | null } }).__atlas.selected);

/** Wybiera województwo dotknięciem mapy; na wąskim ekranie pierwsze dotknięcie pokazuje dymek, drugie otwiera profil. */
async function tapVoivodeship(page: Page) {
  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
  const { x, y } = await canvasPoint(page, canvas, VOIVODESHIP_CENTROIDS.pomorskie.lon, VOIVODESHIP_CENTROIDS.pomorskie.lat);
  await canvas.click({ position: { x, y } });
  if ((await uParam(page)) === null) {
    await canvas.click({ position: { x, y } });
  }
  await expect.poll(() => uParam(page)).toBe(VOIVODESHIP.teryt);
}

/**
 * Wybiera jednostkę niższego poziomu. Na komputerze z listy „Jednostki podrzędne” pod mapą;
 * na telefonie lista jest w zakładce profilu (zakładka z nazwą poziomu, np. „Powiaty”).
 */
async function pickSubUnit(page: Page, name: string, expectedTeryt: string) {
  const list = page.locator('ul[aria-label="Jednostki podrzędne"]').filter({ visible: true }).first();
  if (await list.isVisible()) {
    await list.getByRole('button', { name, exact: true }).click();
  } else {
    await page.locator('[data-slot="tabs-trigger"]').filter({ visible: true }).nth(1).click();
    const short = name.replace(/^powiat\s+/i, '');
    await page.locator('[data-slot="child-unit-button"]').filter({ visible: true, hasText: short }).first().click();
  }
  await expect.poll(() => uParam(page)).toBe(expectedTeryt);
}

async function expectedValue(page: Page, teryt: string): Promise<number> {
  const res = await page.request.get(`/data/values/${INDICATOR}.json`);
  const data = (await res.json()) as { years: number[]; values: Record<string, Array<number | null>> };
  // Profil pokazuje najnowszą wartość wskaźnika dla jednostki
  const series = data.values[teryt] ?? [];
  const value = series[data.years.length - 1];
  expect(value, `brak najnowszej wartości ${INDICATOR} dla ${teryt}`).not.toBeNull();
  return value as number;
}

for (const width of [390, 1280]) {
  test.describe(`@PATH-3 od kraju do gminy (${width} px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      // Odrzucona zgoda, żeby baner nie zasłaniał dołu ekranu
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
    });

    test(`@PATH-3 u= to TERYT jako tekst, profil pokazuje wartość z mapy, okruszki zgodne z adresem, „Wróć” cofa o poziom (${width} px)`, async ({ page }) => {
      test.setTimeout(90_000);
      await openMap(page, `?e2e&i=${INDICATOR}`);
      await page.waitForFunction(() => (window as unknown as { __atlas?: { ready: boolean } }).__atlas?.ready === true);
      await page.waitForFunction(() => (window as unknown as { __atlas?: { choropleth: unknown } }).__atlas?.choropleth != null);
      expect(await uParam(page)).toBeNull();
      expect(await selected(page)).toBeNull();

      // 1. Kraj → województwo
      await tapVoivodeship(page);
      expect(await selected(page)).toBe(VOIVODESHIP.teryt);

      // 2. Województwo → powiat → gmina (TERYT zawsze jako tekst, z zerem wiodącym w razie potrzeby)
      await pickSubUnit(page, POWIAT.name, POWIAT.teryt);
      expect(POWIAT.teryt).toMatch(/^\d{4}$/);
      await pickSubUnit(page, GMINA.name, GMINA.teryt);
      expect(GMINA.teryt).toMatch(/^\d{7}$/);
      expect(await selected(page)).toBe(GMINA.teryt);
      await page.waitForFunction(() => (window as unknown as { __atlas?: { profileOpen: boolean } }).__atlas?.profileOpen === true);

      // 3. Profil pokazuje tę samą liczbę, którą mapa bierze z public/data/values
      const value = await expectedValue(page, GMINA.teryt);
      const profileValue = page.locator('span.text-3xl').filter({ visible: true }).first();
      await expect(profileValue).toBeVisible();
      const shown = Number.parseFloat(((await profileValue.textContent()) ?? '').replace(/\s/g, '').replace(',', '.'));
      expect(shown).toBeCloseTo(value, 1);

      // 4. Okruszki zgodne z adresem
      const nav = page.locator('nav[aria-label="Ścieżka"]');
      await expect(nav).toContainText('Polska');
      await expect(nav).toContainText(VOIVODESHIP.name);
      await expect(nav).toContainText(GMINA.name.slice(0, 4));
      await expect(nav.locator('[aria-current="page"]')).toContainText(GMINA.name.slice(0, 4));

      // 5. Okruszki wstecz: poziom wyżej = powiat, potem województwo; adres i stan zgodne
      const parentCrumb = nav.locator('li button').filter({ visible: true });
      await expect(parentCrumb.first()).toBeVisible();
      await page.getByRole('button', { name: 'Wróć' }).filter({ visible: true }).first().click();
      await expect.poll(() => uParam(page)).toBe(POWIAT.teryt);
      expect(await selected(page)).toBe(POWIAT.teryt);
      await page.getByRole('button', { name: 'Wróć' }).filter({ visible: true }).first().click();
      await expect.poll(() => uParam(page)).toBe(VOIVODESHIP.teryt);
      expect(await selected(page)).toBe(VOIVODESHIP.teryt);

      // 6. Okruszek „Polska” wraca na poziom kraju i czyści u=
      await nav.locator('button', { hasText: 'Polska' }).click();
      await expect.poll(() => uParam(page)).toBeNull();
      expect(await selected(page)).toBeNull();

      // Wskaźnik z adresu przeżywa całą wędrówkę
      const params = await search(page);
      expect(params.get('i')).toBe(INDICATOR);

      if (width === 390) await expectNoHorizontalScroll(page, 'S3 na telefonie');
    });
  });
}
