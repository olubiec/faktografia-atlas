# Sesja CC6.3 – Wybór 20 wskaźników z BDL → raport

## Opis zadania
Celem sesji było przeszukanie API GUS BDL i odnalezienie odpowiadających zmiennych dla każdego z 20 wskaźników zdefiniowanych w `docs/MASTER_PLAN.md §4.2`.
Zgodnie z wymaganiami:
- Został stworzony skrypt `scripts/data/discover.mjs` wyszukujący zmienne BDL i generujący raport `docs/data-report.md`.
- Każdy wskaźnik ma propozycję 1–3 zmiennych kandydatów z uzasadnieniem lub status "brak danych".
- Dla każdego kandydata podano: jednostkę miary, najniższy poziom z danymi, dostępne lata, pokrycie (gminy/powiaty) oraz przykładowe wartości dla Małopolski i Zakopanego.
- Wszystkie liczby pochodzą wyłącznie z zarejestrowanych odpowiedzi API GUS BDL zarchiwizowanych w `tests/fixtures/bdl/discover-cache.json`.
- Skrypt działa 100% offline w testach na nagranych fixturach.
- Zmiany nie wprowadzają modyfikacji w `public/data/`, w kodzie strony `src/view` ani w `config/indicators.json` (ten plik powstanie w kolejnym kroku po akceptacji raportu przez właściciela).

## Zmienione i utworzone pliki
- `scripts/data/discover.mjs` (nowy skrypt odkrywania zmiennych w BDL z obsługą cache, limitów HTTP, throttlingu i ponawiania)
- `tests/fixtures/bdl/discover-cache.json` (nowy plik z nagranymi odpowiedziami API BDL)
- `tests/unit/discover.test.ts` (nowe testy jednostkowe weryfikujące poprawność discover.mjs i raportu)
- `docs/data-report.md` (nowy raport z wytypowanymi kandydatami BDL)
- `docs/sessions/CC6.3.md` (niniejszy plik dokumentujący przebieg sesji)

## Tabela warunków odbioru

| Warunek odbioru | Status | Weryfikacja / Test |
|---|---|---|
| Każdy wskaźnik z §4.2 ma wpis w raporcie | Spełniony | `tests/unit/discover.test.ts` (`lista INDICATORS zawiera dokładnie 20 wskaźników...`) |
| Odpowiedni opis dla kandydatów (jednostka, poziom, lata, pokrycie, przykłady Małopolska/Zakopane) | Spełniony | Wygenerowany `docs/data-report.md` oraz testy w `tests/unit/discover.test.ts` |
| Skrypt działa offline na fixturach w testach | Spełniony | `BdlDiscoverer({ offline: true })` testowany w `discover.test.ts` |
| Brak pobierania danych do public/data/ i brak zmian w UI | Spełniony | Brak modyfikacji w `public/data/` oraz `src/view` |
| Brak tworzenia `config/indicators.json` | Spełniony | Plik nie został utworzony |
| Klucz X-ClientId strictly z process.env.BDL_CLIENT_ID | Spełniony | Brak jakichkolwiek hardkodowanych kluczy w kodzie |
| Zgłoszenie PR i STOP po raporcie | Spełniony | Tworzymy PR z raportem |
