import { test, expect } from '@playwright/test';

type Trace = { longitude: number; latitude: number; zoom: number }[];

test.describe('FIX3: uwagi właściciela', () => {
  test('@S16 wybór miejsca to jeden ciągły ruch: bez skoku na starcie i bez drugiego ruchu po otwarciu profilu', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/mapa?e2e');
    await page.waitForFunction(() => (window as any).__atlas?.ready === true);

    await page.keyboard.press('Control+k');
    const input = page.locator('div[role="dialog"] input[placeholder="Gmina, powiat albo miejscowość"]');
    await input.fill('małopolskie');
    await expect(page.locator('div[role="dialog"] [cmdk-item]').first()).toBeVisible();
    await page.keyboard.press('Enter');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);
    await page.waitForTimeout(300);

    const trace: Trace = await page.evaluate(() => (window as any).__atlas.camera.trace);
    const zooms = trace.map((v) => v.zoom);
    const final = zooms[zooms.length - 1];
    expect(final).toBeGreaterThan(zooms[0] + 1);

    // Zoom rośnie monotonicznie (bez cofnięcia 7.96 -> 7.38 po otwarciu panelu).
    for (let i = 1; i < zooms.length; i++) expect(zooms[i]).toBeGreaterThanOrEqual(zooms[i - 1] - 1e-6);
    // Pierwsza klatka nie skacze: pierwszy krok to mały ułamek całego ruchu.
    expect(zooms[1] - zooms[0]).toBeLessThan((final - zooms[0]) * 0.2);
    // Po zakończeniu animacji kamera stoi (nie ma drugiego ruchu).
    const after = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(Math.abs(after - final)).toBeLessThan(1e-6);
  });

  test('@S14 klik w „Mapa” w menu wraca do stanu startowego mapy i czyści wybór miejsca', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/mapa?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    await page.locator('header nav').getByRole('link', { name: 'Mapa' }).click();

    await expect.poll(() => page.evaluate(() => window.location.search)).not.toContain('u=');
    await expect.poll(() => page.evaluate(() => (window as any).__atlas.profileOpen)).toBe(false);
    await expect(page.locator('[data-slot="side"] h2')).toHaveCount(0);
    await page.waitForFunction(() => (window as any).__atlas?.camera?.animating === false);
    const zoom = await page.evaluate(() => (window as any).__atlas.viewState.zoom);
    expect(zoom).toBeLessThan(7);
  });

  test('@S14 profil: domyślnie mały zestaw, wskaźnik można usunąć, dodać, a wybór jest zapamiętany', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/mapa?e2e&u=12');
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const side = page.locator('[data-slot="side"]');
    const removeButtons = side.getByRole('button', { name: /^Usuń wskaźnik:/ });
    const initial = await removeButtons.count();
    expect(initial).toBeGreaterThan(0);
    expect(initial).toBeLessThanOrEqual(7);

    const box = await removeButtons.first().boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await removeButtons.first().click();
    await expect(removeButtons).toHaveCount(initial - 1);

    await side.getByRole('button', { name: 'Dodaj wskaźnik' }).click();
    const addButtons = side.getByRole('button', { name: /^Dodaj: / });
    const addable = await addButtons.count();
    expect(addable).toBeGreaterThan(0);
    await addButtons.first().click();
    await expect(removeButtons).toHaveCount(initial);

    await removeButtons.first().click();
    await page.reload();
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await expect(page.locator('[data-slot="side"]').getByRole('button', { name: /^Usuń wskaźnik:/ })).toHaveCount(initial - 1);
  });
});
