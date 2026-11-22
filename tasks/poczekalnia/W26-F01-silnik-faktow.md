# F01 – Silnik faktów: wykrywanie, siła, dobór, zdania (logika + robot)
Fala pliku: W26 (Odkrycia). Fala budowy: F-1. Zależy od: S06 (`src/core/seo`, format liczb).
Cel: Dla każdej jednostki (województwo, powiat, gmina) robot wylicza ≥ 3 prawdziwe, ciekawe fakty z danych GUS i zapisuje je do `public/data/facts/<WW>.json` oraz `public/data/facts-start.json` (Odkrycie dnia na 30 dni + 4 zestawienia, ≤ 4 KB). Nic nie zmienia się na stronie.
Zmieniaj: src/core/facts/*, config/facts.json, scripts/data/build-facts.mjs, .github/workflows/fetch-data.yml, public/data/facts/*, public/data/facts-start.json, tests/unit/f01-*.test.ts, tests/fixtures/facts/*, docs/research/F01-przeglad-faktow.md
Wymagane: tests/unit/f01-facts.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§2–§4, §9, §10), config/indicators.json, scripts/data/build-profiles.mjs (kształt profili), src/core/seo (S06: zdania, format pl-PL)
Zadanie:
1. `src/core/facts/` (czysta logika, pliki ≤ ok. 200 linii): typy `Fact {type, teryt, indicatorId, year, value, frame, compare, strength}`; detektory F1 (1% w poziomie), F2 (1–3 / 3 ostatnie w województwie, gdy ≥ 15 jednostek), F4 (zmiana 10 lat, 2% górne/dolne, bez okien ze zmianą granic), F5 (rekord względny do mediany kraju, odchylenie > 15%), F9 (typowość); detektor zmiany granic (powierzchnia z ludności/gęstości, skok > 3% r/r → wykluczenie okna); małe gminy (< 5 tys.) – stawki na 1000 jako średnia 3-letnia; siła = rzadkość × waga ramy × waga wskaźnika × świeżość; dobór 3 z różnorodnością (≤ 1 na wskaźnik, ≤ 2 na grupę); szablony zdań (słownik neutralny: „najwyższy/najniższy”, bez „najlepszy/najgorszy”, bez wykrzykników; miejsce zawsze „z N”).
2. `config/facts.json`: wagi ram, wagi wskaźników, progi, kalendarz tematów (miesiąc → grupa, mnożnik 1,5) – puste pole `trendBoost: {}` na przyszłość (F-5).
3. `scripts/data/build-facts.mjs` używa logiki z `src/core/facts` (jak inne skrypty importują TS – sprawdź wzorzec; jeśli niemożliwe, kompiluj przez istniejące narzędzie budowy lub `tsx`, bez nowego pakietu bez wpisu). Krok w `fetch-data.yml` po `build-profiles`. Wygeneruj i dołącz pliki z obecnych danych.
4. `facts-start.json`: `daily` (30 faktów krajowych F1/F4, rotacja deterministyczna po dacie), `lists` (4 zestawienia: 3 pierwsze pozycje + id wskaźnika i poziom do linku). Test CI: ≤ 4 KB.
5. `docs/research/F01-przeglad-faktow.md`: raport liczności (jak §2 koncepcji) + 50 losowych gmin z ich 3 faktami (do przeglądu przez właściciela).
Gotowe, gdy:
- Test: każda jednostka w fixture ma ≥ 3 fakty; zdania bez `undefined`/`NaN`/`null`, z liczbą i rokiem.
- Test: zakazane słowa („najlepsz”, „najgorsz”, „!”) nie występują w żadnym zdaniu.
- Test: okno ze zmianą granic (np. Opole 2017 w fixture) nie daje faktu F4.
- Test: dobór nie daje 2 faktów o tym samym wskaźniku.
- Test: `facts-start.json` ≤ 4096 bajtów; każdy plik `facts/<WW>.json` ma wszystkie jednostki województwa.
Nie ruszaj: pliki ekranu, docs/STAN.md, `*-snapshots/`.
Po ludzku: robot wyszukuje w danych GUS ciekawostki o każdym miejscu (rekordy, wyjątkowe zmiany) i zapisuje je do plików. Na stronie jeszcze nic nie widać; w PR jest lista 50 losowych gmin z faktami do przeczytania.
Tytuł PR zaczyna się od `[W26-F01]`; gałąź `claude/W26-F01` od `origin/main`.
