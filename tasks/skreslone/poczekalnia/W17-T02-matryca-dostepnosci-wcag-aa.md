# T02 – Matryca dostepnosci WCAG 2.2 AA w jasnym i ciemnym motywie
Cel: Kompleksowy skan axe-core bez wylaczania regul na wszystkich trasach i modalach w motywie jasnym i ciemnym.
Zmieniaj: tests/e2e/a11y-matrix.spec.ts
Wymagane: tests/e2e/a11y-matrix.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/STYL.md, docs/ELEMENTY.md

Zadanie:
1. Utworz `tests/e2e/a11y-matrix.spec.ts`: parametryzowany skan `@axe-core/playwright` (z tagami `wcag2a`, `wcag2aa`, `wcag22aa`, bez wylaczania regul `color-contrast` ani `scrollable-region-focusable`):
   - Trasa `/` (stan startowy, arkusz wskaznika, profil jednostki 40% i 100%, zakladka porownania, zakladka czesci miasta/wsi),
   - Trasa `/rankingi`,
   - Trasa `/porownaj`,
   - Trasa `/biblioteka` oraz `/biblioteka/60614` (lub przykladowa zmienna),
   - Trasa `/o-projekcie`, `/zrodla`, `/prywatnosc`,
   - Okno dialogowe `ShareDialog` (wszystkie 4 karty).
2. Sprawdz kazdy z powyzszych ekranow w dwoch motywach: jasnym i ciemnym (`data-theme="dark"`).

Gotowe, gdy:
- Test `tests/e2e/a11y-matrix.spec.ts` raportuje 0 naruszen WCAG 2.2 AA na wszystkich sprawdzanych widokach w obu motywach.

Nie ruszaj: src/
