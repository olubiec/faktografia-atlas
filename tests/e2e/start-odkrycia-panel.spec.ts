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

  test(`@F02b Panel zestawień: wybór kliknięciem, strzałki po bokach, poziom, przyciski i losowy start (${width})`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => /facts-lists\.json/.test(r.url()) && requests.push(r.url()));
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const tabs = lists.getByRole('tab');
    const panel = lists.locator('[data-slot="start-carousel-panel"]');
    const rows = panel.locator('[data-slot="start-list-row"]');
    // Pasek to pierścień: w DOM jest tylko okno wokół zaznaczonej pozycji, a rozmiar całości podaje aria-setsize.
    await expect.poll(() => tabs.count()).toBeGreaterThan(10);
    await expect(lists.locator('[data-slot="start-carousel-counter"], [data-slot="start-carousel-track"]')).toHaveCount(0);
    await expect(lists.getByRole('button', { name: /Wybierz dane · \d+ wskaźnik/ })).toBeVisible();
    expect(requests.length).toBeLessThanOrEqual(1);
    const selected = lists.locator('[role="tab"][aria-selected="true"]');

    // Od pierwszej pozycji klikamy kolejne sąsiednie: zaznaczona jest zawsze jedna (jedyny czerwony element), panel pokazuje 5 pozycji.
    await selected.focus();
    await page.keyboard.press('Home');
    await expect(selected).toHaveAttribute('aria-posinset', '1');
    const mapHrefs: string[] = [];
    for (let k = 0; k < 4; k++) {
      await expect(rows).toHaveCount(5);
      await expect(lists.locator('.border-korekta')).toHaveCount(1);
      await expect(lists.locator('.border-korekta')).toHaveAttribute('aria-selected', 'true');
      mapHrefs.push((await panel.locator('[data-slot="start-list-map"]').getAttribute('href'))!);
      const at = await tabs.evaluateAll((els) => els.findIndex((e) => e.getAttribute('aria-selected') === 'true'));
      await tabs.nth(at + 1).click();
      await expect(selected).toHaveAttribute('aria-posinset', String(k + 2));
    }
    expect(new Set(mapHrefs).size).toBe(4);
    for (const h of mapHrefs) expect(h).toMatch(/^\/mapa\?i=[\w-]+&y=\d{4}&l=(gmi|pow|woj)/);

    // Strzałek po bokach pozycji nie ma (zostały tylko strzałki paska); zakładki mają równą wysokość.
    await expect(panel.locator('[data-slot="start-list-prev"], [data-slot="start-list-next"]')).toHaveCount(0);
    const heights = await Promise.all((await tabs.all()).map(async (t) => (await t.boundingBox())!.height));
    expect(new Set(heights.map(Math.round)).size).toBe(1);

    // Klawiatura na pasku: strzałka w prawo i Home.
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    await expect(selected).toHaveAttribute('aria-posinset', '6');
    await expect(selected).toBeFocused();
    await page.keyboard.press('Home');
    await expect(selected).toHaveAttribute('aria-posinset', '1');

    // „Najwyższe | Najniższe” i przełącznik poziomu mają pola ≥ 44 px; poziom wchodzi do linku do mapy.
    await panel.getByRole('button', { name: 'Najniższe' }).click();
    await expect(panel.getByRole('button', { name: 'Najniższe' })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.locator('[data-slot="start-list-subtitle"]')).toContainText('z najniższą wartością');
    for (const b of await panel.locator('[data-slot="start-list-ends"] button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const level = panel.getByRole('group', { name: 'Poziom' });
    await expect(level.getByRole('button')).toHaveCount(3);
    for (const b of await level.getByRole('button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    // „Zobacz na mapie” i „Pełne zestawienie” są przyciskami (pole ≥ 44 px, obrys/wypełnienie).
    for (const slot of ['start-list-map', 'start-list-full']) {
      const b = panel.locator(`[data-slot="${slot}"]`);
      await expect(b).toBeVisible();
      expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`@F02b Panel zestawień: po każdym wejściu otwiera się losowe zestawienie z paska (${width})`, async ({ page }) => {
    const seen = new Set<string>();
    for (let k = 0; k < 8 && seen.size < 2; k++) {
      const section = await open(page, width);
      const selected = section.locator('[role="tab"][aria-selected="true"]');
      await expect(selected).toHaveCount(1);
      seen.add((await selected.textContent()) ?? '');
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  test(`@F02b Karuzela: „Pełne zestawienie” prowadzi do pełnej listy na /zestawienia, gdy zestawienie nie ma własnej strony (${width})`, async ({ page }) => {
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const tabs = lists.getByRole('tab');
    await expect.poll(() => tabs.count()).toBeGreaterThan(10);
    // Wskaźnik „Przeciętne wynagrodzenie” ma zestawienie najwyższych, ale nie najniższych: drugi koniec skali kończy się rankingiem.
    await lists.getByRole('button', { name: /Wybierz dane/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('searchbox').fill('Przeciętne wynagrodzenie');
    await dialog.getByRole('button', { name: /Przeciętne wynagrodzenie/ }).first().click();
    const visible = lists.locator('[role="tabpanel"]:not([inert]) [data-slot="start-list"]');
    await visible.getByRole('button', { name: 'Najniższe' }).click();
    const full = visible.locator('[data-slot="start-list-full"]');
    await expect(full).toHaveText('Pełne zestawienie');
    await expect(full).toHaveAttribute('href', /^\/zestawienia\?i=avg-wage&l=pow&y=\d{4}&d=low$/);
  });
}

test('@F02b Karuzela bez końca: za ostatnim wskaźnikiem jest pierwszy, a w pierścieniu jest cała biblioteka', async ({ page }) => {
  const section = await open(page, 1280);
  const lists = section.locator('section[aria-labelledby="start-lists-title"]');
  const selected = lists.locator('[role="tab"][aria-selected="true"]');
  await expect.poll(() => lists.getByRole('tab').count()).toBeGreaterThan(10);
  await selected.focus();
  await page.keyboard.press('Home');
  await expect(selected).toHaveAttribute('aria-posinset', '1');
  // Spis biblioteki dochodzi chwilę po danych startu: czekamy, aż pierścień urośnie do całości.
  const label = (await lists.getByRole('button', { name: /Wybierz dane · \d+ wskaźnik/ }).textContent()) ?? '';
  const total = Number(/(\d+)/.exec(label.replace(/\s/g, ''))?.[1]);
  const sizeNow = async () => Number(await selected.getAttribute('aria-setsize'));
  await expect.poll(sizeNow).toBeGreaterThanOrEqual(total);
  // W lewo od pierwszego: ostatni.
  await lists.locator('[data-slot="strip-scroll-left"]').click();
  const size = await sizeNow();
  await expect(selected).toHaveAttribute('aria-posinset', String(size));
  // W prawo od ostatniego: znów pierwszy.
  await lists.locator('[data-slot="strip-scroll-right"]').click();
  await expect(selected).toHaveAttribute('aria-posinset', '1');
  // Pierścień zawiera zestawienia redakcyjne i bibliotekę; w DOM jest tylko okno wokół zaznaczonej.
  expect(await lists.getByRole('tab').count()).toBeLessThanOrEqual(13);
});
