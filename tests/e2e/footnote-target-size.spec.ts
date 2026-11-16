import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const explanationsFixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/explanations.json'), 'utf-8')
);

// Gmina 1217011 dziedziczy część wskaźników z jednostki wyższej, więc ma przypisy.
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];

async function openProfile(page: Page, width: number, height: number) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'fa-consent-v1',
      JSON.stringify({ value: 'denied', at: new Date().toISOString() })
    );
  });
  await page.route('**/data/explanations.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(explanationsFixture),
    });
  });
  await page.setViewportSize({ width, height });
  await page.goto('/?e2e&u=1217011&sheet=full');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true, null, {
    timeout: 20_000,
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`Pole przypisów w profilu ${vp.name} @S14`, () => {
    test(`każdy widoczny odnośnik przypisu ma co najmniej 24x24 px (${vp.name}) @S14`, async ({
      page,
    }) => {
      await openProfile(page, vp.width, vp.height);
      const links = page.locator('a[href^="#footnote-"]');
      await expect(links.first()).toBeAttached({ timeout: 20_000 });
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
      let checked = 0;
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        await link.scrollIntoViewIfNeeded();
        if (!(await link.isVisible())) continue;
        const box = await link.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(24);
        expect(box!.height).toBeGreaterThanOrEqual(24);
        checked++;
      }
      expect(checked).toBeGreaterThan(0);
    });

    test(`axe target-size bez wstrzykniętego stylu: 0 naruszeń przypisów (${vp.name}) @S14`, async ({
      page,
    }) => {
      await openProfile(page, vp.width, vp.height);
      await expect(page.locator('a[href^="#footnote-"]').first()).toBeAttached({ timeout: 20_000 });
      const results = await new AxeBuilder({ page }).withRules(['target-size']).analyze();
      const footnoteViolations = results.violations.filter((v) =>
        v.nodes.some((n) => n.html.includes('href="#footnote-'))
      );
      expect(footnoteViolations, JSON.stringify(footnoteViolations, null, 2)).toEqual([]);
    });

    test(`kliknięcie przypisu przewija do #footnote-<id> i nie zmienia aria-expanded (${vp.name}) @S14`, async ({
      page,
    }) => {
      await openProfile(page, vp.width, vp.height);
      const link = page.locator('a[href^="#footnote-"]').first();
      await expect(link).toBeAttached({ timeout: 20_000 });
      await link.scrollIntoViewIfNeeded();
      const href = (await link.getAttribute('href'))!;
      const id = href.slice(1);
      const row = link.locator('xpath=ancestor::div[.//button[@aria-expanded]][1]');
      const rowButton = row.locator('button[aria-expanded]').first();
      const before = await rowButton.getAttribute('aria-expanded');

      await link.click();

      const target = page.locator(`#${id}`);
      await expect(target).toBeInViewport();
      await expect(rowButton).toHaveAttribute('aria-expanded', before!);
    });
  });
}
