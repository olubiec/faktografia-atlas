# N-20 – Dług rozmiaru: podział src/core/library/query.ts (309 → ≤ 220 linii)
Cel: Zmniejszyć dług z listy `GRANDFATHERED_LINE_COUNT` w style-guard (20 plików > 220 linii). Czysta logika biblioteki dzielona na dwa pliki bez zmiany zachowania i bez zmiany importów w reszcie kodu.
Zmieniaj: src/core/library/query.ts, src/core/library/query-index.ts, tests/unit/library-query-split.test.ts
Wymagane: src/core/library/query-index.ts, tests/unit/library-query-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/library-page.spec.ts tests/e2e/library-search.spec.ts tests/e2e/s21-library.spec.ts
Przeczytaj najpierw: src/core/library/query.ts, tests/unit/library-query.test.ts, tests/unit/library-query-perf.test.ts, tests/unit/style-guard.test.ts (limit 220 i lista długu), `grep -rn "library/query" src tests`

Zadanie:
1. Przenieś przygotowanie indeksu (typ `PreparedIndex`, `indexCache`, `getPreparedIndex` i jego pomocnicze funkcje normalizacji tekstu) do nowego `src/core/library/query-index.ts`. Jeśli to za mało, by zejść do ≤ 220 linii, przenieś też `matchesLevel`/`getVarCategory`. Komentarze po polsku.
2. `query.ts` dalej eksportuje dokładnie te same nazwy co dziś (typy i funkcje: `LibraryQuery`, `LibraryCategory`, `LibraryVariable`, `LibraryIndex`, `emptyQuery`, `childCategories`, `categoryPath`, `filterVars`, `countByCategory` – sprawdź pełną listę przed zmianą). Żaden inny plik w `src/` i `tests/` nie zmienia importów. Brak cyklu importów (query-index.ts nie importuje z query.ts wartości – jeśli potrzebuje typów, przenieś typy do query-index.ts i re-eksportuj z query.ts).
3. Pamięć `WeakMap` zostaje jedna (ta sama instancja dla wszystkich funkcji) – test wydajności `library-query-perf.test.ts` musi dalej przechodzić.
4. `tests/unit/library-query-split.test.ts`: (a) `query.ts` i `query-index.ts` mają po ≤ 220 linii; (b) lista eksportów `query.ts` (`Object.keys(await import(...))`) zawiera wszystkie dotychczasowe funkcje; (c) na `tests/fixtures/library/index.json`: wyszukiwanie bez polskich znaków („ludnosc”) znajduje wskaźnik z „Ludność” w nazwie; filtr poziomu gmin pomija wskaźniki tylko powiatowe; suma `countByCategory` dla kategorii najwyższego poziomu równa się liczbie wyników `filterVars` dla pustego zapytania (albo – jeśli logika liczy inaczej – asercja zgodna z obecnym zachowaniem, zmierzona przed zmianą i opisana w komentarzu).

Gotowe, gdy:
- Nowy test zielony; library-query, library-query-perf, core-contracts-and-fuzz, library-*.test i style-guard zielone bez zmian; trzy speki e2e biblioteki zielone.
- `wc -l src/core/library/query.ts src/core/library/query-index.ts` – oba ≤ 220 (podaj w raporcie).

Nie rób: zmian w style-guard.test.ts (wpis długu zostaje – usunie go planista), w innych plikach biblioteki ani w zachowaniu wyszukiwania; bez nowych pakietów.
