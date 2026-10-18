# Sesja CC7.1b – formatowanie liczb, jednostek i źródła po polsku (czysta logika)

Zadanie: CC7.1b – formatowanie liczb, jednostek i źródła po polsku (czysta logika)
Kontekst: profil, legenda i dymki będą pokazywać liczby. Jedno miejsce formatowania zapobiega różnicom („1 234,5”, „12,3%”, „zł”).
Zakres (tylko te pliki):

- src/core/format/number.ts (nowy)
- tests/unit/format-number.test.ts (nowy)
- docs/sessions/CC7.1b.md

Warunki odbioru:

1. `formatValue(value, unit)` używa `Intl.NumberFormat('pl-PL')`: spacja niełamiąca jako separator tysięcy, przecinek dziesiętny, `%` i `zł` z niełamiącą spacją przed jednostką (testy dla 0, 1234,5, 1 000 000, ujemnych).
2. `null` → „brak danych” (nigdy „0” ani „NaN”).
3. Liczba miejsc po przecinku zależy od jednostki (% → 1, zł → 0, osoby → 0, na 1000 → 1); tabela w kodzie, test dla każdej jednostki z `config/indicators.json` (jeśli plik jeszcze nie istnieje na main, test na liście jednostek z MASTER_PLAN §4.2).
4. `formatSource(year)` → „Źródło: GUS, BDL, <rok>”.
5. Bez Reacta i DOM.
