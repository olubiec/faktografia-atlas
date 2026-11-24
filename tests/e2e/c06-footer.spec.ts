import { test, expect } from '@playwright/test';

// C06: krótka, taka sama stopka na każdej stronie; zdanie o kontakcie w „O projekcie”.
const SIZES = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];
const PAGES = ['/', '/o-projekcie', '/zrodla', '/prywatnosc'];

for (const size of SIZES) {
  test.describe(`@C06 stopka ${size.width}px`, () => {
    test.use({ viewport: size });

    for (const path of PAGES) {
      test(`${path}: najwyżej 11 linków (7 + X, Instagram, TikTok, e-mail), bez Biblioteki, pola ≥ 44 px, bez nakładania`, async ({ page }) => {
        await page.addInitScript(() => {
          localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
        });
        await page.goto(path);
        const footer = page.getByRole('contentinfo');
        await footer.scrollIntoViewIfNeeded();
        const links = footer.getByRole('link');
        expect(await links.count()).toBeLessThanOrEqual(11);
        for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))) {
          expect(href).not.toMatch(/^\/(biblioteka|rankingi|porownaj)/);
          expect(href).not.toContain('/mapa?i=');
        }
        const boxes = [];
        for (const l of await links.all()) {
          const b = await l.boundingBox();
          expect(b!.height).toBeGreaterThanOrEqual(44);
          expect(b!.x + b!.width).toBeLessThanOrEqual(size.width + 1);
          boxes.push(b!);
        }
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], c = boxes[j];
            const overlap = a.x < c.x + c.width - 1 && c.x < a.x + a.width - 1 && a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1;
            expect(overlap).toBe(false);
          }
      });
    }

    test('linki wewnętrzne stopki działają', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
      });
      for (const [name, url] of [['O projekcie', /\/o-projekcie$/], ['Skąd są dane', /\/zrodla$/], ['Prywatność i zgoda', /\/prywatnosc$/]] as const) {
        await page.goto('/o-projekcie');
        await page.getByRole('contentinfo').getByRole('link', { name }).click();
        await expect(page).toHaveURL(url);
      }
    });

    test('/o-projekcie zawiera zdanie o kontakcie', async ({ page }) => {
      await page.goto('/o-projekcie');
      await expect(page.getByText(/Zgłoś go.*repozytorium GitHub/i)).toBeVisible();
    });
  });
}
