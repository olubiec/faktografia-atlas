# N-35 – Dług rozmiaru: podział src/core/search/index.ts (226 → ≤ 220 linii)
Cel: Zmniejszyć dług z listy `GRANDFATHERED_LINE_COUNT` w style-guard. Pomocnicze funkcje opisu i kolejności jednostek w wyszukiwarce idą do osobnego pliku, bez zmiany zachowania wyszukiwania i bez zmiany importów w reszcie kodu.
Zmieniaj: src/core/search/index.ts, src/core/search/unit-meta.ts, tests/unit/search-index-split.test.ts
Wymagane: src/core/search/unit-meta.ts, tests/unit/search-index-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/search.spec.ts
Przeczytaj najpierw: src/core/search/index.ts (funkcje prywatne linie 12–110: `getUnitLabel`, `getUnitContext`, `getCleanName`, `isMnpp`, `getTierRank`, `getMatchCategory`), src/core/search/types.ts, tests/unit/search.test.ts, tests/unit/search-ui.test.ts, tests/unit/style-guard.test.ts, `grep -rn "core/search" src tests` (jeśli `tests/e2e/search.spec.ts` nie istnieje, użyj speków z `grep -l "Ctrl+K\|Szukaj miejsca" tests/e2e`)

Zadanie:
1. Przenieś `getUnitLabel`, `getUnitContext`, `getCleanName`, `isMnpp`, `getTierRank` (i ewentualnie `getMatchCategory`) do nowego `src/core/search/unit-meta.ts` jako eksporty nazwane; `index.ts` je importuje. Treść funkcji bez zmian (tylko przeniesienie). Komentarze po polsku.
2. `index.ts` eksportuje dokładnie te same nazwy co dziś (`buildSearchIndex`, `search`, `normalize` i typy). Żaden inny plik w `src/` i `tests/` nie zmienia importów. Brak cyklu importów (`unit-meta.ts` nie importuje z `index.ts`).
3. `tests/unit/search-index-split.test.ts`: (a) `index.ts` i `unit-meta.ts` mają po ≤ 220 linii; (b) eksporty `index.ts` (`Object.keys(await import(...))`) zawierają `buildSearchIndex`, `search`, `normalize`; (c) na danych z `tests/fixtures` (te same co w search.test.ts): wyniki `search` dla 3 zapytań (np. nazwa bez polskich znaków, nazwa gminy miejsko-wiejskiej, prefiks 3 liter) – kolejność i etykiety zmierzone przed zmianą i wpisane do testu (opisz w komentarzu, że to zapis obecnego zachowania); (d) `getTierRank`/`getUnitLabel` z `unit-meta.ts` – po jednym przypadku na województwo, powiat i gminę.

Gotowe, gdy:
- Nowy test zielony; search.test, search-ui.test, style-guard i e2e wyszukiwarki zielone bez zmian.
- `wc -l src/core/search/index.ts src/core/search/unit-meta.ts` – oba ≤ 220 (podaj w raporcie).

Nie rób: zmian w style-guard.test.ts (wpis długu zostaje – usunie go planista po decyzji), w SearchDialog.tsx, useSearch.ts ani w zachowaniu wyszukiwania; bez nowych pakietów.
