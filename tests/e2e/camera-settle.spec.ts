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

// Profil wczytuje się dopiero po końcu animacji; kolumna pojawia się tuż po niej.
async function run(page: Page, reduced = false) {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release: () => void = () => {};
  const gate = new Promise<void>((r) => {
    release = r;
  });
  await page.route("**/data/profiles/12.json", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/?e2e");
  await page.waitForFunction(
    () => (window as unknown as Win).__atlas?.ready === true,
  );
  await pickMalopolskie(page);
  // Przy reduced motion kamera nie animuje się wcale: czekamy tylko na koniec ruchu.
  if (!reduced) await animating(page, true);
  await animating(page, false);
  await page.waitForTimeout(300);
  const before = await page.evaluate(
    () => (window as unknown as Win).__atlas.camera.trace.length,
  );
  release();
  await expect(page.locator('[data-slot="side"]')).toBeVisible();
  await page.waitForTimeout(300);
  await animating(page, false);
  const trace: number[] = await page.evaluate(() =>
    (window as unknown as Win).__atlas.camera.trace.map((v) => v.zoom),
  );
  return { before, trace };
}

test.describe("Kamera: dojazd po pojawieniu się kolumny (@S16)", () => {
  test.setTimeout(60000);

  test("Kolumna tuż po animacji: dojazd ma punkty pośrednie (@S16)", async ({
    page,
  }) => {
    const { trace } = await run(page);
    // Ślad jest zerowany przy starcie nowej animacji, więc liczymy cały ślad dojazdu.
    expect(trace.length).toBeGreaterThanOrEqual(4);
    const first = trace[0];
    const last = trace[trace.length - 1];
    const mid = trace.filter(
      (z) =>
        Math.abs(z - first) > 1e-6 &&
        Math.abs(z - last) > 1e-6,
    );
    expect(mid.length).toBeGreaterThanOrEqual(2);
  });

  test("Reduced motion: kamera ustawia się od razu (@S16)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { before, trace } = await run(page, true);
    // Najwyżej jeden dodatkowy punkt (skok), żadnych punktów pośrednich.
    expect(trace.length).toBeLessThanOrEqual(before + 1);
  });
});
