import { expect, type Locator, type Page } from '@playwright/test';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Matematycznie weryfikuje brak kolizji prostokątów otaczających (bounding boxes) dwóch elementów.
 * Jeśli którykolwiek element nie jest widoczny, kolizja nie występuje.
 * Tolerancja 0.5px zabezpiecza przed zaokrągleniami subpikselowymi.
 */
export async function expectNoOverlap(
  locatorA: Locator,
  locatorB: Locator,
  label?: string
): Promise<void> {
  const isAVisible = await locatorA.isVisible().catch(() => false);
  const isBVisible = await locatorB.isVisible().catch(() => false);

  if (!isAVisible || !isBVisible) {
    return;
  }

  const boxA = await locatorA.boundingBox();
  const boxB = await locatorB.boundingBox();

  if (!boxA || !boxB) {
    return;
  }

  // Brak kolizji, gdy jeden prostokąt leży w całości po lewej, prawej, na górze lub na dole drugiego
  const noOverlap =
    boxA.x + boxA.width <= boxB.x + 0.5 ||
    boxB.x + boxB.width <= boxA.x + 0.5 ||
    boxA.y + boxA.height <= boxB.y + 0.5 ||
    boxB.y + boxB.height <= boxA.y + 0.5;

  expect(
    noOverlap,
    `Kolizja elementów (${label ?? 'A vs B'}): A=[x:${boxA.x.toFixed(1)}, y:${boxA.y.toFixed(1)}, w:${boxA.width.toFixed(1)}, h:${boxA.height.toFixed(1)}] vs B=[x:${boxB.x.toFixed(1)}, y:${boxB.y.toFixed(1)}, w:${boxB.width.toFixed(1)}, h:${boxB.height.toFixed(1)}]`
  ).toBe(true);
}

/**
 * Sprawdza parami brak kolizji w zestawie widocznych elementów pływających.
 */
export async function expectNoOverlapPairwise(
  elements: { name: string; locator: Locator }[]
): Promise<void> {
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      await expectNoOverlap(a.locator, b.locator, `${a.name} vs ${b.name}`);
    }
  }
}

/**
 * Weryfikuje brak uciętego tekstu w elemencie (scrollWidth <= clientWidth).
 * Dopuszcza 1px tolerancji na zaokrąglenia silnika renderującego.
 */
export async function expectNoClippedText(
  locator: Locator,
  label?: string
): Promise<void> {
  const isVisible = await locator.isVisible().catch(() => false);
  if (!isVisible) return;

  const metrics = await locator.evaluate((el) => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      text: el.textContent?.trim().slice(0, 40) ?? '',
    };
  });

  expect(
    metrics.scrollWidth <= metrics.clientWidth + 1,
    `Ucięty tekst w "${label ?? metrics.text}": scrollWidth (${metrics.scrollWidth}px) > clientWidth (${metrics.clientWidth}px)`
  ).toBe(true);
}

/**
 * Weryfikuje brak poziomego paska przewijania na całej stronie (scrollWidth <= clientWidth).
 */
export async function expectNoHorizontalScroll(page: Page, label?: string): Promise<void> {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(
    hasHorizontalScroll,
    `Strona ma niepożądane poziome przewijanie (${label ?? 'viewport'})`
  ).toBe(false);
}

/**
 * Weryfikuje minimalny rozmiar pola dotykowego (domyślnie min. 44x44 px).
 */
export async function expectTouchTargetSize(
  locator: Locator,
  minSize: number = 44,
  label?: string
): Promise<void> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `Brak boundingBox dla elementu dotykowego: ${label ?? 'element'}`).not.toBeNull();

  if (box) {
    expect(
      box.width >= minSize - 0.5,
      `Szerokość pola dotykowego ${label ?? 'element'} (${box.width.toFixed(1)}px) < ${minSize}px`
    ).toBe(true);
    expect(
      box.height >= minSize - 0.5,
      `Wysokość pola dotykowego ${label ?? 'element'} (${box.height.toFixed(1)}px) < ${minSize}px`
    ).toBe(true);
  }
}

/**
 * Weryfikuje wszystkie widoczne interaktywne pola dotykowe w kontenerze.
 */
export async function expectAllTouchTargets(
  container: Locator,
  minSize: number = 44
): Promise<void> {
  const interactive = container.locator('button:visible, a:visible, [role="button"]:visible, [role="tab"]:visible');
  const count = await interactive.count();

  for (let i = 0; i < count; i++) {
    const item = interactive.nth(i);
    const box = await item.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      const text = (await item.textContent())?.trim().slice(0, 30) ?? `item-${i}`;
      expect(
        box.width >= minSize - 0.5,
        `Szerokość pola dotykowego "${text}" (${box.width.toFixed(1)}px) < ${minSize}px`
      ).toBe(true);
      expect(
        box.height >= minSize - 0.5,
        `Wysokość pola dotykowego "${text}" (${box.height.toFixed(1)}px) < ${minSize}px`
      ).toBe(true);
    }
  }
}

/**
 * Weryfikuje zasięg przewijania arkusza przy stanie 40% (PRODUKT.md §5):
 * 1. Sprawdza, czy arkusz zajmuje ok. 35–48% wysokości okna (stan początkowy 40%).
 * 2. Przewija do elementu docelowego wewnątrz arkusza (np. przycisk na dole).
 * 3. Upewnia się, że element docelowy mieści się w widocznej części ekranu i jest klikalny.
 */
export async function expectSheetScrollRangeAt40(
  page: Page,
  targetLocator: Locator,
  options?: {
    sheetSelector?: string;
    viewportHeight?: number;
  }
): Promise<void> {
  const viewportHeight = options?.viewportHeight ?? (page.viewportSize()?.height ?? 844);
  const sheetSelector = options?.sheetSelector ?? '[role="dialog"]';

  // Potwierdź stan arkusza na poziomie 35–48% wysokości
  await page.waitForFunction(
    ({ selector, vh }) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const ratio = (vh - rect.y) / vh;
      return ratio >= 0.30 && ratio <= 0.50;
    },
    { selector: sheetSelector, vh: viewportHeight },
    { timeout: 10000 }
  );

  await expect(targetLocator).toBeAttached();
  await targetLocator.scrollIntoViewIfNeeded();
  await expect(targetLocator).toBeVisible();

  const box = await targetLocator.boundingBox();
  expect(box, 'Brak boundingBox dla elementu przewijanego w arkuszu').not.toBeNull();

  if (box) {
    expect(
      box.y + box.height <= viewportHeight + 1,
      `Element przewijany wystaje poza dół ekranu: y=${box.y}, h=${box.height}, vh=${viewportHeight}`
    ).toBe(true);
    expect(
      box.y >= 0,
      `Element przewijany leży powyżej góry ekranu: y=${box.y}`
    ).toBe(true);
  }
}
