# Sesja CC5.1 — Indeks wyszukiwania jednostek

## Kontekst i cel
Zadanie CC5.1 polega na zaimplementowaniu czystej logiki wyszukiwania jednostek terytorialnych z obsługą braku polskich znaków, literówek oraz właściwego rozróżniania jednostek o takich samych nazwach. Wykorzystano bibliotekę `minisearch`. Moduł został zaprojektowany z myślą o rozszerzeniu w przyszłości o wyszukiwanie miejscowości (`kind: 'locality'`).

## Zakres zmian
- `src/core/search/normalize.ts` — funkcja normalizacji tekstu (małe litery, znaki diakrytyczne na łacińskie, sprowadzanie myślników i wielokrotnych spacji do pojedynczych spacji)
- `src/core/search/types.ts` — definicje typów dla wyników wyszukiwania, opcji i indeksera
- `src/core/search/index.ts` — budowa indeksu `buildSearchIndex` oraz wykonywanie wyszukiwania `search` z priorytetyzacją wyników
- `tests/unit/search.test.ts` — testy jednostkowe pokrywające wszystkie warunki odbioru oraz pomiary wydajności
- `docs/sessions/CC5.1.md` — dokumentacja sesji

## Tabela warunków odbioru i testów

| Warunek odbioru | Test w `tests/unit/search.test.ts` | Status |
| --- | --- | --- |
| `normalize(text)`: małe litery, znaki diakrytyczne, myślniki/spacze | `converts to lowercase and removes Polish diacritics`, `converts hyphens and multiple spaces into a single space` | PASS |
| `buildSearchIndex(units)` & `search(...)`: `label` i `context` | `handles query "lodz" ...`, `handles query "nowy targ" ...` | PASS |
| Zapytanie „lodz”: gmina Łódź (1061011) i powiat Łódź (1061) na początku | `handles query "lodz" - first two results are gmina Łódź and powiat Łódź` | PASS |
| Zapytanie „zakop”: Zakopane (1217011) pierwsze | `handles query "zakop" - Zakopane is first` | PASS |
| Zapytanie „zakopne” (literówka): Zakopane w wynikach | `handles query "zakopne" (typo) - Zakopane is in results` | PASS |
| Zapytanie „nowy targ”: obie gminy Nowy Targ (miejska i wiejska) z etykietami | `handles query "nowy targ" - both Nowy Targ gminas with distinct labels` | PASS |
| Zapytanie „krakow”: gmina Kraków (1261011) przed powiatem krakowskim (1206) | `handles query "krakow" - gmina Kraków before powiat krakowski` | PASS |
| Zapytanie „malopolskie”: województwo małopolskie (12) pierwsze | `handles query "malopolskie" - województwo 12 is first` | PASS |
| Pusty tekst / spacje / zapytanie < 2 znaki -> `[]` | `returns empty array for empty query, whitespace, or query shorter than 2 chars` | PASS |
| Obsługa `kind: 'unit' \| 'locality'` i opcjonalnej listy miejscowości | `supports optional localities parameter without altering unit results` | PASS |
| Wydajność budowania indeksu < 150 ms | `builds search index for 2875 units in less than 150 ms` | PASS |
| Wydajność zapytania < 5 ms (średnia ze 100) | `executes search queries in less than 5 ms on average (100 queries)` | PASS |

## Wyniki pomiarów wydajności (na 2875 jednostkach z `public/data/units.json`)
- **Czas budowy indeksu:** ~68 ms (wymóg: < 150 ms)
- **Średni czas zapytania:** ~0.47 ms / zapytanie (wymóg: < 5 ms)
