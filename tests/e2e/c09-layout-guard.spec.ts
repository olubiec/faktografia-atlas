import { test, expect, type Page } from '@playwright/test';
import {
  checkInViewport,
  checkNoHorizontalScroll,
  checkNoOverlap,
  checkTouchTargets,
  guardLayout,
  type GuardRect,
} from './helpers/layoutGuard';

// C09: strażnik układu na każdej trasie i w czterech rozmiarach: nic się nie zasłania, nie wychodzi poza ekran,
// pola dotykowe ≥ 44 px, brak poziomego przewijania. Na /zestawienia z rankingiem i /porownaj tylko zasłanianie i przewijanie.
const WIDTHS = [360, 390, 768, 1280];
const HEIGHT = 800;

type Route = { name: string; url: string; touch: boolean; wait?: (page: Page) => Promise<void> };

const mapReady = async (page: Page) => {
  await page.waitForFunction(() => (window as unknown as { __atlas?: { ready?: boolean } }).__atlas?.ready === true);
};
const profileReady = async (page: Page) => {
  await mapReady(page);
  await page.waitForFunction(() => (window as unknown as { __atlas?: { profileOpen?: boolean } }).__atlas?.profileOpen === true);
  await page.waitForFunction(() => (window as unknown as { __atlas?: { camera?: { animating?: boolean } } }).__atlas?.camera?.animating === false);
  await page.waitForTimeout(500);
};

const ROUTES: Route[] = [
  { name: 'start', url: '/?e2e', touch: true },
  { name: 'mapa', url: '/mapa?e2e', touch: true, wait: mapReady },
  { name: 'mapa z gminą i profilem', url: '/mapa?e2e&u=1217011', touch: true, wait: profileReady },
  { name: 'o projekcie', url: '/o-projekcie?e2e', touch: true },
  { name: 'źródła', url: '/zrodla?e2e', touch: true },
  { name: 'prywatność', url: '/prywatnosc?e2e', touch: true },
  { name: 'ranking', url: '/zestawienia?i=population&e2e', touch: false },
  { name: 'porównaj', url: '/porownaj?e2e', touch: false },
];

for (const width of WIDTHS) {
  test.describe(`@C09 strażnik układu ${width}px`, () => {
    test.setTimeout(90000);
    test.use({ viewport: { width, height: HEIGHT } });

    for (const route of ROUTES) {
      test(`${route.name}: bez zasłaniania i wychodzenia poza ekran`, async ({ page }) => {
        await page.addInitScript(() => {
          localStorage.setItem('fa-consent-v1', JSON.stringify({ value: 'denied', at: new Date().toISOString() }));
        });
        await page.goto(route.url);
        await page.waitForLoadState('load');
        await page.locator('main, #root').first().waitFor();
        if (route.wait) await route.wait(page);
        else await page.waitForTimeout(800);
        const problems = await guardLayout(page, { touch: route.touch });
        expect(problems, `${route.url} @ ${width}px:\n${problems.join('\n')}`).toEqual([]);
      });
    }
  });
}

// Sprawdzenie samego strażnika na sztucznych danych: każda reguła musi umieć zawieść.
const rect = (over: Partial<GuardRect>): GuardRect => ({
  name: 'el', id: 1, x: 0, y: 0, w: 100, h: 50, zone: 1, ancestors: [1], interactive: true, fixedLike: true, inline: false, sheet: false, link: false, ...over,
});

test.describe('@C09 strażnik łapie błędy (sztuczne dane)', () => {
  test('przecięcie stref', () => {
    const a = rect({ name: 'A', id: 1, zone: 1, ancestors: [1] });
    const b = rect({ name: 'B', id: 2, zone: 2, ancestors: [2], x: 50, y: 10 });
    expect(checkNoOverlap([a, b])).toHaveLength(1);
    expect(checkNoOverlap([a, { ...b, x: 100 }])).toHaveLength(0);
  });
  test('ta sama strefa i element wewnątrz strefy nie są przecięciem', () => {
    const outer = rect({ name: 'okno', id: 1, zone: 1, ancestors: [1], interactive: false });
    const inner = rect({ name: 'przycisk', id: 3, zone: 1, ancestors: [1, 3], x: 10, y: 10, w: 20, h: 20 });
    expect(checkNoOverlap([outer, inner])).toHaveLength(0);
  });
  test('poza oknem', () => {
    expect(checkInViewport([rect({ x: 320, w: 100 })], 360, 800)).toHaveLength(1);
    expect(checkInViewport([rect({ x: -10 })], 360, 800)).toHaveLength(1);
    expect(checkInViewport([rect({ y: 780, h: 50 })], 360, 800)).toHaveLength(1);
    expect(checkInViewport([rect({ y: 780, h: 50, fixedLike: false })], 360, 800)).toHaveLength(0);
    expect(checkInViewport([rect({ y: 500, h: 760, sheet: true })], 360, 800)).toHaveLength(0);
    expect(checkInViewport([rect({ y: -20, sheet: true })], 360, 800)).toHaveLength(1);
    expect(checkInViewport([rect({})], 360, 800)).toHaveLength(0);
  });
  test('pole dotykowe poniżej 44 px (ale nie link w tekście)', () => {
    expect(checkTouchTargets([rect({ w: 40, h: 44 })])).toHaveLength(1);
    expect(checkTouchTargets([rect({ w: 44, h: 30 })])).toHaveLength(1);
    expect(checkTouchTargets([rect({ w: 44, h: 44 })])).toHaveLength(0);
    expect(checkTouchTargets([rect({ w: 30, h: 16, inline: true })])).toHaveLength(0);
    expect(checkTouchTargets([rect({ w: 30, h: 44, link: true })])).toHaveLength(0);
    expect(checkTouchTargets([rect({ w: 80, h: 30, link: true })])).toHaveLength(1);
    expect(checkTouchTargets([rect({ w: 30, h: 16, interactive: false })])).toHaveLength(0);
  });
  test('poziome przewijanie', () => {
    expect(checkNoHorizontalScroll({ scrollWidth: 400, innerWidth: 360 })).toHaveLength(1);
    expect(checkNoHorizontalScroll({ scrollWidth: 360, innerWidth: 360 })).toHaveLength(0);
  });
});
