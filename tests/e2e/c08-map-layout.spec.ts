import { test, expect, type Page } from '@playwright/test';
import { openMap } from './helpers/open-map';

// C08: panele, okienka i przyciski na /mapa mają stałe położenia: nie nakładają się i mieszczą się w oknie.
const WIDTHS = [360, 390, 768, 1024, 1280];
const HEIGHT = 800;

type Rect = { name: string; x: number; y: number; w: number; h: number };

/** Prostokąty widocznych elementów, które mają się nie przecinać. Okno „Wybierz dane” jest modalne, więc nie wchodzi w porównanie. */
async function collect(page: Page): Promise<Rect[]> {
  return page.evaluate(() => {
    const sel: Record<string, string> = {
      'pasek wskaźnika': '[data-slot="mobile-indicator-bar"]',
      'panel wskaźnika': 'aside[aria-label="Panel wskaźnika"]:not([data-slot="mobile-indicator-bar"])',
      'okienko miejsca': '[role="status"]',
      'profil': '[role="dialog"]:not([aria-label="Wybierz dane"])',
      'Cofnij': 'button[aria-label="Wróć do wyższego poziomu"]',
      'okruszki': 'nav[aria-label="Ścieżka"]',
      'atrybucja': '.maplibregl-ctrl-attrib',
    };
    const out: { name: string; x: number; y: number; w: number; h: number }[] = [];
    for (const [name, css] of Object.entries(sel)) {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(css))) {
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (r.width < 1 || r.height < 1 || st.visibility === 'hidden' || st.display === 'none') continue;
        // Dolny arkusz (react-modal-sheet) ma wysokość 90%, a wystaje tylko jego część (40%/90%): liczy się widoczna część.
        const h = name === 'profil' ? Math.min(r.height, window.innerHeight - r.y) : r.height;
        out.push({ name, x: r.x, y: r.y, w: r.width, h });
      }
    }
    return out;
  });
}

function intersects(a: Rect, b: Rect): boolean {
  const eps = 1;
  return a.x + a.w - eps > b.x && b.x + b.w - eps > a.x && a.y + a.h - eps > b.y && b.y + b.h - eps > a.y;
}

async function expectLayout(page: Page, width: number) {
  const rects = await collect(page);
  for (const r of rects) {
    expect(r.x, `${r.name} mieści się z lewej`).toBeGreaterThanOrEqual(-1);
    expect(r.y, `${r.name} mieści się u góry`).toBeGreaterThanOrEqual(-1);
    expect(r.x + r.w, `${r.name} mieści się z prawej`).toBeLessThanOrEqual(width + 1);
    expect(r.y + r.h, `${r.name} mieści się na dole`).toBeLessThanOrEqual(HEIGHT + 1);
  }
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      // Profil (arkusz) jest warstwą nad mapą, okruszki i „Cofnij” mają przy nim ustąpić na telefonie lub być w innej kolumnie.
      expect(intersects(rects[i], rects[j]), `${rects[i].name} nie przecina ${rects[j].name}`).toBe(false);
    }
  }
}

async function ready(page: Page, query: string) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await openMap(page, query);
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

for (const width of WIDTHS) {
  test.describe(`@C08 układ na mapie ${width}px`, () => {
    test.setTimeout(90000);
    test.use({ viewport: { width, height: HEIGHT } });

    test('bez wyboru: elementy się nie przecinają', async ({ page }) => {
      await ready(page, '?e2e');
      await expectLayout(page, width);
    });

    test('wybrana gmina (profil zamknięty): elementy się nie przecinają', async ({ page }) => {
      await ready(page, '?e2e&u=1217011');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);
      await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);
      await expectLayout(page, width);
    });

    test('profil otwarty: elementy się nie przecinają, nazwa miejsca i wskaźnika raz w widoku', async ({ page }) => {
      await ready(page, '?e2e&u=1217011');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);
      await page.waitForTimeout(500);
      await expectLayout(page, width);
    });

    test('okno „Wybierz dane”: mieści się w oknie, reszta się nie przecina', async ({ page }) => {
      await ready(page, '?e2e');
      if (width < 768) await page.locator('[data-slot="mobile-indicator-bar"]').getByRole('button').first().click();
      await page.getByRole('button', { name: /Wybierz dane/ }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Wybierz dane' });
      await expect(dialog).toBeVisible();
      const r = await dialog.boundingBox();
      expect(r!.x).toBeGreaterThanOrEqual(-1);
      expect(r!.y).toBeGreaterThanOrEqual(-1);
      expect(r!.x + r!.width).toBeLessThanOrEqual(width + 1);
      expect(r!.y + r!.height).toBeLessThanOrEqual(HEIGHT + 1);
    });
  });
}

test.describe('@C08 powtórzenia w widoku', () => {
  test.setTimeout(90000);
  for (const width of [390, 1280]) {
    test(`${width}px: nazwa wybranej jednostki i wskaźnika po jednym razie (poza profilem)`, async ({ page }) => {
      await page.setViewportSize({ width, height: HEIGHT });
      await ready(page, '?e2e&u=1217011');
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
      await page.waitForTimeout(500);
      const counts = await page.evaluate(() => {
        const inProfile = (el: Element) => !!el.closest('[data-slot="side"], [role="dialog"]');
        const visible = (el: Element) => {
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && st.visibility !== 'hidden';
        };
        const countText = (text: string) =>
          Array.from(document.querySelectorAll('body *')).filter(
            (el) => el.children.length === 0 && (el.textContent ?? '').trim() === text && visible(el) && !inProfile(el)
          ).length;
        const indicator = document.querySelector('[data-slot="mobile-indicator-bar"] span, aside[aria-label="Panel wskaźnika"] button')?.textContent ?? '';
        return { unit: countText('Zakopane'), indicator: indicator ? countText(indicator.trim()) : -1 };
      });
      expect(counts.unit).toBeLessThanOrEqual(1);
      expect(counts.indicator).toBeLessThanOrEqual(1);
    });
  }
});
