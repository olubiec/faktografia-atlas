import { test, expect } from '@playwright/test';

// P1-A: /rankingi czytelne na telefonie (@S21)
for (const vp of [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`P1-A @S21 /rankingi bez poziomego przewijania i z nazwami (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/rankingi');
    await expect(page.getByText(/^Najwyżej: /)).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(vp.width);

    // brak kodów zamiast nazw
    const items = await page.locator('main ul li').allTextContents();
    expect(items.length).toBeGreaterThan(0);
    for (const t of items) expect(t.trim()).not.toMatch(/^\d+\s*-/);
    await expect(page.getByText(/^Najwyżej: [^\d]/)).toBeVisible();
    await expect(page.getByTestId('mapShapes')).toHaveCount(0);

    // pola dotykowe i brak ucięcia
    const boxes = await page.locator('main select, main input').evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { h: r.height, right: r.right };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(5);
    for (const b of boxes) {
      expect(b.h).toBeGreaterThanOrEqual(44);
      expect(b.right).toBeLessThanOrEqual(vp.width);
    }
    const textCut = await page.locator('main li, main p').evaluateAll(
      (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length,
    );
    expect(textCut).toBe(0);
  });
}
