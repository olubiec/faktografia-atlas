# N-27 – Ekran ładowania podstrony ma `main` i nagłówek (axe na /biblioteka)
Cel: Podczas wczytywania kodu podstrony (`Suspense` w `AppRoutes`) dokument nie ma ani `main`, ani `h1` – czytnik ekranu trafia na pustą stronę. `/biblioteka` i `/biblioteka/:id` są ładowane leniwie bez wczesnego pobrania (N-11 objął inne trasy), więc axe uruchomiony zaraz po `page.goto('/biblioteka')` widzi tylko `PageFallback`. Przez to padają library-page „brak błędów dostępności axe” i library-search „brak błędów dostępności axe”.
Zmieniaj: src/App.tsx, tests/unit/page-fallback.test.tsx, tests/e2e/page-fallback-a11y.spec.ts
Wymagane: tests/unit/page-fallback.test.tsx, tests/e2e/page-fallback-a11y.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/page-fallback-a11y.spec.ts tests/e2e/library-page.spec.ts tests/e2e/route-prefetch.spec.ts tests/e2e/editorial-pages.spec.ts tests/e2e/navigation-and-budgets.spec.ts tests/e2e/a11y-matrix.spec.ts
Przeczytaj najpierw: src/App.tsx (`PageFallback`, `AppRoutes`), tests/unit/app-routes.test.tsx (sprawdza `data-testid="page-fallback"`), src/view/layout/SiteLayout.tsx (jak wygląda `main` na podstronach), tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 3)

Diagnoza (planista, 2026-11-16): axe na `/biblioteka` tuż po `goto`: `landmark-one-main` („Document does not have a main landmark”) i `page-has-heading-one` na `<html>`; po kilkuset ms strona ma `main` i `h1`.

Zadanie:
1. `PageFallback` w `App.tsx`: zamiast samego `<div>` zwróć `<main id="main-content" tabIndex={-1} aria-busy="true" data-testid="page-fallback" className="…obecne klasy…">` z ukrytym wizualnie `<h1 className="sr-only">Wczytywanie strony…</h1>` i `role="status"`/`aria-live="polite"` na krótkim tekście dla czytnika (może być ten sam napis). Wygląd (wysokość, tło) bez zmian. Zostaw `data-testid="page-fallback"`.
2. `tests/unit/page-fallback.test.tsx` (`renderToString(<PageFallback />)`): zawiera `<main`, `aria-busy="true"`, `data-testid="page-fallback"`, `<h1` z „Wczytywanie strony”.
3. `tests/e2e/page-fallback-a11y.spec.ts` (nazwy z `@S21`, spis biblioteki z `tests/fixtures/library/index.json` przez `page.route`): opóźnij odpowiedź na chunk strony biblioteki (`page.route('**/assets/Library-*.js', …)` z czekaniem ~1 s, potem `route.continue()`), wejdź na `/biblioteka`, sprawdź że widać `[data-testid="page-fallback"]`, axe `withRules(['landmark-one-main','page-has-heading-one','region'])` → 0 naruszeń; po wczytaniu w dokumencie jest dokładnie 1 `main` i 1 `h1` („Biblioteka wskaźników GUS”). Jeśli nazwa chunka nie pasuje do wzorca, dopasuj wzorzec do rzeczywistej nazwy z `dist/assets` (opisz w raporcie).

Gotowe, gdy:
- Nowe testy zielone; app-routes.test, route-prefetch, editorial-pages, navigation-and-budgets, a11y-matrix zielone bez zmian.
- library-page.spec.ts „brak błędów dostępności axe w trybie jasnym i ciemnym” i library-search.spec.ts „brak błędów dostępności axe…” zielone bez zmian w nich (`--repeat-each=3`). Jeśli któryś pada z inną regułą – wklej ją w raporcie.

Nie rób: zmian w Library.tsx, LibraryVariable.tsx, routeChunks, istniejących testach; nie dodawaj wczesnego pobierania biblioteki (osobna decyzja, §7); bez nowych pakietów.
