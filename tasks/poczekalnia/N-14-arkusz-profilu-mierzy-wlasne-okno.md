# N-14 – Arkusz profilu na telefonie mierzy własne okno, nie pierwsze lepsze
Cel: Mapa na telefonie przesuwa się nad arkusz profilu zawsze o właściwą wysokość – także gdy profil otwarto z listy w arkuszu wskaźnika (wtedy w DOM przez chwilę są dwa okna `role="dialog"`).
Zmieniaj: src/view/profile/ProfileSheetMobile.tsx, src/core/map/test-seam.ts, tests/unit/test-seam-sheet-inset.test.ts, tests/e2e/profile-sheet-inset.spec.ts
Wymagane: tests/unit/test-seam-sheet-inset.test.ts, tests/e2e/profile-sheet-inset.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/profile-sheet-inset.spec.ts tests/e2e/profile-mobile.spec.ts tests/e2e/profile-mobile-inset.spec.ts tests/e2e/mobile-sheet-map-visible.spec.ts
Przeczytaj najpierw: src/view/profile/ProfileSheetMobile.tsx (`updateInset`, `attachObserver`), src/view/ui/BottomSheet.tsx (`role="dialog"` + `aria-label={title}`), src/view/main/MobileIndicatorBar.tsx (arkusz „Panel wskaźnika”, wybór jednostki zamyka go), src/view/map/sheetInset.ts (`getSheetInset`), src/core/map/test-seam.ts, tests/unit/map-seam.test.ts, tests/e2e/profile-mobile-inset.spec.ts

Diagnoza (planista, hipoteza do potwierdzenia testem): `ProfileSheetMobile` szuka `document.querySelector('[role="dialog"]')` – pierwszego okna w dokumencie. Arkusz wskaźnika jest też `BottomSheet` z `role="dialog"`, wcześniej w `body`, i przy wyborze jednostki z listy jeszcze się zamyka (animacja wyjścia). Wtedy obserwator podpina się do zamykanego arkusza wskaźnika, a po jego usunięciu inset mapy przestaje się aktualizować.

Zadanie:
1. `test-seam.ts`: dodaj do `AtlasState` opcjonalne pole `sheetInset?: number` i w getterze szwu zwracaj `getSheetInset()` (import z `@/view/map/sheetInset`, tak jak dziś `getCameraState`). Szew nadal działa tylko z `?e2e`.
2. `tests/unit/test-seam-sheet-inset.test.ts`: z atrapą `win` (`location.search = '?e2e'`) po `setSheetInset(123)` `__atlas.sheetInset === 123`; bez `?e2e` brak `__atlas`. Nie zmieniaj map-seam.test.ts.
3. Najpierw e2e `tests/e2e/profile-sheet-inset.spec.ts` (nazwy z `@S15`, 390×844, zgoda „denied”): (a) `/?e2e` → otwórz pasek wskaźnika → kliknij pierwszą jednostkę na liście w „Panel wskaźnika” → czekaj na `profileOpen === true` i zniknięcie „Panel wskaźnika”; potem `expect.poll`: |`__atlas.sheetInset` − min(844 − górna krawędź dialogu profilu, round(0,45·844))| ≤ 8; (b) to samo dla wejścia `/?e2e&u=12`; (c) po „Rozwiń” i „Zwiń” warunek z (a) nadal spełniony; (d) okno 1440×900, `/?e2e&u=12`: `sheetInset === 0`. Dialog profilu wybieraj po roli i nazwie (tytuł jednostki), nie pierwszy `[role=dialog]`. Zapisz w PR, czy (a) padł na obecnym kodzie (potwierdzenie hipotezy).
4. `ProfileSheetMobile.tsx`: oba wyszukania okna zawężone do własnego arkusza: `[role="dialog"][aria-label="…"]` z tytułem z `unitTitle(...)` (ten sam, który dostaje `BottomSheet`), z `CSS.escape` dla wartości. Reszta logiki bez zmian.

Gotowe, gdy:
- Nowe testy zielone 3 razy z rzędu (`--repeat-each=3`).
- profile-mobile.spec.ts, profile-mobile-inset.spec.ts, mobile-sheet-map-visible.spec.ts, profile-sheet-mobile.test.tsx, map-seam.test.ts zielone bez zmian.
- Jeśli (a) przechodzi także przed zmianą – i tak zostaw zawężenie (jest poprawne) i napisz w PR, że hipoteza się nie potwierdziła.

Nie rób: zmian w ProfilePortal.tsx, ProfileSheet.tsx, BottomSheet.tsx, AtlasMap.tsx, sheetInset.ts ani w istniejących testach.
