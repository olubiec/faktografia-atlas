# Sesja CC5.3b – pobieranie miejscowości z PRNG przez GitHub Actions

## Kontekst
Utworzenie skryptu wykonawczego `scripts/geo/localities.mjs` oraz przepływu pracy w GitHub Actions `.github/workflows/fetch-localities.yml` umożliwiającego automatyczne pobieranie i aktualizowanie samodzielnych miejscowości z Państwowego Rejestru Nazw Geograficznych (PRNG, GUGiK) do pliku `public/data/localities.json`.

## Zrealizowane zakresy
- `scripts/geo/localities.mjs`:
  - Skrypt CLI integrujący logikę z `scripts/geo/localities-parse.mjs` i `public/data/units.json`.
  - Pobieranie danych z endpointu OGC API Features (`NazwaGeograficznaRP`) z wielowątkowością (`concurrency`), limitem stron (`limit=150`), obsługą przekroczenia limitu czasu (`AbortController`) oraz ponawianiem nieudanych żądań (`fetchWithRetry` z wykładniczym opóźnieniem).
  - Obsługa trybu offline przez flagę `--fixture` / zmienną środowiskową `LOCALITIES_FIXTURE=1` oraz zapisu/odczytu z cache (`--cache`).
  - Serializacja wyniku do `public/data/localities.json` wraz z weryfikacją limitu rozmiaru (max 3 MB).
- `package.json`:
  - Dodanie komendy `"localities": "node scripts/geo/localities.mjs"`.
- `.github/workflows/fetch-localities.yml`:
  - Workflow GitHub Actions wyzwalany ręcznie (`workflow_dispatch`) oraz harmonogramem cyklicznym (`cron: '0 2 1 * *'`).
  - Wykonuje `pnpm localities` i w razie zmian w `public/data/localities.json` tworzy automatyczny commit.
- `public/data/localities.json`:
  - Plik danych miejscowości wygenerowany za pomocą `pnpm localities --fixture`.
- `tests/unit/localities-fetch.test.ts`:
  - Testy jednostkowe sprawdzające parsowanie argumentów CLI, mechanizm ponawiania żądań HTTP, wykonanie skryptu w trybie fixture i obsługę błędów.
- `docs/data-sources.md`:
  - Aktualizacja sekcji dotyczącej licencji PRNG (potwierdzony darmowy i nieograniczony dostęp na podstawie art. 40a ust. 2 pkt 1 lit. a ustawy Prawo geodezyjne i kartograficzne) oraz opisu automatyzacji.
- `docs/sessions/CC5.3b.md`:
  - Podsumowanie realizowanych prac.
