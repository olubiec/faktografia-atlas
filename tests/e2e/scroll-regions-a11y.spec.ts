import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import shard12Fixture from '../fixtures/parts/shard-12.json' with { type: 'json' };

// Bez wstrzykiwania atrybutów: regiony przewijania mają być poprawne w kodzie strony.

async function denyConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
}

async function scrollableRegionViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
  return results.violations;
}

test.describe('Przewijane tabele dostępne z klawiatury (@S21)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await denyConsent(page);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test(`/zrodla ${viewport.width}x${viewport.height}: 0 naruszeń scrollable-region-focusable (@S21)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/zrodla');
      await expect(page.locator('table').first()).toBeVisible();
      expect(await scrollableRegionViolations(page)).toEqual([]);
    });
  }

  test('tabela porównania 1440x900: 0 naruszeń (@S21)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e=1&u=12&c=12,14');
    await page.waitForFunction(
      () => (window as any).__atlas?.ready === true && (window as any).__atlas?.profileOpen === true,
    );
    await expect(page.locator('table[data-slot="compare-table"]')).toBeVisible();
    expect(await scrollableRegionViolations(page)).toEqual([]);
  });

  test('rozwinięty blok części gminy 1440x900: 0 naruszeń (@S21)', async ({ page }) => {
    await page.route('**/data/parts/12.json', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(shard12Fixture) }),
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    await page.locator('header button', { hasText: 'Szukaj miejsca...' }).click();
    const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await input.fill('Brzesko');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toContainText('Brzesko');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window as any).__atlas?.selected === '1202023');

    const side = page.locator('[data-slot="side"]');
    await side.locator('button', { hasText: 'Miasto i obszar wiejski' }).click();
    await expect(side.locator('[data-testid="parts-table"]')).toBeVisible();
    expect(await scrollableRegionViolations(page)).toEqual([]);
  });

  test('/zrodla: Tab dochodzi do regionu tabeli, strzałka w prawo przewija (@S21)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zrodla');
    const region = page.locator('[role="region"][aria-label="Wskaźniki i źródła – tabela"]');
    await expect(region).toBeVisible();

    let focused = false;
    for (let i = 0; i < 60 && !focused; i++) {
      await page.keyboard.press('Tab');
      focused = await region.evaluate((el) => el === document.activeElement);
    }
    expect(focused, 'Tab nie doszedł do regionu tabeli').toBe(true);

    const wider = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
    if (wider) {
      const before = await region.evaluate((el) => el.scrollLeft);
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
    }
    // Gdy tabela mieści się w kontenerze, nie ma czego przewijać – asercja przewijania pominięta.
  });
});
