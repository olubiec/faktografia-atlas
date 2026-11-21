// Okładka wejścia do mapy: kopia obrysu Polski z tła `/` przykrywa ekran na czas ładowania mapy,
// a potem znika. Dzięki temu nie widać pustej powłoki ani kadrów, w których mapa dopiero ustawia kamerę.
// Działa bez View Transitions (też w Safari) i bez Reacta: okładka żyje w <body>, więc przetrwa zmianę trasy.

import { ATLAS_READY_EVENT } from '@/core/map/ready-gate';
import { posterRect, type Bbox, type Rect } from '@/core/start/poster-frame';

// Płótno mapy (canvas.maplibregl-canvas) nie wystarcza: czekamy na `atlas:ready` (idle + kolory).
/** Najdłużej trzymamy okładkę (wolna sieć): potem i tak odsłaniamy mapę. */
const MAX_COVER_MS = 6000;

let active: HTMLElement | null = null;

/** Miejsce Polski w pierwszym kadrze mapy (poster-frame); bez granic w obrysie: miejsce źródła na stronie. */
function coverRect(source: Element): Rect {
  const raw = source.getAttribute('data-bbox')?.split(',').map(Number);
  if (raw?.length === 4 && raw.every(Number.isFinite)) {
    return posterRect(raw as Bbox, window.innerWidth, window.innerHeight);
  }
  return source.getBoundingClientRect();
}

/** Rozwiązuje się na sygnał `atlas:ready` (mapa bezczynna i pokolorowana) albo po MAX_COVER_MS. */
function whenMapSettled(): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      window.removeEventListener(ATLAS_READY_EVENT, finish);
      window.clearTimeout(cap);
      resolve();
    };
    const cap = window.setTimeout(finish, MAX_COVER_MS);
    window.addEventListener(ATLAS_READY_EVENT, finish);
    if (document.documentElement.hasAttribute('data-atlas-ready')) finish();
  });
}

/**
 * Przykrywa ekran okładką z kopią `source` (obrys z tła) w tym samym miejscu i zwraca,
 * gdy okładka jest już widoczna. Zdejmuje ją sama, gdy mapa jest gotowa.
 * `animate: false` (prefers-reduced-motion): bez przenikania i przybliżenia.
 */
export function coverForMap(source: Element | null, animate: boolean): void {
  if (!source || active) return;
  const rect = coverRect(source);
  const cover = document.createElement('div');
  cover.setAttribute('data-slot', 'map-cover');
  cover.setAttribute('aria-hidden', 'true');
  cover.className = 'pointer-events-auto fixed inset-0 z-[20000] bg-kalka';
  const t = animate ? 'var(--motion-slow) var(--easing)' : '0s';
  // Okładka od razu w pełni widoczna: nic nie przenika na wejściu, więc nie ma klatki z pustym tłem.
  cover.style.opacity = '1';
  const copy = source.cloneNode(true) as SVGElement;
  copy.removeAttribute('role');
  copy.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
  cover.appendChild(copy);
  document.body.appendChild(cover);
  active = cover;
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
