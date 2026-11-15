import { test, expect } from '@playwright/test';

test('@S99 świeżość danych: najwyżej 1 pobranie density.json w ścieżce rankingi, o projekcie, rankingi', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let densityRequests = 0;
  page.on('request', (req) => {
    if (/\/data\/values\/density\.json/.test(req.url())) densityRequests++;
  });

  await page.goto('/rankingi');
  await expect(page.getByText(/Dane GUS odświeżone/)).toBeVisible();

  const nav = page.locator('header nav');
  await nav.getByRole('link', { name: 'O projekcie' }).click();
  await expect(page).toHaveURL(/\/o-projekcie/);
  await expect(page.getByText(/Dane GUS odświeżone/)).toBeVisible();

  await nav.getByRole('link', { name: 'Rankingi' }).click();
  await expect(page).toHaveURL(/\/rankingi/);
  await expect(page.getByText(/Dane GUS odświeżone/)).toBeVisible();

  expect(densityRequests).toBeLessThanOrEqual(1);
});
