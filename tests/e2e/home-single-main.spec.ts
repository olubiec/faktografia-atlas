import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const VIEWPORTS = [
  { name: 'komputer', width: 1440, height: 900 },
  { name: 'telefon', width: 390, height: 844 },
];
const URLS = ['/?e2e', '/?e2e&u=12'];

for (const vp of VIEWPORTS) {
  for (const url of URLS) {
    test(`@S14 strona główna ma jeden main i brak naruszeń landmarków (${vp.name}, ${url})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(url);
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);

      await expect(page.locator('main')).toHaveCount(1);

      const rules = ['landmark-no-duplicate-main', 'landmark-one-main', 'landmark-unique'];
      const results = await new AxeBuilder({ page }).withRules(rules).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
