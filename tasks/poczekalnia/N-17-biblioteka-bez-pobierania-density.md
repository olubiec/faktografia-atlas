# N-17 – Biblioteka bez pobierania density.json ze stopki (§7)
Cel: Na stronach `/biblioteka` i `/biblioteka/<id>` stopka nie pobiera `data/values/density.json` (pliku z głównej mapy). Domyka znalezisko z N-13: istniejący `library-variable.spec.ts` („wejście = dokładnie 1 żądanie spisu i 1 żądanie wartości”) pada, bo `DataFreshness` w stopce woła `loadIndicatorValues('density')`, a test liczy wszystko z `/values/`. docs/PRODUKT.md §7: biblioteka – „żadnych values/* ani profiles/* z głównej mapy”.
Zmieniaj: src/core/freshness/freshness-label.ts, src/view/layout/DataFreshness.tsx, tests/unit/freshness-route.test.ts, tests/e2e/library-no-map-values.spec.ts
Wymagane: tests/unit/freshness-route.test.ts, tests/e2e/library-no-map-values.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/library-no-map-values.spec.ts tests/e2e/library-variable.spec.ts tests/e2e/freshness-single-fetch.spec.ts tests/e2e/library-page.spec.ts tests/e2e/s21-library.spec.ts tests/e2e/navigation-and-budgets.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md (§4d, §7), src/view/layout/DataFreshness.tsx, src/core/freshness/freshness-label.ts, src/view/layout/SiteFooter.tsx (gdzie montowana jest `DataFreshness`), tests/e2e/library-variable.spec.ts (test „dokładnie 1 żądanie”), tests/e2e/freshness-single-fetch.spec.ts, tasks/poczekalnia/NOC-RAPORT.md (N-01, N-13)

Diagnoza (planista, 2026-11-16): na `/biblioteka/101` przeglądarka pobiera `/data/units.json`, `/data/values/density.json`, `library/index.json`, `library/values/101.json`. Drugie `/values/` to density ze stopki.

Zadanie:
1. `freshness-label.ts`: czysta funkcja `freshnessFetchAllowed(pathname: string): boolean` – `false` dla `/biblioteka` i wszystkiego pod `/biblioteka/` (także z końcowym `/`), `true` dla pozostałych tras. Istniejąca `loadFreshnessLabel` bez zmiany sygnatury (używa jej `data-freshness-cache.test.ts`).
2. `DataFreshness.tsx`: odczytaj ścieżkę (`useLocation` z react-router, tak jak robią inne komponenty w `src/view/layout`); gdy `freshnessFetchAllowed` daje `false`, nie wywołuj `loadFreshnessLabel` (linijka świeżości się nie pokazuje). Na pozostałych trasach zachowanie bez zmian. Plik ≤ 40 linii.
3. `tests/unit/freshness-route.test.ts`: `/biblioteka`, `/biblioteka/`, `/biblioteka/101` → `false`; `/`, `/rankingi`, `/o-projekcie`, `/bibliotekarz` (nie zaczyna się od segmentu `biblioteka`) → `true`.
4. `tests/e2e/library-no-map-values.spec.ts` (nazwy z `@S21`, dane biblioteki z `tests/fixtures/library` przez `page.route` jak w library-variable.spec): wejście na `/biblioteka` i na `/biblioteka/101` → 0 żądań `**/data/values/*` i 0 żądań `**/data/profiles/*` do `networkidle`; na `/rankingi` stopka nadal pokazuje „Dane GUS odświeżone”.

Gotowe, gdy:
- Nowe testy zielone; istniejący `library-variable.spec.ts` przechodzi w całości (także test „dokładnie 1 żądanie”) bez zmian w nim – uruchom 3 razy (`--repeat-each=3`).
- freshness-single-fetch, library-page, s21-library, navigation-and-budgets, data-freshness-cache, freshness.test zielone bez zmian.

Nie rób: zmian w src/core/data/load-values.ts, src/core/freshness/freshness.ts, SiteFooter.tsx ani w istniejących testach; nie pokazuj daty z plików biblioteki zamiast density (to osobna decyzja); bez nowych pakietów.
