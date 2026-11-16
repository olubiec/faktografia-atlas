# N-22 – Przewijane poziomo tabele dostępne z klawiatury (WCAG 2.1.1, axe scrollable-region-focusable)
Cel: Tabele w kontenerach `overflow-x-auto` da się przewinąć klawiaturą i czytnik ekranu je nazywa. Dziś robi to za aplikację `a11y-matrix.spec.ts` (wstrzykuje `tabindex`, `role="region"`, `aria-label` do `.overflow-x-auto` przed skanem) – poprawka ma być w kodzie strony.
Zmieniaj: src/view/profile/ProfileParts.tsx, src/view/profile/ProfileCompareTable.tsx, src/view/pages/SourcesIndicatorTable.tsx, tests/unit/scroll-regions.test.tsx, tests/e2e/scroll-regions-a11y.spec.ts
Wymagane: tests/unit/scroll-regions.test.tsx, tests/e2e/scroll-regions-a11y.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/scroll-regions-a11y.spec.ts tests/e2e/a11y-matrix.spec.ts tests/e2e/s20-parts.spec.ts tests/e2e/compare-table.spec.ts tests/e2e/editorial-pages.spec.ts tests/e2e/mobile-geometry-pages.spec.ts
Przeczytaj najpierw: tests/e2e/a11y-matrix.spec.ts (funkcja `runAxe`, wstrzykiwanie atrybutów), src/view/profile/ProfileParts.tsx (ok. linia 90), src/view/profile/ProfileCompareTable.tsx (ok. linia 147), src/view/pages/SourcesIndicatorTable.tsx (ok. linia 36), tests/unit/profile-parts.test.tsx (render przez `renderToString`), docs/STYL.md (fokus), tests/e2e/s20-parts.spec.ts i compare-table.spec.ts (jak dojść do bloku części i tabeli porównania)

Zadanie:
1. W każdym z trzech kontenerów `overflow-x-auto`: `tabIndex={0}`, `role="region"`, `aria-label` po polsku opisujący treść („Miasto i obszar wiejski – tabela”, „Porównanie miejsc – tabela”, „Wskaźniki i źródła – tabela”) oraz widoczny fokus z klas tokenów, takich jak już używane w projekcie (np. `focus-visible:ring-…` z istniejących komponentów). Bez zmian układu i kolorów w stanie spoczynku. Jeśli linter zgłasza `tabIndex` na elemencie nieinteraktywnym – NIE wyłączaj reguły; opisz w raporcie i zatrzymaj się.
2. Wariant telefonu w ProfileParts (karty bez poziomego przewijania, §4c) nie dostaje `tabIndex` – tylko kontener z tabelą.
3. `tests/unit/scroll-regions.test.tsx` (`renderToString`, wzorem profile-parts.test.tsx): każdy z trzech komponentów renderuje element z `overflow-x-auto`, który ma `tabindex="0"`, `role="region"` i niepusty `aria-label`; ProfileParts w trybie telefonu nie ma `tabindex` na kartach.
4. `tests/e2e/scroll-regions-a11y.spec.ts` (nazwy z `@S21`, zgoda „denied”): BEZ wstrzykiwania atrybutów uruchom `new AxeBuilder({ page }).withRules(['scrollable-region-focusable'])` na: `/zrodla` (390×844 i 1440×900), tabeli porównania (`/?e2e=1&u=12&c=12,14`, 1440×900) i rozwiniętym bloku części gminy (ścieżka i mock jak w s20-parts.spec) → 0 naruszeń. Dodatkowo: Tab dochodzi do regionu tabeli na `/zrodla` (fokus na elemencie z `role="region"`), a strzałka w prawo zwiększa `scrollLeft`, jeśli tabela jest szersza niż kontener (gdy nie jest – asercja pomijana z komentarzem).

Gotowe, gdy:
- Nowe testy zielone; a11y-matrix, s20-parts, compare-table, editorial-pages, mobile-geometry-pages, profile-parts.test, compare-view.test, info-pages.test zielone bez zmian.
- W raporcie: lista zrzutów (`*-snapshots`), które mogą wymagać odświeżenia workflow „Update snapshots”.

Nie rób: zmian w a11y-matrix.spec.ts ani innych istniejących testach, w ProfileSheet*.tsx, tokenach; bez pułapki fokusu; bez nowych pakietów.
