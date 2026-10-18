# Zadanie: CC8.1 – klasy kolorów kartogramu (czysta logika)

## Kontekst
Kartogram (CC8.2) pokoloruje gminy według wartości wskaźnika. Tu powstaje tylko logika podziału na klasy, bez UI. Prawdziwych wartości jeszcze nie ma na main, więc testy używają małych danych syntetycznych zgodnych z kontraktem IndicatorValues (docs/MASTER_PLAN.md §4.5).
Cel dla użytkownika: brak widocznej zmiany; to podstawa kolorowania mapy.

## Zakres (tylko te pliki)
- `src/core/map/classes.ts` (nowy)
- `tests/unit/classes.test.ts` (nowy)
- `tests/fixtures/synthetic/values-sample.json` (nowy, z polem `"_comment": "dane syntetyczne do testu"`)
- `docs/sessions/CC8.1.md` (nowy)

## Warunki odbioru
1. `computeBreaks(values, "quantile" | "equal", n)` zwraca n−1 progów rosnąco; wartości null są pomijane.
2. `classify(value, breaks)` zwraca indeks klasy 0…n−1, a dla null zwraca "no-data".
3. Przypadki brzegowe mają testy: wszystkie wartości równe, mniej różnych wartości niż klas, jedna wartość, sama lista null.
4. `classColorToken(index, n, scheme)` zwraca nazwę zmiennej CSS z istniejących tokenów: `--seq-1`…`--seq-5` (skala sequential) albo `--div-1`…`--div-5` (diverging, dla wskaźników z higherIsBetter: null nie używać), nigdy kolor hex. Dla "no-data" zwraca token braku danych (data.noData). Najwyżej 5 klas.
5. Moduł nie importuje Reacta, DOM ani deck.gl (test importów jak w tests/unit/dependencies.test.ts, w nowym pliku).

## Tabela weryfikacji warunków odbioru
| Warunek odbioru | Test / Dowód |
|---|---|
| `computeBreaks` wylicza n-1 progów rosnąco dla quantile/equal | `tests/unit/classes.test.ts` (`computeBreaks`) |
| `classify` zwraca 0...n-1 lub "no-data" | `tests/unit/classes.test.ts` (`classify`) |
| Przypadki brzegowe (równe wartości, mniej wartości niż klas, 1 wartość, same null) | `tests/unit/classes.test.ts` (`obsługuje przypadek brzegowy: ...`) |
| `classColorToken` zwraca tokeny CSS `--seq-1`...`--seq-5`, `--div-1`...`--div-5`, `--no-data`, zero hex | `tests/unit/classes.test.ts` (`classColorToken`) |
| Izolacja zależności (brak React, DOM, deck.gl w `classes.ts`) | `tests/unit/classes.test.ts` (`Izolacja zależności`) |
| Fixture syntetyczny zgodny z kontraktem | `tests/fixtures/synthetic/values-sample.json` |
