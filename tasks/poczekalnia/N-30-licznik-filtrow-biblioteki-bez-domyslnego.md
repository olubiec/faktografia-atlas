# N-30 – Licznik „Filtry (aktywne: N)” nie liczy ustawienia domyślnego
Cel: Na telefonie przycisk filtrów biblioteki pokazuje „Filtry (aktywne: 1)” zaraz po wejściu na `/biblioteka`, choć użytkownik niczego nie wybrał – liczony jest domyślny przełącznik „tylko z danymi” (P3-C). Licznik ma liczyć filtry wybrane przez użytkownika: poziom i jednostkę. Przełącznik „tylko z danymi” ma własną, widoczną kontrolkę. Padają przez to dwa testy library-search (360×740, „aktywne: 0”).
Zmieniaj: src/view/library/LibraryFilters.tsx, tests/unit/library-filters-count.test.tsx, tests/e2e/library-filters-count.spec.ts
Wymagane: tests/unit/library-filters-count.test.tsx, tests/e2e/library-filters-count.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/library-filters-count.spec.ts tests/e2e/library-search.spec.ts tests/e2e/library-page.spec.ts
Przeczytaj najpierw: src/view/library/LibraryFilters.tsx (linie 28–32 i 60–70), tests/unit/library-filters.test.tsx (przycisk „Wyczyść filtry” przy `onlyReady` – ma zostać zielony), src/view/library/library-params.ts, tasks/poczekalnia/P3-C.md, tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 5)

Zadanie:
1. `LibraryFilters.tsx`: `activeCount` = (poziom ≠ null ? 1 : 0) + (jednostka ≠ null ? 1 : 0). `hasActiveFilters` i przycisk „Wyczyść filtry” bez zmian (istniejący test go przypina).
2. `tests/unit/library-filters-count.test.tsx` (`renderToString`): `onlyReady: true`, bez poziomu i jednostki → „Filtry (aktywne: 0)”; z poziomem 5 → „aktywne: 1”; z poziomem i jednostką → „aktywne: 2”; `onlyReady: false` bez innych → „aktywne: 0”.
3. `tests/e2e/library-filters-count.spec.ts` (nazwy z `@S21`, spis z fixture): 360×740, `/biblioteka` → „Filtry (aktywne: 0)”; rozwinięcie i wybór „Powiaty” → „aktywne: 1” i `l=5` w adresie.

Gotowe, gdy:
- Nowe testy zielone; library-filters.test, library-view.test, library-page zielone bez zmian.
- library-search.spec.ts – oba testy 360×740 z „Filtry (aktywne: 0)” zielone bez zmian w nich.

Nie rób: zmian domyślnego filtra, library-params.ts, istniejących testów; bez nowych pakietów.
