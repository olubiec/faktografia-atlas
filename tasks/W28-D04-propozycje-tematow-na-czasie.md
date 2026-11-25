# D04 – Robot proponuje nowe wskaźniki główne pasujące do tematów na czasie (decyduje właściciel)
Cel: gdy temat rośnie (Wikipedia z W27-D03, Search Console, kalendarium GUS), robot co tydzień wskazuje w swoim PR do 5 zmiennych z biblioteki GUS, które pasują do tematu i przechodzą filtr „nie niszowe”. Robot też szybciej je pobiera. Właściciel decyduje, czy któraś zostaje wskaźnikiem głównym (wtedy osobne zadanie jak W27-D01). Robot sam nie dodaje niczego do `config/indicators.json`.
Zmieniaj: src/core/facts/topic-proposals.ts, scripts/seo/wiki-topics.mjs, scripts/data/library-priority.mjs, config/library-priority.json, docs/KONCEPT-ODKRYCIA.md, tests/fixtures/library/available-sample.json, tests/unit/w28-d04-topic-proposals.test.ts
Wymagane: tests/unit/w28-d04-topic-proposals.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tasks/W27-D01-nowe-wskazniki-glowne.md (zasada „nie niszowe”), src/core/facts/wiki-trend.ts i scripts/seo/wiki-topics.mjs (z W27-D03), scripts/data/library-priority.mjs, scripts/data/gus-calendar.mjs, config/library-curation.json, config/topic-keywords.json

Zadanie:
1. `src/core/facts/topic-proposals.ts` (czyste funkcje):
   - **Wejście:** rosnące tematy (grupy z mnożnikiem > 1), spis biblioteki (`library/available.json`: `id, n, u, c, lv, y`), `config/topic-keywords.json`, `config/library-curation.json`, `config/indicators.json`.
   - **Dopasowanie:** zmienna pasuje do tematu, gdy słowa tematu ze słownika występują w `c` lub `n` (te same reguły co w `trend-boost.ts`).
   - **Filtr „nie niszowe”** (każdy warunek osobno testowany):
     - jednostka względna (`na 1000`, `na 10 tys.`, `na 100`, `%`, `na 1 mieszkańca`, `zł` na mieszkańca);
     - poziom `gmi` dostępny;
     - ostatni rok ≥ bieżący − 2;
     - seria ≥ 4 lata;
     - brak w `config/indicators.json` (po `bdlVarId`);
     - nie łamie `library-curation.json`;
     - nie jest wariantem „mężczyźni/kobiety/miasta/wieś”, jeśli istnieje wariant „ogółem”.
   - **Wynik:** do 5 propozycji na tydzień, po 1–2 na temat, posortowane według wzrostu tematu, a potem według długości serii.
2. W `scripts/seo/wiki-topics.mjs` dopisz do opisu PR robota sekcję „Propozycje nowych wskaźników (do decyzji)”: tabela z kolumnami id BDL, nazwa, jednostka, lata, temat i powód. Spis biblioteki czytaj z `origin/data/library:library/available.json` (`git show`, w Actions dostępny po `git fetch`). Brak spisu = brak sekcji, bez błędu.
3. Szybsze pobieranie tematów na czasie:
   - w `library-priority.mjs` dodaj premię `trendBonus` (w `config/library-priority.json`, start: 15 pkt) dla zmiennych pasujących do rosnącego tematu, na wzór `calendarBonus`;
   - lista rosnących tematów może trafić do konfiguracji tak samo jak `calendarStems`. Jeśli wymaga to zmiany workflowu biblioteki, napisz w PR i zatrzymaj się na tej części; punkty 1–2 zostają;
   - premia nie może przekroczyć udziału działu `maxSectionShareInRun` (test).
4. W `docs/KONCEPT-ODKRYCIA.md` dopisz krótki opis: robot proponuje, człowiek decyduje, filtr „nie niszowe”.

Gotowe, gdy:
- Test na `tests/fixtures/library/available-sample.json` (wycinek prawdziwego spisu, ok. 30 zmiennych, w tym warianty płci, liczby bezwzględne, serie przerwane przed 2022 i zmienne bez gmin):
  - przy rosnącym temacie „Ludność” propozycje zawierają tylko zmienne względne z gminami i świeżymi latami;
  - żadna propozycja nie jest już wskaźnikiem głównym ani wariantem płci.
- Test: brak rosnących tematów → brak propozycji. Brak spisu → brak sekcji, bez wyjątku.
- Test: `priorityScore` zmiennej pasującej do rosnącego tematu jest wyższy dokładnie o `trendBonus`, a `sortQueueByPriority` nadal zachowuje limit udziału działu.
- Istniejące testy `library-priority` przechodzą bez zmian.

Nie ruszaj: `config/indicators.json` (decyzja właściciela), `src/view/*`, `public/data/*`.
Tytuł PR zaczyna się od `[W28-D04]`; opis ma „Po ludzku”.
