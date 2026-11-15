import { test, expect } from '@playwright/test';

// Główne trasy, na których przy prefers-reduced-motion nic nie może się animować.
const ROUTES = ['/', '/rankingi', '/porownaj', '/biblioteka', '/o-projekcie'] as const;

type RunningAnimation = { name: string; target: string; iterations: number | string };

for (const route of ROUTES) {
  test(`@S99 reduced-motion: brak trwających animacji na ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      // Zgoda odrzucona, żeby baner nie wnosił własnych animacji
      localStorage.setItem(
        'fa-consent-v1',
        JSON.stringify({ value: 'denied', at: new Date().toISOString() })
      );
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(route === '/' ? '/?e2e' : route);

    if (route === '/') {
      // Stan mapy tylko przez window.__atlas, nie przez piksele
      await page.waitForFunction(() => (window as any).__atlas?.ready === true);
    }

    await page.waitForTimeout(1000);

    const running = await page.evaluate((): RunningAnimation[] =>
      document
        .getAnimations()
        .filter((a) => a.playState === 'running')
        .map((a) => {
          const timing = a.effect?.getComputedTiming();
          const el = (a.effect as KeyframeEffect | null)?.target as Element | null;
          return {
            name: (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.id,
            target: el ? `${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').slice(0, 60)}` : '?',
            iterations: timing?.iterations === Infinity ? 'infinite' : (timing?.iterations ?? 0),
          };
        })
    );

    // Animacje skończone (przejścia, wejścia) łamią regułę; nieskończone też wypisujemy w komunikacie
    expect(running, `Trwające animacje na ${route}: ${JSON.stringify(running)}`).toEqual([]);
  });
}
