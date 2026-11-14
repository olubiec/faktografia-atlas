import { test, expect, type Page } from '@playwright/test';

/**
 * Dojście do działów tematycznych pod mapą na telefonie (@S99).
 * Mapa zajmuje cały ekran i przejmuje gesty dotyku (touch-action: none),
 * więc przycisk „Działy tematyczne” ma być jedyną wygodną drogą w dół.
 */

const PHONES = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
];

async function openHome(page: Page) {
  // Zgoda odrzucona z góry, żeby pasek zgody nie zasłaniał dolnej części ekranu
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  // Bez sieci: wszystko, co nie jest localhostem, jest odrzucane
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

function dzialyButton(page: Page) {
  return page.getByRole('button', { name: 'Działy tematyczne', exact: true });
}

function dzialyHeading(page: Page) {
  // Nagłówek jest dwa razy na stronie; interesuje nas sekcja pod mapą (jak w home-portal.spec.ts)
  return page.getByRole('heading', { name: 'Działy tematyczne GUS', exact: true }).first();
}

async function isInViewport(page: Page, locator: ReturnType<typeof dzialyHeading>) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  });
}

for (const { width, height } of PHONES) {
  test.describe(`telefon ${width}x${height} (@S99)`, () => {
    test.use({ viewport: { width, height }, hasTouch: true, isMobile: true });

    test(`przycisk „Działy tematyczne” jest widoczny, dotykowy i nie jest zasłonięty (@S99)`, async ({ page }) => {
      await openHome(page);
      const button = dzialyButton(page);
      await expect(button).toBeVisible();

      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);

      // Środek przycisku ma trafiać w przycisk, a nie w mapę pod spodem
      const hitsButton = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return !!el?.closest('button') && el!.closest('button')!.textContent?.includes('Działy tematyczne') === true;
        },
        { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
      );
      expect(hitsButton).toBe(true);
    });

    test(`kliknięcie przewija do sekcji „Działy tematyczne GUS” w widoku (@S99)`, async ({ page }) => {
      await openHome(page);
      const heading = dzialyHeading(page);
      expect(await isInViewport(page, heading)).toBe(false);

      await dzialyButton(page).click();
      await expect.poll(() => isInViewport(page, heading), { timeout: 5000 }).toBe(true);
    });

    test(`brak poziomego przewijania i ucięcia napisów na przycisku (@S99)`, async ({ page }) => {
      await openHome(page);
      const scrollWide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(scrollWide).toBe(false);

      const cut = await dzialyButton(page).evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(cut).toBe(false);
    });

    test(`przycisk ma nazwę dostępną i widoczny fokus z klawiatury (@S99)`, async ({ page }) => {
      await openHome(page);
      const button = dzialyButton(page);
      await expect(button).toHaveAccessibleName('Działy tematyczne');

      await button.focus();
      const ring = await button.evaluate((el) => getComputedStyle(el).boxShadow);
      expect(ring).not.toBe('none');
    });

    test(`przy prefers-reduced-motion przewinięcie jest natychmiastowe (@S99)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openHome(page);
      const heading = dzialyHeading(page);

      await dzialyButton(page).click();
      // Bez animacji sekcja jest w widoku od razu po kliknięciu
      expect(await isInViewport(page, heading)).toBe(true);
    });
  });
}

test('na komputerze przycisk nie pojawia się, a wskazówka „Przewiń w dół” zostaje (@S99)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openHome(page);
  await expect(dzialyButton(page)).toBeHidden();
  await expect(page.getByText(/Przewiń w dół: Działy tematyczne/)).toBeVisible();
});
