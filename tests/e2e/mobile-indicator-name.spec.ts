import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
] as const;
const URLS = ['/?e2e', '/?e2e&u=12'] as const;

for (const vp of VIEWPORTS) {
  for (const url of URLS) {
    test(`pasek wskaźnika: nazwa zawiera widoczny tekst, ${vp.width}x${vp.height} ${url} (@S15)`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        localStorage.setItem(
          'fa-consent-v1',
          JSON.stringify({ value: 'denied', at: new Date().toISOString() })
        );
      });
      await page.goto(url);
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
      await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);

      const button = page.locator('[data-slot="mobile-indicator-bar"] button').first();
      await expect(button).toBeVisible();

      const text = (await button.textContent()) ?? '';
      expect(text).toMatch(/ \d{4} /);

      const results = await new AxeBuilder({ page })
        .include('[data-slot="mobile-indicator-bar"]')
        .withRules(['label-content-name-mismatch'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
