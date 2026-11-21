// Okładka wejścia do mapy: kopia obrysu Polski z tła `/` przykrywa ekran na czas ładowania mapy,
// a potem znika. Dzięki temu nie widać pustej powłoki ani kadrów, w których mapa dopiero ustawia kamerę.
// Działa bez View Transitions (też w Safari) i bez Reacta: okładka żyje w <body>, więc przetrwa zmianę trasy.

import { ATLAS_READY_EVENT } from '@/core/map/ready-gate';
import { setEntry } from '@/core/map/entry-handoff';
import { posterRect, type Bbox, type Rect } from '@/core/start/poster-frame';

// Płótno mapy (canvas.maplibregl-canvas) nie wystarcza: czekamy na `atlas:ready` (idle + kolory).
/** Najdłużej trzymamy okładkę (wolna sieć): potem i tak odsłaniamy mapę. */
const MAX_COVER_MS = 6000;

let active: HTMLElement | null = null;

/** Miejsce Polski w pierwszym kadrze mapy (poster-frame); bez granic w obrysie: miejsce źródła na stronie. */
function coverRect(source: Element): Rect {
  const bbox = sourceBbox(source);
  return bbox ? posterRect(bbox, window.innerWidth, window.innerHeight) : source.getBoundingClientRect();
}

function sourceBbox(source: Element): Bbox | null {
  const raw = source.getAttribute('data-bbox')?.split(',').map(Number);
  return raw?.length === 4 && raw.every(Number.isFinite) ? (raw as Bbox) : null;
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
 * Animacja tła przygasza część województw (inline `opacity` < 1); kopia przeniosłaby to na okładkę,
 * a mapa pod spodem jest w pełnych kolorach. Dlatego okładka wygasza przygaszenie do pełnej jasności
 * (zanim mapa się odsłoni), żeby przejście okładka → mapa nie było skokiem w jasności.
 */
function settleCells(copy: SVGElement, animate: boolean): void {
  const cells = Array.from(copy.querySelectorAll<SVGPathElement>('path'));
  if (animate) {
    cells.forEach((el) => {
      el.style.transition = 'opacity var(--motion-slow) var(--easing), fill var(--motion-slow) var(--easing)';
    });
    // Wymuszenie układu: przejście ma ruszyć od przygaszonego stanu skopiowanego z tła.
    void copy.getBoundingClientRect();
  }
  cells.forEach((el) => {
    el.style.opacity = '1';
    el.style.fillOpacity = '1';
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
  const bbox = sourceBbox(source);
  // Mapa wystartuje w tym samym kadrze (entry-frame) i dopiero po gotowości dojedzie do zwykłego widoku.
  if (bbox) setEntry({ bbox, viewport: { width: window.innerWidth, height: window.innerHeight } });
  // Z animacją: okładka zaczyna tam, gdzie obrys jest na stronie (też po przewinięciu), i płynnie dojeżdża do kadru mapy.
  const from = animate ? source.getBoundingClientRect() : rect;
  const cover = document.createElement('div');
  cover.setAttribute('data-slot', 'map-cover');
  cover.setAttribute('aria-hidden', 'true');
  cover.className = 'pointer-events-auto fixed inset-0 z-[20000] bg-kalka';
  const t = animate ? 'var(--motion-slow) var(--easing)' : '0s';
  // Okładka od razu w pełni widoczna: nic nie przenika na wejściu, więc nie ma klatki z pustym tłem.
  cover.style.opacity = '1';
  const copy = source.cloneNode(true) as SVGElement;
  copy.removeAttribute('role');
  const place = (r: Rect) => `position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
  copy.style.cssText = place(from);
  cover.appendChild(copy);
  document.body.appendChild(cover);
  settleCells(copy, animate);
  if (animate && from !== rect) {
    requestAnimationFrame(() => {
      void copy.getBoundingClientRect(); // wymusza pozycję startową, żeby przejście ruszyło od niej
      copy.style.transition = `left ${t}, top ${t}, width ${t}, height ${t}`;
      copy.style.cssText += place(rect);
    });
  }
  active = cover;
  void whenMapSettled().then(() => {
    cover.style.transition = `opacity ${t}`;
    cover.style.opacity = '0';
    // Od początku znikania okładka nie łapie wskaźnika: dotyk w trakcie ruchu kamery trafia w mapę i go przerywa.
    cover.style.pointerEvents = 'none';
    const done = () => {
      cover.remove();
      if (active === cover) active = null;
    };
    if (animate) window.setTimeout(done, 700);
    else done();
  });
}
