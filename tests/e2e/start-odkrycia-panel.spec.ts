import { test, expect, type Page } from '@playwright/test';

// @F02b: „Odkrycia” – jedna karta dnia (bez „Pokaż inną”), równe wiersze zestawień, karuzela z paskiem wskaźników.
async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await page.addInitScript(() => {
    localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
  });
  await page.goto('/?e2e');
  const section = page.getByRole('region', { name: 'Odkrycia' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('[data-slot="fact-card"]').first()).toBeVisible();
  return section;
}

const DAY = 86_400_000;

for (const width of [360, 1280]) {
  test(`@F02b Odkrycie dnia: jedna karta, bez „Pokaż inną ciekawostkę” i licznika, ta sama przy dwóch wejściach (${width})`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-27T10:00:00Z'));
    const section = await open(page, width);
    const daily = section.locator('section[aria-labelledby="start-daily-title"]');
    await expect(daily.locator('[data-slot="fact-card"]')).toHaveCount(1);
    await expect(daily.getByRole('button', { name: 'Pokaż inną ciekawostkę' })).toHaveCount(0);
    await expect(daily.locator('[data-slot="daily-counter"]')).toHaveCount(0);
    await expect(daily.getByRole('link', { name: 'Zobacz na mapie' })).toHaveCount(1);
    const first = await daily.locator('[data-slot="fact-card"]').textContent();
    await page.reload();
    await section.scrollIntoViewIfNeeded();
    await expect(daily.locator('[data-slot="fact-card"]')).toHaveText(first!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`@F02b Odkrycie dnia: para skrajności ma dwa miejsca z linkami do mapy (${width})`, async ({ page }) => {
    // Przeglądamy kolejne dni, aż trafimy na kartę z parą (talia ma ich kilka); każdy dzień to jedna karta.
    let pair = false;
    for (let d = 0; d < 12 && !pair; d++) {
      await page.clock.setFixedTime(new Date(Date.parse('2026-11-27T10:00:00Z') + d * DAY));
      const section = await open(page, width);
      const card = section.locator('section[aria-labelledby="start-daily-title"] [data-slot="fact-card"]');
      await expect(card).toHaveCount(1);
      if ((await card.getAttribute('data-variant')) !== 'extremes') continue;
      pair = true;
      const poles = card.locator('[data-slot="extremes-pole"]');
      await expect(poles).toHaveCount(2);
      const hrefs = await poles.getByRole('link').evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
      const [a, b] = hrefs.map((h) => new URL(h, 'http://x').searchParams);
      expect(a.get('i')).toBe(b.get('i'));
      expect(a.get('y')).toBe(b.get('y'));
      expect(a.get('u')).not.toBe(b.get('u'));
      await expect(card).toContainText('Najmniej');
      await expect(card).toContainText('Najwięcej');
    }
    expect(pair).toBe(true);
  });

  test(`@F02b Zestawienia: wszystkie wiersze w jednym rozmiarze, pola ≥ 44 px (${width})`, async ({ page }) => {
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const names = lists.locator('[role="tabpanel"]:not([inert]) [data-slot="start-list-name"]');
    await expect(names).toHaveCount(5);
    const styles = await names.evaluateAll((els) => els.map((e) => ({ size: getComputedStyle(e).fontSize, weight: getComputedStyle(e).fontWeight })));
    expect(new Set(styles.map((s) => `${s.size}/${s.weight}`)).size).toBe(1);
    for (const row of await lists.locator('[data-slot="start-list-row"]').all()) expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test(`@F02b Karuzela: pasek wskaźników, strzałki i przesunięcie zmieniają slajd; przełącznik jest wspólny (${width})`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => /facts-lists\.json/.test(r.url()) && requests.push(r.url()));
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const tabs = lists.getByRole('tab');
    const counter = lists.locator('[data-slot="start-carousel-counter"]');
    const track = lists.locator('[data-slot="start-carousel-track"]');
    await expect(tabs).toHaveCount(4);
    await expect(counter).toHaveText('1 z 4');
    // Pierwsze sekundy: dalszych zestawień jeszcze nie pobieramy; dopiero ruch w karuzeli.
    await page.waitForTimeout(1500);
    expect(requests).toEqual([]);

    // Pasek: kliknięcie zmienia slajd; widać jedno zestawienie z 5 pozycjami i linkiem do mapy.
    const mapHrefs: string[] = [];
    for (let k = 0; k < 4; k++) {
      await tabs.nth(k).click();
      await expect(tabs.nth(k)).toHaveAttribute('aria-selected', 'true');
      await expect(lists.locator('[data-slot="start-list-row"]')).toHaveCount(5);
      mapHrefs.push((await lists.getByRole('link', { name: /^Zobacz na mapie/ }).getAttribute('href'))!);
    }
    expect(new Set(mapHrefs).size).toBe(4);
    for (const h of mapHrefs) expect(h).toMatch(/^\/mapa\?i=[\w-]+&y=\d{4}&l=(gmi|pow|woj)/);

    // Po ruchu dochodzą dalsze wskaźniki: pasek ma więcej niż 4 pozycje, licznik liczy wszystkie.
    await expect.poll(() => tabs.count()).toBeGreaterThan(10);
    const total = await tabs.count();
    expect(requests).toHaveLength(1);
    await expect(counter).toHaveText(`4 z ${total}`);

    // Strzałki: „Następne” przechodzi dalej, na końcach są wyłączone, karuzela się nie zapętla.
    const prev = lists.getByRole('button', { name: /Poprzednie/ });
    const next = lists.getByRole('button', { name: /Następne/ });
    await tabs.nth(0).click();
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(counter).toHaveText(`2 z ${total}`);
    await prev.click();
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await tabs.nth(total - 1).click();
    await expect(next).toBeDisabled();
    await expect(counter).toHaveText(`${total} z ${total}`);

    // Przesunięcie palcem (tor z scroll-snap) zmienia aktywną pozycję paska.
    await tabs.nth(0).click();
    await track.evaluate((el) => el.scrollTo({ left: el.clientWidth * 2, behavior: 'instant' }));
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(counter).toHaveText(`3 z ${total}`);

    // Tylko aktywny slajd ma linki w kolejności Tab; pozostałe są inert.
    await expect(lists.locator('[data-slot="start-list-row"]')).toHaveCount(5);
    await expect(track.locator('[inert]')).toHaveCount(total - 1);

    // Klawiatura: strzałka w prawo i End na pasku.
    await tabs.nth(2).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(3)).toBeFocused();
    await page.keyboard.press('End');
    await expect(tabs.nth(total - 1)).toHaveAttribute('aria-selected', 'true');

    // „Najwyższe | Najniższe” obowiązuje na wszystkich slajdach i ma pola ≥ 44 px.
    await tabs.nth(0).click();
    const visible = lists.locator('[role="tabpanel"]:not([inert]) [data-slot="start-list"]');
    await visible.getByRole('button', { name: 'Najniższe' }).click();
    await next.click();
    await expect(visible.getByRole('button', { name: 'Najniższe' })).toHaveAttribute('aria-pressed', 'true');
    await expect(visible.locator('[data-slot="start-list-subtitle"]')).toContainText('z najniższą wartością');
    for (const b of await visible.locator('[data-slot="start-list-ends"] button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    // Jedyny czerwony element sekcji to aktywna pozycja paska; pola dotykowe strzałek ≥ 44 px.
    await expect(lists.locator('.border-korekta')).toHaveCount(1);
    await expect(lists.locator('.border-korekta')).toHaveAttribute('aria-selected', 'true');
    for (const b of [prev, next]) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`@F02b Karuzela: „Pełny ranking” prowadzi do /rankingi, gdy zestawienie nie ma własnej strony (${width})`, async ({ page }) => {
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const tabs = lists.getByRole('tab');
    await tabs.nth(0).click();
    await expect.poll(() => tabs.count()).toBeGreaterThan(10);
    // Wskaźnik „Przeciętne wynagrodzenie” ma zestawienie najwyższych, ale nie najniższych: drugi koniec skali kończy się rankingiem.
    await lists.getByRole('tab', { name: /Przeciętne wynagrodzenie/ }).click();
    const visible = lists.locator('[role="tabpanel"]:not([inert]) [data-slot="start-list"]');
    await visible.getByRole('button', { name: 'Najniższe' }).click();
    const full = visible.locator('[data-slot="start-list-full"]');
    await expect(full).toHaveText('Pełny ranking');
    await expect(full).toHaveAttribute('href', /^\/rankingi\?i=avg-wage&l=pow&y=\d{4}$/);
  });
}

test('@F02b Karuzela: przy ograniczeniu ruchu przewijanie jest bez animacji', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const section = await open(page, 360);
  const lists = section.locator('section[aria-labelledby="start-lists-title"]');
  await lists.getByRole('tab').nth(2).click();
  const track = lists.locator('[data-slot="start-carousel-track"]');
  // Bez animacji tor stoi na slajdzie od razu, a nie w trakcie przewijania.
  await expect.poll(async () => track.evaluate((el) => Math.round(el.scrollLeft - el.clientWidth * 2)), { timeout: 400 }).toBe(0);
});
