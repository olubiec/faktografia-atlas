import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

function trackNetwork(page: Page) {
  const urls: string[] = [];
  page.on('request', (req) => {
    urls.push(new URL(req.url()).pathname);
  });
  const count = (re: RegExp) => urls.filter((u) => re.test(u)).length;
  return { urls, count };
}

test.describe('Speed and Motion Performance Path Test W3.6 (@S16)', () => {
  test('animated motion path (entry, return, indicator change) runs 3x smoothly (@S16)', async ({ page }) => {
    test.setTimeout(90000);

    const net = trackNetwork(page);

    const testUnits = ['12', '14', '30'];
    const testIndicators = ['unemployment-rate', 'density', 'unemployment-rate'];

    for (let iteration = 0; iteration < 3; iteration++) {
      const targetUnit = testUnits[iteration];
      const targetIndicator = testIndicators[iteration];

      // 1. Initial/Direct Navigation to unit with e2e
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/?e2e&u=${targetUnit}`);
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
      await page.waitForFunction((u) => (window as any).__atlas?.selected === u, targetUnit);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

      // PRODUKT.md §7: Dokładnie jedno żądanie profili przy wyborze miejsca
      expect(net.count(/\/data\/profiles\//)).toBeLessThanOrEqual(iteration + 1);

      const zoomedInZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
      expect(zoomedInZoom).toBeGreaterThan(5.0);

      // 2. Powrót (back to country view via "Wróć" button)
      const backButton = page.locator('button', { hasText: 'Wróć' });
      await expect(backButton).toBeVisible();
      await backButton.click();

      await page.waitForFunction(() => (window as any).__atlas?.selected === null);
      await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);
      await page.waitForFunction((z) => (window as any).__atlas.viewState.zoom < z, zoomedInZoom);

      const returnedZoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
      expect(returnedZoom).toBeLessThan(zoomedInZoom);

      // 3. Zmiana wskaźnika (indicator change)
      const countBeforeIndicator = net.count(/\/data\/values\//);
      await page.evaluate((ind) => {
        const url = new URL(window.location.href);
        url.searchParams.set('i', ind);
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new Event('popstate'));
      }, targetIndicator);

      await page.waitForFunction(
        (ind) => (window as any).__atlas?.choropleth?.indicatorId === ind,
        targetIndicator
      );
      await page.waitForTimeout(400); // Allow color transition

      // PRODUKT.md §7: Jedno żądanie values/<id>.json przy zmianie wskaźnika
      expect(net.count(/\/data\/values\//) - countBeforeIndicator).toBeLessThanOrEqual(1);

      const atlasState = await page.evaluate(() => (window as any).__atlas);
      expect(atlasState.choropleth.indicatorId).toBe(targetIndicator);

      // DOM hygiene check
      const pageText = await page.locator('body').innerText();
      expect(pageText).not.toContain('undefined');
      expect(pageText).not.toContain('NaN');
    }
  });

  test('no horizontal scroll at 360px and 390px viewports (@S16)', async ({ page }) => {
    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e&u=12');
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    }
  });

  test('touch targets >= 44px, axe accessibility and max 1 red annotation (@S16)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Axe accessibility check
    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);

    // Touch targets >= 44px
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    for (let i = 0; i < buttonCount; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.width >= 44 || box.height >= 44).toBe(true);
      }
    }

    // Max 1 red circle annotation visible
    const annotations = page.locator('.rough-annotation');
    const annotationCount = await annotations.count();
    expect(annotationCount).toBeLessThanOrEqual(1);
  });

  test('prefers-reduced-motion disables motion transitions (@S16)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    const initialZoom = await page.evaluate(() => (window as any).__atlas?.viewState?.zoom);

    const backButton = page.locator('button', { hasText: 'Wróć' });
    await backButton.click();

    // Instant update with reduced motion
    const endZoom = await page.evaluate(() => (window as any).__atlas?.viewState?.zoom);
    expect(endZoom).toBeLessThan(initialZoom - 1.0);
  });
});
