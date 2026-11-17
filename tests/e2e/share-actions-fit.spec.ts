import { test, expect } from "@playwright/test";

/** B03: przyciski eksportu mieszczą się na telefonie 375×812, bez ucinania napisów (@S-share). */

test("przyciski eksportu na 375 px: krótkie etykiety, pełne aria-label, nic nie ucięte (@S-share)", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "fa-consent-v1",
      JSON.stringify({ value: "denied", at: new Date().toISOString() }),
    );
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {},
    });
  });
  await page.goto("/?e2e=1&u=12&c=12,24");
  await page.waitForFunction(
    () =>
      (window as any).__atlas?.ready === true &&
      (window as any).__atlas?.profileOpen === true,
  );
  await page
    .locator('[data-slot="profile-compare"]')
    .getByRole("button", { name: "Pobierz i udostępnij" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Pobierz i udostępnij" });
  await expect(dialog).toBeVisible();

  const bar = dialog.getByTestId("share-actions");
  // Krótkie etykiety widoczne, pełna nazwa w aria-label
  const expected: Array<[string, string]> = [
    ["Pobierz obraz", "Obraz"],
    ["Udostępnij", "Udostępnij"],
    ["Udostępnij zestaw", "Zestaw"],
    ["Pobierz dane (CSV)", "CSV"],
  ];
  for (const [aria, text] of expected) {
    const b = bar.locator(`button[aria-label="${aria}"]`);
    await expect(b).toHaveCount(1);
    await expect(b).toHaveText(text, { useInnerText: true });
  }

  const buttons = bar.getByRole("button");
  const count = await buttons.count();
  expect(count).toBeGreaterThanOrEqual(4);
  const barBox = await bar.boundingBox();
  // pasek akcji nie wymaga przewijania
  expect(
    await bar.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  ).toBe(true);
  const xs = new Set<number>();
  for (let i = 0; i < count; i++) {
    const b = buttons.nth(i);
    const box = await b.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    expect(box!.y).toBeGreaterThanOrEqual(barBox!.y - 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(812);
    expect(await b.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    xs.add(Math.round(box!.x));
  }
  // siatka 2 kolumn: najwyżej dwie różne pozycje lewej krawędzi
  expect(xs.size).toBeLessThanOrEqual(2);
});
