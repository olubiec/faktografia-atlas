import { test, expect, type Page } from '@playwright/test';

// Przejście koloru GPU nie istnieje: fill.ms zawsze 0 – @S20.

type Fill = { ms: number; dataKey: string };
type Atlas = { ready: boolean; selected: string | null; fill: Fill; camera: { animating: boolean } };
type Win = { __atlas: Atlas };

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?e2e');
  await page.waitForFunction(() => (window as unknown as { __atlas?: Atlas }).__atlas?.ready === true);
  await page.waitForFunction(() => ((window as unknown as Win).__atlas.fill?.dataKey ?? '') !== '');
}

const fillNow = (page: Page) => page.evaluate(() => (window as unknown as Win).__atlas.fill);

async function search(page: Page, text: string) {
  const trigger = page.locator('#home-search-field');
  if (await trigger.isVisible()) await trigger.click();
  else await page.keyboard.press('Control+k');
  const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
  await expect(input).toBeVisible();
  await input.fill(text);
  await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
  await page.keyboard.press('Enter');
}

/** Próbkuje __atlas.fill co ~50 ms przez 1,5 s (w stronie, bez opóźnień protokołu). */
const sample = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<Fill[]>((resolve) => {
        const out: Fill[] = [];
        const read = () => out.push({ ...(window as unknown as Win).__atlas.fill });
        read();
        const id = setInterval(read, 50);
        setTimeout(() => {
          clearInterval(id);
          resolve(out);
        }, 1500);
      }),
  );

/** Po zmianie poziomu klucz danych się zmienia, a przejścia GPU koloru nie ma w żadnej próbce (ms = 0). */
async function checkStep(page: Page, prevKey: string, act: () => Promise<void>) {
  await act();
  const samples = await sample(page);
  const last = samples[samples.length - 1];
  expect(last.dataKey).not.toBe(prevKey);
  expect(samples.every((s) => s.ms === 0)).toBe(true);
  return last.dataKey;
}

async function walk(page: Page) {
  await open(page);
  let key = (await fillNow(page)).dataKey;
  key = await checkStep(page, key, () => search(page, 'małopolskie'));
  key = await checkStep(page, key, () => search(page, 'krakowski'));
  key = await checkStep(page, key, () => page.locator('button', { hasText: 'Wróć' }).click());
  await checkStep(page, key, () => page.locator('button', { hasText: 'Wróć' }).click());
}

test.describe('Przejście koloru przy zmianie poziomu (@S20)', () => {
  test.setTimeout(120_000);

  test('wejście i „Wróć”: przejście GPU zawsze 0 ms (@S20)', async ({ page }) => {
    await walk(page);
  });

  test('przy reduced-motion przejście zawsze 0 (@S20)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await walk(page);
  });

  test('zmiana wskaźnika na tym samym poziomie nie włącza przejścia GPU (@S20)', async ({ page }) => {
    await open(page);
    await page.evaluate(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('i', 'unemployment-rate');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
    });
    const samples = await sample(page);
    expect(samples.every((s) => s.ms === 0)).toBe(true);
  });
});
