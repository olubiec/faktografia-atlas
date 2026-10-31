import { test, expect } from '@playwright/test';


test.describe('Compare pick - Profile Compare', () => {
  test('desktop - compare tab is active, can pick a place to compare via URL or search', async ({ page }) => {
    // 1. Visit URL without ?c=
    await page.goto('/?e2e=1&u=12');

    const compareTab = page.locator('button', { hasText: /^Porównaj$/ });


    await expect(compareTab).toBeVisible();
    await expect(compareTab).toBeEnabled();
    await expect(compareTab).not.toHaveText(/wkrótce/i);

    // 2. Click "Porównaj"
    await compareTab.click();

    // We should see search field or placeholder button
    const pickAnother = page.getByText('Porównaj z innym miejscem...');
    await expect(pickAnother).toBeVisible();
    await pickAnother.click();

    // await expect(searchInput).toBeVisible(); // Disabled because we replaced search with quick links/regular search btn trigger


  });
});
