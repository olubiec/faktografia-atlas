import { test, expect } from '@playwright/test';

test.describe('Annotation Scroll & Resize (@S14)', () => {
  test('@S14 annotation stays attached to text when sheet container scrolls 200px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    // Znajdź zakreślenie .rough-annotation w przeglądzie profilu
    const annotationSvg = page.locator('.rough-annotation');
    await expect(annotationSvg).toBeVisible();

    // Kontener profilu na desktopie [data-slot="side"]
    const scrollContainer = page.locator('[data-slot="side"]');
    await expect(scrollContainer).toBeVisible();

    // Element tekstu zakreślonego (duża liczba)
    const textElement = page.locator('span.text-3xl');
    await expect(textElement).toBeVisible();

    const textBoxBefore = await textElement.boundingBox();
    const svgBoxBefore = await annotationSvg.boundingBox();

    expect(textBoxBefore).not.toBeNull();
    expect(svgBoxBefore).not.toBeNull();

    // Przewiń kontener o 200 px w dół
    await scrollContainer.evaluate((el) => {
      el.scrollTop += 200;
    });

    await page.waitForTimeout(100);

    const textBoxAfter = await textElement.boundingBox();
    const svgBoxAfter = await annotationSvg.boundingBox();

    expect(textBoxAfter).not.toBeNull();
    expect(svgBoxAfter).not.toBeNull();

    // Przesunięcie pionowe tekstu i zakreślenia po przewinięciu o 200px
    const textDeltaY = textBoxBefore!.y - textBoxAfter!.y;
    const svgDeltaY = svgBoxBefore!.y - svgBoxAfter!.y;

    // Różnica położenia względem tekstu ≤ 2 px
    expect(Math.abs(textDeltaY - svgDeltaY)).toBeLessThanOrEqual(2);
  });

  test('@S14 annotation adjusts when window resizes from 1440 to 390 width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);

    const annotationSvg = page.locator('.rough-annotation');
    await expect(annotationSvg).toBeVisible();

    // Zmiana szerokości okna z 1440 na 390 px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    const mobileAnnotationSvg = page.locator('.rough-annotation');
    await mobileAnnotationSvg.scrollIntoViewIfNeeded();
    await expect(mobileAnnotationSvg).toBeVisible();

    const textElement = page.locator('span.text-3xl');
    const textBox = await textElement.boundingBox();
    const svgBox = await mobileAnnotationSvg.boundingBox();

    expect(textBox).not.toBeNull();
    expect(svgBox).not.toBeNull();

    // Środek zakreślenia (SVG) leży w prostokącie tekstu powiększonym o padding (10 px)
    const svgCenterX = svgBox!.x + svgBox!.width / 2;
    const svgCenterY = svgBox!.y + svgBox!.height / 2;

    const padding = 10;
    const paddedMinX = textBox!.x - padding;
    const paddedMaxX = textBox!.x + textBox!.width + padding;
    const paddedMinY = textBox!.y - padding;
    const paddedMaxY = textBox!.y + textBox!.height + padding;

    expect(svgCenterX).toBeGreaterThanOrEqual(paddedMinX);
    expect(svgCenterX).toBeLessThanOrEqual(paddedMaxX);
    expect(svgCenterY).toBeGreaterThanOrEqual(paddedMinY);
    expect(svgCenterY).toBeLessThanOrEqual(paddedMaxY);
  });

  test('@S14 no annotation remains in DOM after closing profile sheet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?e2e&u=1217011');

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === true);
    await expect(page.locator('.rough-annotation')).toHaveCount(1);

    // Zamknij profil przyciskiem Zamknij
    const closeButton = page.locator('button[aria-label="Zamknij"]');
    await closeButton.click();

    await page.waitForFunction(() => (window as any).__atlas?.profileOpen === false);
    await expect(page.locator('.rough-annotation')).toHaveCount(0);
  });
});
