// Okładka wejścia do mapy: kopia obrysu Polski z tła `/` przykrywa ekran na czas ładowania mapy,
// a potem znika. Dzięki temu nie widać pustej powłoki ani kadrów, w których mapa dopiero ustawia kamerę.
// Działa bez View Transitions (też w Safari) i bez Reacta: okładka żyje w <body>, więc przetrwa zmianę trasy.

const MAP_CANVAS = 'canvas.maplibregl-canvas';
/** Po pojawieniu się płótna mapy dajemy kamerze chwilę na ustawienie się na Polsce. */
const SETTLE_MS = 500;
/** Najdłużej trzymamy okładkę (wolna sieć): potem i tak odsłaniamy mapę. */
const MAX_COVER_MS = 6000;

let active: HTMLElement | null = null;

/** Rozwiązuje się, gdy mapa ma płótno i kamera mogła się ustawić (albo po MAX_COVER_MS). */
function whenMapSettled(): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    let seenAt = 0;
    const tick = () => {
      const now = performance.now();
      if (!seenAt && document.querySelector(MAP_CANVAS)) seenAt = now;
      if ((seenAt && now - seenAt >= SETTLE_MS) || now - start >= MAX_COVER_MS) return resolve();
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/**
 * Przykrywa ekran okładką z kopią `source` (obrys z tła) w tym samym miejscu i zwraca,
 * gdy okładka jest już widoczna. Zdejmuje ją sama, gdy mapa jest gotowa.
 * `animate: false` (prefers-reduced-motion): bez przenikania i przybliżenia.
 */
export function coverForMap(source: Element | null, animate: boolean): void {
  if (!source || active) return;
  const rect = source.getBoundingClientRect();
  const cover = document.createElement('div');
  cover.setAttribute('data-slot', 'map-cover');
  cover.setAttribute('aria-hidden', 'true');
  cover.className = 'pointer-events-auto fixed inset-0 z-[20000] bg-kalka';
  const t = animate ? 'var(--motion-slow) var(--easing)' : '0s';
  cover.style.opacity = animate ? '0' : '1';
  cover.style.transition = `opacity ${t}`;
  const copy = source.cloneNode(true) as SVGElement;
  copy.removeAttribute('role');
  copy.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;transform-origin:50% 50%;transition:transform ${animate ? 'calc(var(--motion-slow) * 3) var(--easing)' : '0s'}`;
  cover.appendChild(copy);
  document.body.appendChild(cover);
  active = cover;
  requestAnimationFrame(() => {
    cover.style.opacity = '1';
    if (animate) copy.style.transform = 'scale(1.06)';
  });
  void whenMapSettled().then(() => {
    cover.style.transition = `opacity ${t}`;
    cover.style.opacity = '0';
    const done = () => {
      cover.remove();
      if (active === cover) active = null;
    };
    if (animate) window.setTimeout(done, 700);
    else done();
  });
}
