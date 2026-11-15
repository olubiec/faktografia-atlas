# N-06 – Pole „Szukaj jednostki” na /rankingi naprawdę filtruje listę
Cel: Wpisanie fragmentu nazwy (bez względu na polskie znaki i wielkość liter, np. „slask”) w polu „Szukaj jednostki” na /rankingi pokazuje pasujące jednostki z ich wartością, a brak trafień – czytelny komunikat; dziś pole nic nie robi.
Zmieniaj: src/core/ranking/filter-ranked.ts, src/view/pages/Rankings.tsx, tests/unit/ranking-filter.test.ts, tests/e2e/rankings-search.spec.ts
Wymagane: src/core/ranking/filter-ranked.ts, tests/unit/ranking-filter.test.ts, tests/e2e/rankings-search.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/rankings-search.spec.ts tests/e2e/rankings-mobile-p1a.spec.ts tests/e2e/rankings-and-compare-pages.spec.ts
Przeczytaj najpierw: src/view/pages/Rankings.tsx, src/core/search/normalize.ts, tests/unit/rankings-view.test.tsx (nie zmieniać: pozycja listy nie może zaczynać się od liczby i myślnika), docs/STYL.md

Zadanie:
1. `src/core/ranking/filter-ranked.ts`: `filterRankedUnits(items: RankedUnit[], query: string): RankedUnit[]` – pusty/same spacje = wszystkie bez zmian; inaczej pozycje, których `normalize(name)` zawiera `normalize(query)` (funkcja z `src/core/search/normalize.ts`), w kolejności rankingu.
2. `Rankings.tsx`: pole „Szukaj jednostki” sterowane stanem (`value`/`onChange`); lista dostaje `filterRankedUnits(ranking.items, query)`. Przy braku trafień akapit „Brak jednostek pasujących do „<fraza>”.” w kontenerze z `aria-live="polite"`. `RankingList` i `RankingSummary` – sygnatury bez zmian (podsumowanie liczone dalej z pełnej listy). Przy okazji usuń klasę `rounded` z `RankingSummary` (dług stylu: STYL.md – radius 0).
3. `tests/unit/ranking-filter.test.ts`: „slask” znajduje „śląskie”; wielkość liter bez znaczenia; spacje na brzegach ignorowane; pusta fraza = cała lista w tej samej kolejności; fraza bez trafień = pusta tablica.
4. `tests/e2e/rankings-search.spec.ts` (`@S21`, 390×844 i 1440×900): na /rankingi wpisz „slask” → lista ma 1 pozycję zawierającą „śląskie”; wpisz „xyz” → widać „Brak jednostek pasujących”; wyczyść pole → wraca 10 pozycji; brak poziomego przewijania (`scrollWidth <= clientWidth`).

Gotowe, gdy:
- Testy jednostkowe filtra przechodzą.
- Test e2e potwierdza filtrowanie, komunikat i powrót do pełnej listy na obu szerokościach.
- rankings-view.test.tsx, rankings-mobile-p1a.spec.ts i rankings-and-compare-pages.spec.ts zielone bez zmian.

Nie rób: podpinania martwych list „Dział / Wskaźnik / Poziom / Rok” (osobne zadanie), nowych pobrań danych, zmian istniejących testów.
