import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const VIEWPORTS = [
  { name: 'telefon', width: 390, height: 844 },
  { name: 'komputer', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`@S20 profil otwarty: jeden contentinfo i brak duplikatów landmarków (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    await expect(page.getByRole('contentinfo')).toHaveCount(1);

    const results = await new AxeBuilder({ page })
      .withRules(['landmark-no-duplicate-contentinfo', 'landmark-unique'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
