import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Privacy Page (/prywatnosc)', () => {
  test('loads properly with h1 Privacy and required information', async ({ page }) => {
    await page.goto('/prywatnosc');

    const heading = page.locator('h1', { hasText: 'Prywatność' });
    await expect(heading).toBeVisible();

    const article = page.locator('article');
    await expect(article).toContainText('anonimow');
    await expect(article).toContainText('PostHog');
    await expect(article).toContainText('UE');
  });

  test('button "Cofnij zgodę" clears consent, shows message and brings back consent bar on reload', async ({ page }) => {
    // Navigate first and set granted consent in localStorage
    await page.goto('/prywatnosc');
    await page.evaluate(() => {
      localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'granted', at: new Date().toISOString() }));
    });
    await page.reload();

    // Consent bar should not be visible initially because consent is granted
    const consentBarInitial = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBarInitial).not.toBeVisible();

    const revokeBtn = page.locator('button', { hasText: 'Cofnij zgodę' });
    await expect(revokeBtn).toBeVisible();

    await revokeBtn.click();

    // Verify confirmation message
    const statusMsg = page.locator('text=Zgoda została cofnięta');
    await expect(statusMsg).toBeVisible();

    // Verify localStorage item is cleared
    const consentValue = await page.evaluate(() => localStorage.getItem('fa-consent-v1'));
    expect(consentValue).toBeNull();

    // Reload page and check that ConsentBar reappears
    await page.reload();
    const consentBarAfterReload = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBarAfterReload).toBeVisible();
  });

  test('axe accessibility audit passes on /prywatnosc in light and dark mode', async ({ page }) => {
    // Light mode
    await page.goto('/prywatnosc');
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /prywatnosc (light)').toEqual([]);

    // Dark mode
    await page.addInitScript(() => {
      localStorage.setItem('faktografia-theme', 'dark');
    });
    await page.goto('/prywatnosc');
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, 'Axe violations on /prywatnosc (dark)').toEqual([]);
  });

  test('ConsentBar contains working "Więcej" link pointing to /prywatnosc with min 44x44px touch target and keyboard accessibility', async ({ page }) => {
    await page.goto('/');

    const consentBar = page.locator('div[role="region"][aria-label="Zgoda na analitykę"]');
    await expect(consentBar).toBeVisible();

    const link = consentBar.locator('a[href="/prywatnosc"]', { hasText: 'Więcej' });
    await expect(link).toBeVisible();

    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Keyboard navigation to the link
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/prywatnosc/);
    await expect(page.locator('h1', { hasText: 'Prywatność' })).toBeVisible();
  });

  test('button "Cofnij zgodę" touch target is at least 44x44 px', async ({ page }) => {
    await page.goto('/prywatnosc');

    const revokeBtn = page.locator('button', { hasText: 'Cofnij zgodę' });
    await expect(revokeBtn).toBeVisible();

    const box = await revokeBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
