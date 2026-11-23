# F05 – „Nowe dane GUS”, kalendarz tematów, „Użyj mojej lokalizacji”
Fala pliku: W26 (Odkrycia). Fala budowy: F-4. Zależy od: F02, F04.
Cel: (1) Gdy robot wykryje nowy rok wskaźnika, otwiera PR ze stroną `/nowe-dane/<wskaźnik>-<rok>` (największe wzrosty, spadki, rekordy) – właściciel scala ręcznie. (2) Kalendarz tematów w `config/facts.json` podbija fakty tematu miesiąca na starcie. (3) Na starcie przycisk „Użyj mojej lokalizacji” ustala gminę w przeglądarce (punkt w granicach z `admin.topo.json`), z potwierdzeniem „Twoja gmina: X. Zmień”.
Zmieniaj: scripts/data/build-news.mjs, scripts/seo/*, src/core/facts/*, src/core/geo/locate.ts, src/view/start/*, config/facts.json, .github/workflows/fetch-data.yml, tests/unit/f05-*.test.ts, tests/e2e/f05-*.spec.ts
Wymagane: tests/unit/f05-news.test.ts, tests/unit/f05-locate.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§5, §7, §7a p.4), scripts/data/probe-new-year.mjs, scripts/data/gus-calendar.mjs, .github/workflows/fetch-data.yml
Zadanie: strona „Nowe dane” powstaje tylko w PR robota (osobna gałąź `robot/nowe-dane-<id>-<rok>`, bez auto-scalania); kalendarz: miesiąc → grupa (mnożnik 1,5) i daty szczytów; geolokalizacja tylko po kliknięciu, współrzędne nie wychodzą z urządzenia, granice pobierane dopiero po kliknięciu; brak zgody / błąd → komunikat i szukajka. Pole ≥ 44 px.
Gotowe, gdy:
- Test: punkt w Krakowie → gmina Kraków; punkt przy granicy gmin → właściwa gmina (point-in-polygon, nie najbliższy środek).
- Test: model strony „Nowe dane” dla fixture ma tytuł, wzrosty i spadki z danych, pomija zmiany granic.
- Test: w miesiącu z kalendarza fakty tematu mają wyższą siłę.
Nie ruszaj: pliki ekranu mapy, docs/STAN.md, `*-snapshots/`.
Po ludzku: po nowych danych GUS robot przygotowuje stronę „co się zmieniło” – pojawia się dopiero, gdy ją zatwierdzisz. Na starcie można jednym przyciskiem ustalić swoją gminę.
Tytuł PR zaczyna się od `[W26-F05]`; gałąź `claude/W26-F05` od `origin/main`.
