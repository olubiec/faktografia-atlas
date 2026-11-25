# D09 – Premiery z biblioteki też trafiają do Odkryć (na czas świeżości)
Cel: gdy premiera GUS dotyczy zmiennej z biblioteki (nie wskaźnika głównego) i zmienna przechodzi zasadę „nie niszowe”, przez okres świeżości jej najmocniejsze fakty krajowe trafiają do Odkrycia dnia i do zestawień. Po tym okresie wypadają z Odkryć, a zmienna zostaje w bibliotece.
Zmieniaj: src/core/facts/library-fresh.ts, src/core/facts/start.ts, scripts/data/build-facts.mjs, .github/workflows/fetch-data.yml, config/facts.json, tests/fixtures/library/*, tests/unit/w29-d09-library-discoveries.test.ts
Wymagane: tests/unit/w29-d09-library-discoveries.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tasks/W27-D02-swieze-dane-w-odkryciach.md, tasks/W27-D05-premiery-z-kalendarium-najpierw.md, scripts/data/build-facts.mjs, src/core/facts/build.ts, src/core/facts/start.ts, src/core/library/config.ts, src/core/indicators/registry.ts

Zadanie:
1. W `build-facts.mjs` (w workflow `fetch-data`):
   - wczytaj `library/calendar.json` i wartości `library/values/…` z gałęzi `data/library` (`git fetch` + `git show`, bez API BDL);
   - wybierz zmienne `downloaded` w ciągu `fresh.days`, które spełniają zasadę „nie niszowe” (ta sama funkcja co w W27-D05 i W28-D04, bez kopiowania), najwyżej `fresh.libraryMax` (start: 3).
   - Jeśli workflow nie może czytać gałęzi `data/library`, dodaj tylko krok `git fetch origin data/library` (jedna zmiana w `fetch-data.yml`).
2. Te zmienne wchodzą do silnika faktów jako wskaźniki tymczasowe:
   - id `b<varId>`;
   - nazwa i jednostka z `available.json`;
   - grupa z tematu publikacji;
   - wyłącznie fakty krajowe (1. miejsce bez remisu, rekord serii);
   - **nie** trafiają do „3 rzeczy” w profilach (pliki województw się nie zmieniają).
3. Odkrycie dnia i zestawienie świeżego wskaźnika (W27-D02) traktują je tak samo jak świeże wskaźniki główne. Link karty prowadzi do `/mapa?i=b<varId>&y=…&u=…`; strona już obsługuje id biblioteki.
4. Zdanie karty: jeśli szablony z `sentences.ts` nie dają poprawnego polskiego zdania dla jednostki zmiennej (np. „szt.”, „km”), zmienna wypada (test), a w PR podaj listę takich jednostek.

Gotowe, gdy:
- Test: świeża, nieniszowa zmienna biblioteki z premierą daje fakt w `facts-start.json` (Odkrycie dnia), a zmienna niszowa i nieświeża nie dają.
- Test: pliki `facts/<WW>.json` są identyczne z wynikiem bez zmiennych biblioteki.
- Test: link karty ma `i=b<varId>`. `facts-start.json` ≤ 4 KB.
- Test: brak gałęzi lub księgi = wynik identyczny jak dziś (bez wyjątku).

Nie ruszaj: `src/view/*`, `config/indicators.json`, `scripts/data/library*.mjs`.
Tytuł PR zaczyna się od `[W29-D09]`; opis ma „Po ludzku”.
