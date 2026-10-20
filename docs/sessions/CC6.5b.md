# Sesja CC6.5b – test kontraktu plików wartości

## Treść zadania

**CC6.5b – test kontraktu plików wartości**

Zadanie: CC6.5b – test kontraktu plików wartości
Wymaga na main: `public/data/values/population.json`, `scripts/data/values.mjs#toIndicatorValues`
Kontekst: pliki `public/data/values/<id>.json` tworzy `scripts/data/fetch-values.mjs` (CC6.4b) w workflow „Fetch data”. Kształt: typ `IndicatorValues` w `src/core/profile/profile.ts`. Lista wskaźników: `config/indicators.json`; jednostki: `public/data/units.json`. Test ma złapać zmianę formatu API albo zepsuty plik, zanim trafi na stronę.
Cel dla użytkownika: brak widocznej zmiany; zepsute dane zatrzymują CI.
Zakres (tylko te pliki):

- `scripts/data/contract.mjs` (nowy): `checkValuesFile(json, indicator, units)` → lista błędów
- `tests/unit/data-contract.test.ts` (nowy): sprawdza każdy plik w `public/data/values/`
- `docs/sessions/CC6.5b.md`

Warunki odbioru:

1. Dla każdego wskaźnika z `config/indicators.json` istnieje plik; `indicatorId` = nazwa pliku.
2. `years` rosnące, bez powtórzeń; każda tablica w `values` ma długość `years.length`; wartości to liczba albo `null`.
3. Klucze `values` to TERYT-y z `units.json`; co najmniej 95% jednostek poziomu `minLevel` ma wartość w ostatnim roku (inaczej błąd z nazwą wskaźnika i liczbą braków).
4. Brak wartości ujemnych dla wskaźników, które nie mogą być ujemne (wszystkie poza `natural-increase` i `migration-balance`).
5. Testy funkcji `checkValuesFile` na syntetycznych danych z błędami (każdy warunek osobno).

Poza zakresem: poprawianie danych, workflow.

## Podsumowanie wykonanych prac

1. Stworzono moduł `scripts/data/contract.mjs` eksportujący funkcję `checkValuesFile(json, indicator, units)` zwracającą listę błędów walidacji.
2. Stworzono zestaw testów w `tests/unit/data-contract.test.ts` weryfikujący wszystkie pliki `public/data/values/*.json` oraz sprawdzający izolowane przypadki z błędami syntetycznymi dla każdego warunku odbioru.
3. Zweryfikowano poprawność wszystkich wskaźników i plików danych.
