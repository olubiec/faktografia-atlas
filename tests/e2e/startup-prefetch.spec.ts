import { test, expect, type Page } from '@playwright/test';

// Wczesne pobranie danych przy wejściu z linku (N-10).

function track(page: Page) {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(new URL(r.url()).pathname));
  const count = (re: RegExp) => urls.filter((u) => re.test(u)).length;
  return { urls, count };
}

test.describe('Start: równoległe pobieranie danych @S99', () => {
  test('@S99 /?u=12: profil prosi się przed chunkiem AtlasMap, jedno żądanie profili', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const t = track(page);
    await page.goto('/?u=12&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true, undefined, { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    const iProfile = t.urls.findIndex((u) => /\/data\/profiles\/12\.json$/.test(u));
    const iMap = t.urls.findIndex((u) => /AtlasMap-[^/]*\.js$/.test(u));
    expect(iProfile).toBeGreaterThanOrEqual(0);
    expect(iMap).toBeGreaterThanOrEqual(0);
    expect(iProfile).toBeLessThan(iMap);
    expect(t.count(/\/data\/profiles\//)).toBe(1);
  });

  test('@S99 /?e2e: bez żądań profili', async ({ page }) => {
    const t = track(page);
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForLoadState('networkidle');
    expect(t.count(/\/data\/profiles\//)).toBe(0);
  });

  test('@S99 /rankingi: bez pobierania admin.topo.json', async ({ page }) => {
    const t = track(page);
    await page.goto('/rankingi');
    await page.waitForLoadState('networkidle');
    expect(t.count(/admin\.topo\.json$/)).toBe(0);
  });

  test('@S99 /?u=abc&e2e: bez żądań profili', async ({ page }) => {
    const t = track(page);
    await page.goto('/?u=abc&e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForLoadState('networkidle');
    expect(t.count(/\/data\/profiles\//)).toBe(0);
  });
});
