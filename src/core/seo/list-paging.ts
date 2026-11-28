// Strony pełnego zestawienia (`/zestawienie/<slug>`, `/zestawienie/<slug>/2`…): ścieżki, zakresy pozycji i nawigacja.
// Cała lista dzielona jest na strony po `lists.rows` pozycji; miejsca są ciągłe, remisy liczone na całej liście.

export interface PageNumber {
  n: number;
  path: string;
  current: boolean;
}

/** Numer strony albo „…” w miejscu pominiętych numerów. */
export type PageNav = (PageNumber | 'gap')[];

export const pagePath = (base: string, n: number): string => (n === 1 ? base : `${base}/${n}`);

export const pageCount = (total: number, perPage: number): number => Math.max(1, Math.ceil(total / perPage));

/** Numery stron do pokazania: pierwsza, ostatnia, bieżąca i dwie sąsiednie; resztę zastępuje „…”. */
export function pageNav(base: string, page: number, pages: number): PageNav {
  const shown = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: PageNav = [];
  shown.forEach((n, i) => {
    if (i > 0 && n - shown[i - 1] > 1) out.push('gap');
    out.push({ n, path: pagePath(base, n), current: n === page });
  });
  return out;
}
