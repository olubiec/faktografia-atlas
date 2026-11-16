# N-21 – Dług rozmiaru: podział src/core/library/load-library.ts (248 → ≤ 200 linii)
Cel: Drugi plik z listy długu style-guard. Funkcja przekształcania wartości (`valuesByTeryt` z pomocniczymi) trafia do osobnego pliku; pobieranie i pamięć zostają w load-library.ts. Zachowanie i importy w reszcie kodu bez zmian.
Zmieniaj: src/core/library/load-library.ts, src/core/library/library-values.ts, tests/unit/library-values-split.test.ts
Wymagane: src/core/library/library-values.ts, tests/unit/library-values-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/library-variable.spec.ts tests/e2e/s21-library.spec.ts
Przeczytaj najpierw: src/core/library/load-library.ts, tests/unit/load-library.test.ts, tests/unit/library-download-csv.test.tsx, `grep -rn "load-library" src tests`

Zadanie:
1. Przenieś `valuesByTeryt` (i funkcje/typy, których używa tylko ona) do `src/core/library/library-values.ts`. Typy wspólne (`CompactValues`, `LibraryValues`) zostają w load-library.ts albo przechodzą do nowego pliku z re-eksportem – wybierz wariant bez cyklu importów.
2. `load-library.ts` re-eksportuje `valuesByTeryt` (i przeniesione typy), więc żaden inny plik w `src/` i `tests/` nie zmienia importów. Pamięć podręczna (`valuesCache`, `valuesPromises`) i `resetLibraryCache` zostają w load-library.ts.
3. `tests/unit/library-values-split.test.ts`: (a) oba pliki ≤ 200 linii; (b) `valuesByTeryt` z load-library.ts to ta sama funkcja co z library-values.ts (`toBe`); (c) na `tests/fixtures/library/values-sample.json` i jednostkach z `tests/fixtures` (lub małej tablicy jednostek w teście): wynik dla poziomu powiatów zawiera tylko kody TERYT 4-cyfrowe jako string, a brak wartości nie daje zera.

Gotowe, gdy:
- Nowy test zielony; load-library, library-*.test, data-contract, style-guard zielone bez zmian; library-variable.spec i s21-library zielone (jeśli library-variable.spec „dokładnie 1 żądanie” pada – to znany błąd naprawiany w N-17, nie ruszaj go, odnotuj w raporcie).

Nie rób: zmian w query.ts (osobne zadanie N-20), LibraryVariable.tsx, style-guard.test.ts ani w istniejących testach; bez zmiany adresów pobierania.
