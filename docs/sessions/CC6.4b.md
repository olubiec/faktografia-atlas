# Zadanie CC6.4b – skrypt pnpm data:fetch wokół logiki z CC6.4a

**Kontekst:** `scripts/data/values.mjs` (CC6.4a, na main) zamienia strony BDL na plik wartości (`toIndicatorValues`, `nextPageUrl`). Wzór pobierania stron i limitów jest w `scripts/data/record-bdl.mjs` (adresy, `levelsFor`, ponowienia przy 429/5xx, tempo) – możesz z niego importować funkcje, ale go nie zmieniaj. Skrypt uruchamia tylko workflow w GitHub Actions z sekretem `BDL_CLIENT_ID`; w testach działa zawsze na nagraniach z `tests/fixtures/bdl/recorded/` (wstrzyknięta funkcja pobierająca, bez sieci).
**Cel dla użytkownika:** brak widocznej zmiany; to podstawa danych dla profilu i kartogramu.

## Zakres (tylko te pliki)

- `scripts/data/fetch-values.mjs` (nowy)
- `package.json` – WYŁĄCZNIE dopisanie jednej linii skryptu `"data:fetch": "node scripts/data/fetch-values.mjs"` (wyjątek od zakazu, nic więcej; `pnpm-lock.yaml` bez zmian)
- `tests/unit/fetch-values.test.ts` (nowy)
- `docs/sessions/CC6.4b.md`

## Warunki odbioru

- Dla każdego wskaźnika z `config/indicators.json` pobiera WSZYSTKIE lata, strona po stronie (`nextPageUrl`), dla poziomów: 2 (województwa), 5 (powiaty) oraz 6 (gminy, tylko gdy `minLevel` to `gmi`); strony wszystkich poziomów trafiają razem do `toIndicatorValues`; wynik zapisuje do `public/data/values/<id>.json`. Test na nagraniach pokazuje, że wynik ma klucze TERYT z `units.json`.
- Brak `BDL_CLIENT_ID` w środowisku kończy skrypt kodem 1 i czytelnym komunikatem, bez tworzenia plików (test). Klucz nie pojawia się w żadnym logu ani pliku (test przechwytuje `stdout`/`stderr`).
- Limity i ponowienia: tempo najwyżej 1 zapytanie na 2 s, przy 429 czekanie i ponowienie, przy 5xx ponowienie, maks. 5 prób – test na wstrzykniętym zegarze i fałszywym `fetch`.
- Zapis pliku wskaźnika tylko po pobraniu wszystkich jego stron (brak połówkowych plików, test na błędzie w środku). Opcja `--skip-existing` pomija wskaźniki, których plik już istnieje (wznowienie po przerwaniu); opcja `--only=<id,id>` ogranicza listę.
- Na koniec raport w `stdout`: wskaźnik, ostatni rok, liczba jednostek z wartością / wszystkich na poziom, liczba zapytań.
