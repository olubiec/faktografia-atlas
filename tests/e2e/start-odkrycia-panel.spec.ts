import { test, expect, type Page } from '@playwright/test';

// @F02b: „Odkrycia” po przebudowie – para skrajności, „Pokaż inną ciekawostkę”, zestawienia w zakładkach.
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

for (const width of [360, 1280]) {
  test(`@F02b „Pokaż inną ciekawostkę” zmienia kartę, a para skrajności ma dwa miejsca z linkami do mapy (${width})`, async ({ page }) => {
    const section = await open(page, width);
    const daily = section.locator('section[aria-labelledby="start-daily-title"]');
    const counter = daily.locator('[data-slot="daily-counter"]');
    await expect(counter).toContainText('Ciekawostka dnia (1 z ');
    const total = Number((await counter.textContent())!.match(/z (\d+)/)![1]);
    expect(total).toBeGreaterThan(1);

    let pairSeen = false;
    for (let k = 0; k < total; k++) {
      const card = daily.locator('[data-slot="fact-card"]');
      await expect(card).toHaveCount(1);
      await expect(daily.getByRole('link', { name: 'Zobacz na mapie' })).toHaveCount(1);
      if ((await card.getAttribute('data-variant')) === 'extremes') {
        pairSeen = true;
        const poles = card.locator('[data-slot="extremes-pole"]');
        await expect(poles).toHaveCount(2);
        const hrefs = await poles.getByRole('link').evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
        const [a, b] = hrefs.map((h) => new URL(h, 'http://x').searchParams);
        // Ten sam wskaźnik i rok, dwa różne miejsca.
        expect(a.get('i')).toBe(b.get('i'));
        expect(a.get('y')).toBe(b.get('y'));
        expect(a.get('u')).not.toBe(b.get('u'));
        await expect(card).toContainText('Najmniej');
        await expect(card).toContainText('Najwięcej');
      }
      const before = await card.textContent();
      await daily.getByRole('button', { name: 'Pokaż inną ciekawostkę' }).click();
      await expect(counter).toHaveText(k + 1 < total ? `Ciekawostka ${k + 2} z ${total}` : `Ciekawostka dnia (1 z ${total})`);
      if (total > 1) await expect(daily.locator('[data-slot="fact-card"]')).not.toHaveText(before!);
    }
    expect(pairSeen).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`@F02b Zestawienia: zakładki przełączają jedno widoczne zestawienie, wiersz prowadzi do profilu (${width})`, async ({ page }) => {
    const section = await open(page, width);
    const lists = section.locator('section[aria-labelledby="start-lists-title"]');
    const tabs = lists.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    await expect(lists.locator('[data-slot="start-list-row"]').first()).toBeVisible();
    for (let k = 0; k < 4; k++) {
      await tabs.nth(k).click();
      await expect(tabs.nth(k)).toHaveAttribute('aria-selected', 'true');
      // Widać dokładnie jedno zestawienie: 5 wierszy z linkiem do jednostki.
      const visible = lists.locator('[data-slot="start-list"]:visible');
      await expect(visible).toHaveCount(1);
      const rows = visible.locator('[data-slot="start-list-row"]');
      await expect(rows).toHaveCount(5);
      expect(await rows.first().getAttribute('href')).toMatch(/[?&]u=\d+/);
      await expect(visible.getByRole('link', { name: /^Zobacz na mapie/ })).toHaveAttribute('href', /^\/mapa\?i=[\w-]+&y=\d{4}&l=(gmi|pow|woj)/);
    }
    // Skrajności w drugą stronę: przełącznik „Najwyższe | Najniższe”; mediana wieku zaczyna od najmłodszych gmin.
    await lists.getByRole('tab', { name: 'Mediana wieku' }).click();
    const visible = lists.locator('[data-slot="start-list"]:visible');
    const ends = visible.locator('[data-slot="start-list-ends"]');
    const low = ends.getByRole('button', { name: 'Najniższe' });
    const high = ends.getByRole('button', { name: 'Najwyższe' });
    await expect(low).toHaveAttribute('aria-pressed', 'true');
    await expect(visible.locator('[data-slot="start-list-full"]')).toHaveAttribute('href', '/zestawienie/najmlodsze-gminy');
    const youngest = await visible.locator('[data-slot="start-list-name"]').first().textContent();
    await high.click();
    await expect(high).toHaveAttribute('aria-pressed', 'true');
    await expect(low).toHaveAttribute('aria-pressed', 'false');
    await expect(visible.locator('[data-slot="start-list-subtitle"]')).toContainText('z najwyższą wartością');
    await expect(visible.locator('[data-slot="start-list-row"]')).toHaveCount(5);
    await expect(visible.locator('[data-slot="start-list-name"]').first()).not.toHaveText(youngest!);
    await expect(visible.locator('[data-slot="start-list-full"]')).toHaveAttribute('href', '/zestawienie/najstarsze-gminy');
    await expect(visible.locator('[data-slot="start-list-opposite"]')).toHaveCount(0);
    // Wybór obowiązuje we wszystkich zakładkach: pierwsza też pokazuje teraz najwyższe.
    await tabs.nth(0).click();
    await expect(lists.locator('[data-slot="start-list"]:visible').getByRole('button', { name: 'Najwyższe' })).toHaveAttribute('aria-pressed', 'true');
    // Pola dotykowe przełącznika ≥ 44 px.
    for (const b of await lists.locator('[data-slot="start-list"]:visible [data-slot="start-list-ends"] button').all()) {
      expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(lists.getByRole('link', { name: 'Wszystkie tematy i zestawienia' })).toHaveAttribute('href', '/zestawienia');
    // Klawiatura: strzałka w prawo przechodzi do następnej zakładki (z ostatniej do pierwszej).
    await tabs.nth(3).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toBeFocused();
    // Zestawienia mieszczą się na jednym ekranie telefonu (wcześniej 4 karty jedna pod drugą).
    const box = (await lists.boundingBox())!;
    expect(box.height).toBeLessThan(800);
  });
}
