# Sesja CC5.4a – wyszukiwanie miejscowości (logika i leniwe ładowanie)

## Treść zadania
Zadanie: CC5.4a – wyszukiwanie miejscowości (logika i leniwe ładowanie)
Kontekst: okno Ctrl+K (CC5.2) szuka dziś tylko jednostek (`src/core/search`). Plik `public/data/localities.json` (kontrakt Locality w docs/MASTER_PLAN.md §4.5) jeszcze nie istnieje na main – powstanie z workflow PRNG. Do testów używasz próbek z `tests/fixtures/prng/`.
Cel dla użytkownika: po wpisaniu nazwy miejscowości w Ctrl+K widać ją w wynikach razem z gminą.

## Zakres zmian
- `src/core/search/localities.ts` (nowy):
  - Tworzenie indeksu MiniSearch i logika wyszukiwania miejscowości.
  - Normalizacja diakrytyków (`normalize`).
  - Kategoryzacja trafień (dokładna nazwa > początek nazwy > przybliżone dopasowanie).
  - Dołączanie nazwy gminy i kontekstu z `units.json`.
  - Ograniczenie wyników do maksymalnie 50 pozycji.
- `src/core/search/load-localities.ts` (nowy):
  - Leniwe pobieranie `/data/localities.json` dopiero po wywołaniu.
  - Zapamiętywanie w pamięci podręcznej (at most once fetch).
  - Odporność na brak pliku (404) oraz błędy sieciowe (zwraca `[]` bez zgłaszania błędów w konsoli).
- `src/view/search/SearchDialog.tsx`:
  - Leniwe ładowanie miejscowości po otwarciu okna wyszukiwania (Ctrl+K / przycisk).
  - Wyświetlanie wyników miejscowości w osobnej grupie „Miejscowości” pod grupą „Jednostki administracyjne”.
  - Zachowanie pełnej kompatybilności nawigacji klawiaturą (ArrowDown, ArrowUp, Enter).
- `tests/unit/localities-search.test.ts` (nowy):
  - Testy jednostkowe funkcji `searchLocalities` oraz `loadLocalities`.
- `tests/e2e/localities-search.spec.ts` (nowy):
  - Testy E2E sprawdzające brak żądania do `/data/localities.json` przed otwarciem dialogu oraz dokładne jedno żądanie po otwarciu.
  - Wyświetlanie grupy „Miejscowości”.
  - Prawidłowe i ciche obsłużenie statusu HTTP 404 bez psucia wyszukiwania jednostek.
- `docs/sessions/CC5.4a.md`:
  - Karta dokumentacji sesji.

## Warunki odbioru

| Warunek odbioru | Test / weryfikacja | Stan |
|---|---|---|
| `searchLocalities("lodz")` i `searchLocalities("Łódź")` zwracają Łódź; wynik zawiera nazwę, typ i nazwę gminy | `tests/unit/localities-search.test.ts` | PASSED |
| Max 50 wyników, dokładne trafienia na górze | `tests/unit/localities-search.test.ts` | PASSED |
| `localities.json` nie trafia do paczki głównej (brak żądania przed otwarciem Ctrl+K, jest po otwarciu) | `tests/e2e/localities-search.spec.ts` | PASSED |
| Brak pliku (404) nie psuje okna i nie generuje nieobsłużonego błędu w konsoli | `tests/e2e/localities-search.spec.ts` | PASSED |
| Wyniki miejscowości oznaczone w grupie „Miejscowości”, nawigacja klawiaturą bez zmian | `tests/e2e/localities-search.spec.ts` & `tests/e2e/search.spec.ts` | PASSED |
| Paczka główna (gzip) nie rośnie o więcej niż 5 KB | `pnpm build` (wzrost głównej paczki < 0.5 KB gzip) | PASSED |
