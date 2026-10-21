import { test, expect, type Page } from '@playwright/test';

// Progi szybkości z docs/PRODUKT.md §7. Test liczy żądania i rozmiar kodu, nie milisekundy
// (czas zależy od maszyny CI), dlatego jest stabilny.

function track(page: Page) {
  const urls: string[] = [];
  const scripts: { url: string; bytes: number }[] = [];
  page.on('request', (r) => urls.push(new URL(r.url()).pathname));
  page.on('response', async (r) => {
    if (r.request().resourceType() !== 'script') return;
    try {
      const body = await r.body();
      scripts.push({ url: new URL(r.url()).pathname, bytes: body.length });
    } catch {
      /* odpowiedź przerwana przy zamknięciu strony */
    }
  });
  const count = (re: RegExp) => urls.filter((u) => re.test(u)).length;
  return { urls, scripts, count };
}

async function ready(page: Page) {
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
}

test.describe('Budżet szybkości (PRODUKT.md §7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('na wejściu: bez profili, najwyżej jeden plik wskaźnika, żaden skrypt > 2,5 MB', async ({ page }) => {
    const t = track(page);
    await page.goto('/?e2e');
    await ready(page);
    await page.waitForLoadState('networkidle');

    expect(t.count(/\/data\/profiles\//)).toBe(0);
    expect(t.count(/\/data\/values\//)).toBeLessThanOrEqual(1);
    // granice i lista jednostek są osobnymi plikami, nie częścią kodu
    expect(t.count(/\/geo\/admin\.topo\.json$/)).toBe(1);
    expect(t.count(/\/data\/units\.json$/)).toBe(1);

    expect(t.scripts.length).toBeGreaterThan(0);
    for (const s of t.scripts) {
      expect(s.bytes, `${s.url} ma ${s.bytes} B`).toBeLessThan(2_500_000);
    }
  });

  test('wybór jednostki: dokładnie jedno żądanie profili', async ({ page }) => {
    const t = track(page);
    await page.goto('/?u=3217011&e2e');
    await ready(page);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.waitForLoadState('networkidle');

    expect(t.count(/\/data\/profiles\//)).toBe(1);
    expect(t.urls.filter((u) => /\/data\/profiles\//.test(u))[0]).toBe('/data/profiles/32.json');
    // profil nie pobiera już wartości wszystkich wskaźników
    expect(t.count(/\/data\/values\//)).toBeLessThanOrEqual(1);
  });

  test('wskaźnik z adresu: jedno żądanie pliku wartości', async ({ page }) => {
    const t = track(page);
    await page.goto('/?i=density&e2e');
    await ready(page);
    await page.waitForLoadState('networkidle');

    expect(t.count(/\/data\/values\/density\.json$/)).toBe(1);
    expect(t.count(/\/data\/values\//)).toBe(1);
  });
});
