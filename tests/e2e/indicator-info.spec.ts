import { test, expect, type Page } from '@playwright/test';

// Ikona „?” przy wskaźniku (W17-A04): na telefonie pełny dialog nad arkuszem, na komputerze popover.

async function openAtlas(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'fa-consent-v1',
      JSON.stringify({ value: 'denied', at: new Date().toISOString() })
    );
  });
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as any).__atlas?.ready === true);
  await page.waitForFunction(() => (window as any).__atlas?.choropleth != null);
}

const helpButton = (page: Page) => page.getByRole('button', { name: /^Co to znaczy:/ });

test.describe('Ikona „?” przy wskaźniku (W17-A04)', () => {
  test('mobile: tap „?” w arkuszu pokazuje wyjaśnienie na wierzchu, Zamknij i Escape zamykają', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAtlas(page);
    await page.locator('[data-slot="mobile-indicator-bar"] button').first().click();
    await expect(page.getByRole('dialog', { name: 'Panel wskaźnika' })).toBeVisible();

    await helpButton(page).tap().catch(() => helpButton(page).click());

    const info = page.locator('[data-slot="indicator-info-dialog"]');
    await expect(info).toBeVisible();
    const text = info.getByText('Co to jest');
    await expect(text).toBeInViewport();

    const onTop = await info.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && el.contains(hit);
    });
    expect(onTop).toBe(true);

    const close = info.getByRole('button', { name: 'Zamknij' }).last();
    const box = await close.boundingBox();
    expect(box && box.height).toBeGreaterThanOrEqual(44);

    await page.keyboard.press('Escape');
    await expect(info).toBeHidden();

    await helpButton(page).click();
    await expect(info).toBeVisible();
    await close.click();
    await expect(info).toBeHidden();
  });

  test('desktop: klik „?” pokazuje popover', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openAtlas(page);
    await helpButton(page).first().click();
    const pop = page.locator('[data-slot="popover-content"]');
    await expect(pop).toBeVisible();
    await expect(pop.getByText('Co to jest')).toBeVisible();
  });
});
