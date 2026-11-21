import type { Page } from '@playwright/test';

// C09: strażnik układu. Zbiera prostokąty elementów fixed/sticky/absolute i interaktywnych (a, button, input…)
// i sprawdza: brak przecięć między elementami z różnych stref, wszystko w oknie, pola dotykowe ≥ 44 px,
// brak poziomego przewijania strony. Funkcje `check*` są czyste (testowane na sztucznych danych).

export type GuardRect = {
  /** Opis do komunikatu: znacznik, rola, nazwa, klasy. */
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Identyfikator elementu w tym zbiorze. */
  id: number;
  /** Strefa: id zewnętrznego elementu pozycjonowanego (fixed/sticky/absolute) albo samego elementu. */
  zone: number;
  /** Lista stref-przodków (od zewnętrznej): element zawierający inny nie „przecina” go. */
  ancestors: number[];
  interactive: boolean;
  /** Element pozycjonowany (fixed/sticky/absolute) – sprawdzamy też pionowe mieszczenie się w oknie. */
  fixedLike: boolean;
  /** Link w ciągu tekstu: nie podlega minimum 44 px (WCAG 2.5.8, wyjątek „inline”). */
  inline: boolean;
  /** Okno/arkusz (`role="dialog"`): dolny arkusz na telefonie ma 90% wysokości i wystaje poza dół okna z założenia. */
  sheet: boolean;
  /** Link tekstowy (a): szerokość wynika z napisu. */
  link: boolean;
};

export type Collected = { rects: GuardRect[]; scrollWidth: number; innerWidth: number; innerHeight: number };

/** Zbiera dane z przeglądarki. Nie zmienia strony. */
export async function collectLayout(page: Page): Promise<Collected> {
  return page.evaluate(() => {
    const POS = ['fixed', 'sticky', 'absolute'];
    const INTERACTIVE = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="slider"]';
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (r.width < 5 || r.height < 5) return false; // sr-only, punkty i linki „Przejdź do treści” bez fokusu
      if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return false;
      // Elementy wycięte przez rodzica z overflow (np. zwinięte panele) nie są widoczne.
      return true;
    };
    const isPositioned = (el: Element) => POS.includes(getComputedStyle(el).position);
    const hasCanvas = (el: Element) => !!el.querySelector('canvas') || el.tagName === 'CANVAS';
    const hasContent = (el: Element) =>
      !!el.querySelector(INTERACTIVE) || (el.textContent ?? '').trim().length > 0 || el.matches(INTERACTIVE);
    // Nakładki bez własnej treści (tło okna, warstwa kliknięć) nie są „zasłaniającymi”.
    const decorative = (el: Element) => getComputedStyle(el).pointerEvents === 'none' && !el.matches(INTERACTIVE);

    /** Zewnętrzny element pozycjonowany w łańcuchu przodków (bez mapy i bez body). */
    const zoneRoot = (el: Element): Element => {
      let root: Element = el;
      let cur: Element | null = el;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        if (isPositioned(cur) && !hasCanvas(cur)) root = cur;
        cur = cur.parentElement;
      }
      return root;
    };

    /** Prostokąt elementu przycięty poziomo przez przewijane kontenery (np. tabela w `overflow-x-auto`); `null` = poza widokiem. */
    const clipX = (el: Element): DOMRect | null => {
      const r = el.getBoundingClientRect();
      let left = r.left;
      let right = r.right;
      for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'visible') continue;
        const pr = p.getBoundingClientRect();
        left = Math.max(left, pr.left);
        right = Math.min(right, pr.right);
      }
      if (right - left < 1) return null;
      return new DOMRect(left, r.y, right - left, r.height);
    };

    const ids = new Map<Element, number>();
    const idOf = (el: Element) => {
      if (!ids.has(el)) ids.set(el, ids.size + 1);
      return ids.get(el)!;
    };
    const describe = (el: Element) => {
      const label = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
      const role = el.getAttribute('role') ?? el.getAttribute('data-slot') ?? '';
      return `${el.tagName.toLowerCase()}${role ? `[${role}]` : ''} "${label}"`;
    };

    const candidates = new Set<Element>();
    document.querySelectorAll(INTERACTIVE).forEach((el) => candidates.add(el));
    document.querySelectorAll('body *').forEach((el) => {
      if (isPositioned(el) && !hasCanvas(el) && hasContent(el) && !decorative(el)) candidates.add(el);
    });

    const rects: Record<string, unknown>[] = [];
    for (const el of candidates) {
      if (!visible(el) || el.closest('[aria-hidden="true"], [inert]')) continue;
      if (el.closest('.maplibregl-canvas-container') || el.tagName === 'CANVAS') continue;
      const r = clipX(el);
      if (!r) continue;
      const root = zoneRoot(el);
      const ancestors: number[] = [];
      for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) {
        if (isPositioned(p) && !hasCanvas(p)) ancestors.unshift(idOf(p));
      }
      const interactive = el.matches(INTERACTIVE);
      const st = getComputedStyle(el);
      rects.push({
        name: describe(el),
        id: idOf(el),
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        zone: idOf(root),
        ancestors: [...ancestors, idOf(el)],
        interactive,
        fixedLike: POS.includes(st.position),
        sheet: el.getAttribute('role') === 'dialog',
        inline: el.tagName === 'A' && st.display === 'inline',
        link: el.tagName === 'A',
      });
    }
    return {
      rects: rects as unknown as GuardRect[],
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
  });
}

const EPS = 1;

export function intersects(a: GuardRect, b: GuardRect): boolean {
  return a.x + a.w - EPS > b.x && b.x + b.w - EPS > a.x && a.y + a.h - EPS > b.y && b.y + b.h - EPS > a.y;
}

/** Elementy z różnych stref, z których żaden nie zawiera drugiego, mają się nie przecinać. */
export function checkNoOverlap(rects: GuardRect[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]!;
      const b = rects[j]!;
      if (a.zone === b.zone) continue;
      // Jeden w drugim (dziecko strefy-rodzica) – to nie zasłanianie.
      if (a.ancestors.includes(b.id) || b.ancestors.includes(a.id)) continue;
      if (intersects(a, b)) out.push(`${a.name} przecina ${b.name}`);
    }
  }
  return out;
}

/** Wszystko w oknie poziomo; elementy fixed/sticky także pionowo. */
export function checkInViewport(rects: GuardRect[], width: number, height: number): string[] {
  const out: string[] = [];
  for (const r of rects) {
    if (r.x < -EPS) out.push(`${r.name} wystaje z lewej (${Math.round(r.x)})`);
    if (r.x + r.w > width + EPS) out.push(`${r.name} wystaje z prawej (${Math.round(r.x + r.w)} > ${width})`);
    if (r.fixedLike && r.y < -EPS) out.push(`${r.name} wystaje u góry (${Math.round(r.y)})`);
    if (r.fixedLike && !r.sheet && r.y + r.h > height + EPS) out.push(`${r.name} wystaje u dołu (${Math.round(r.y + r.h)} > ${height})`);
  }
  return out;
}

/**
 * Pola dotykowe ≥ 44 px. Wyjęte: linki w ciągu tekstu oraz szerokość linków tekstowych (jak w C05:
 * link tekstowy ma min. 44 px wysokości, a szerokość wynika z napisu).
 */
export function checkTouchTargets(rects: GuardRect[], min = 44): string[] {
  return rects
    .filter((r) => r.interactive && !r.inline && (r.h < min - 0.5 || (!r.link && r.w < min - 0.5)))
    .map((r) => `${r.name} ma ${Math.round(r.w)}×${Math.round(r.h)} px (min. ${min})`);
}

export function checkNoHorizontalScroll(c: Pick<Collected, 'scrollWidth' | 'innerWidth'>): string[] {
  return c.scrollWidth > c.innerWidth ? [`strona przewija się poziomo (${c.scrollWidth} > ${c.innerWidth})`] : [];
}

/** Zbiera układ i zwraca listę naruszeń (pusta = dobrze). `touch: false` pomija pola dotykowe i mieszczenie się. */
export async function guardLayout(page: Page, opts: { touch?: boolean } = {}): Promise<string[]> {
  const touch = opts.touch ?? true;
  const c = await collectLayout(page);
  return [
    ...checkNoOverlap(c.rects),
    ...checkNoHorizontalScroll(c),
    ...(touch ? [...checkInViewport(c.rects, c.innerWidth, c.innerHeight), ...checkTouchTargets(c.rects)] : []),
  ];
}
