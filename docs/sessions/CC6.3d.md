# Session CC6.3d — pokrycie w discover.mjs liczone po jednostkach z units.json

Zadanie: CC6.3d – pokrycie w discover.mjs liczone po jednostkach z units.json
Kontekst: scripts/data/discover.mjs przycina pokrycie: gmiCount = min(totalRecords, 2479). Zmienna z rekordami części gmin dostaje zawsze „2479/2479”. Nagrane odpowiedzi BDL dla wszystkich zmiennych z config/indicators.json leżą w tests/fixtures/bdl/recorded/ (workflow „BDL record”; pliki <varId>-l<poziom>-p<strona>.json, np. 79214-l6-p000.json, oraz <varId>-variable.json; w rekordach są 2 ostatnie lata z wartością; opis w REPORT.txt). Nie pobierasz niczego z sieci.
Cel dla użytkownika: raport docs/data-report.md pokazuje prawdziwą liczbę gmin i powiatów z danymi.
Zakres (tylko te pliki):

scripts/data/coverage.mjs (nowy): czysta funkcja countCoverage(records, units, level)
scripts/data/discover.mjs (tylko użycie countCoverage i usunięcie przycinania)
tests/unit/coverage.test.ts (nowy)
docs/data-report.md (tylko liczby pokrycia, wygenerowane skryptem w trybie offline)
docs/sessions/CC6.3d.md

Warunki odbioru:

Pokrycie = liczba rekordów, których id jest w zbiorze bdlId jednostek danego poziomu z public/data/units.json i które mają wartość w danym roku. Rekordy części gmin (np. miasto/obszar wiejski gminy miejsko-wiejskiej) nie są liczone (test na fixturze z obiema sytuacjami).
Brak przycinania do 2479/380 w całym skrypcie (test: wynik dla fixtury z nadmiarem rekordów < liczby rekordów).
Skrypt działa offline na nagranych plikach (--offline), test go tak uruchamia.
Tabela w raporcie: id wskaźnika, var-id, poziom, ostatni rok, liczba gmin i powiatów z wartością / wszystkich. Tę samą tabelę wklej do opisu PR.
