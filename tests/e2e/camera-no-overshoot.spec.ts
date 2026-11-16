import { test, expect, type Page } from "@playwright/test";

type Win = {
  __atlas: {
    ready?: boolean;
    viewState: { zoom: number };
    camera: { animating: boolean; trace: { zoom: number }[] };
  };
};

const animating = (page: Page, value: boolean) =>
  page.waitForFunction(
    (v) => (window as unknown as Win).__atlas.camera.animating === v,
    value,
  );

async function pickMalopolskie(page: Page) {
  const trigger = page.locator("#home-search-field");
  if (await trigger.isVisible()) await trigger.click();
  else await page.keyboard.press("Control+k");
  const input = page.locator(
    'div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]',
  );
  await expect(input).toBeVisible();
  await input.fill("małopolskie");
  await expect(
    page.locator('div[role="dialog"] [cmdk-item]').first(),
  ).toBeVisible();
  await page.keyboard.press("Enter");
}

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?e2e");
  await page.waitForFunction(
    () => (window as unknown as Win).__atlas?.ready === true,
  );
}

test.describe("Kamera: bez przestrzelenia przy kolumnie profilu (@S16)", () => {
  test.setTimeout(60000);

  test("Zoom nie przekracza celu, kolumna widoczna w trakcie animacji (@S16)", async ({
    page,
  }) => {
    await open(page);
    await pickMalopolskie(page);
    await animating(page, true);
    await expect(page.locator('[data-slot="side"]')).toBeVisible();
    await animating(page, false);

    const trace: number[] = await page.evaluate(() =>
      (window as unknown as Win).__atlas.camera.trace.map((v) => v.zoom),
    );
    const finalZoom = await page.evaluate(
      () => (window as unknown as Win).__atlas.viewState.zoom,
    );
    expect(trace.length).toBeGreaterThan(0);
    expect(Math.max(...trace)).toBeLessThanOrEqual(finalZoom + 0.05);
  });

  test("Wstrzymany profil: widać zajawkę, po zwolnieniu profil (@S16)", async ({
    page,
  }) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => {
      release = r;
    });
    await page.route("**/data/profiles/12.json", async (route) => {
      await gate;
      await route.continue();
    });
    await open(page);
    await pickMalopolskie(page);
    const side = page.locator('[data-slot="side"]');
    await expect(side.getByRole("status")).toContainText("Wczytywanie profilu");
    await expect(side).toBeVisible();
    release();
    await expect(side.getByText("Wczytywanie profilu")).toHaveCount(0, {
      timeout: 20000,
    });
    await expect(side.locator("h1, h2").first()).toBeVisible();
  });
});
