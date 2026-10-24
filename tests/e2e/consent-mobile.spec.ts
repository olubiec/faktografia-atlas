import { test, expect } from '@playwright/test';

test.describe('Consent Bar Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('bar height is max 15% of window and buttons are on one line', async ({ page }) => {
    await page.goto('/');

    const consentBar = page.getByRole('region', { name: 'Zgoda na analitykę' });
    await expect(consentBar).toBeVisible();

    const box = await consentBar.boundingBox();
    expect(box).not.toBeNull();

    // max 15% of 844 is 126.6
    expect(box!.height).toBeLessThanOrEqual(126.6);

    const denyBtn = page.getByRole('button', { name: 'Nie' });
    const acceptBtn = page.getByRole('button', { name: 'Zgadzam się' });

    const denyBox = await denyBtn.boundingBox();
    const acceptBox = await acceptBtn.boundingBox();

    expect(denyBox).not.toBeNull();
    expect(acceptBox).not.toBeNull();

    // Buttons should be on the same horizontal line
    expect(denyBox!.y).toEqual(acceptBox!.y);

    // Accept it to see if it disappears
    await acceptBtn.click();
    await expect(consentBar).toBeHidden();
  });
});
