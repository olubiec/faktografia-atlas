# D08 – Gotowe materiały do social mediów ze świeżych danych (pakiet tygodnia)
Cel: co tydzień, a dodatkowo w dniu premiery GUS, robot przygotowuje pakiet „Do materiałów”, z którego od razu robimy posty i wpisy. Pierwszeństwo mają premiery, potem świeże dane, skrajności i tematy na czasie. Każda liczba ma źródło i link do widoku na mapie.
Zmieniaj: src/core/facts/materials.ts, scripts/data/calendar-board.mjs, .github/workflows/calendar-board.yml, docs/KONCEPT-ODKRYCIA.md, tests/unit/w29-d08-materials.test.ts, tests/fixtures/calendar-board/*
Wymagane: tests/unit/w29-d08-materials.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: AGENTS.md (zakaz generatora serii slajdów w tym repo), src/core/facts/* (szablony zdań, news.ts, lists.ts), scripts/data/calendar-board.mjs (W28-D07), tasks/W27-D02-swieze-dane-w-odkryciach.md

Granica:
- To jest **tekstowy pakiet treści** (zdania, liczby, rankingi, linki), nie generator grafik ani serii slajdów; ten zostaje w osobnym, prywatnym repo.
- Pakiet może służyć temu repo jako wejście, ale kodu tamtego repo tu nie piszemy.

Zadanie:
1. `src/core/facts/materials.ts` (czyste funkcje). Pakiet ma do 8 pozycji w kolejności:
   1. premiera GUS z ostatnich 7 dni (nowy rok wskaźnika z W27-D05);
   2. świeże dane (W27-D02);
   3. skrajności (1. miejsce w kraju, rekord serii, największy skok rok do roku);
   4. temat na czasie (`trendBoost`).

   Każda pozycja zawiera:
   - **tytuł roboczy** – zdanie z istniejących szablonów, ≤ 90 znaków;
   - **liczbę** z jednostką;
   - **ranking** – top 5 i dół 5 wśród gmin powyżej progu ludności, pomijając jednostki ze zmianą granic (`boundaries.ts`);
   - **kontekst** – średnia kraju i zmiana w 10 lat, jeśli są;
   - **źródło** – „GUS, BDL, <rok>”, `bdlVarId` i link do mapy `/mapa?i=…&y=…&u=…`;
   - **ostrzeżenia** – mała gmina, przerwa w serii, zmiana granic.

   Bez AI i bez liczb spoza `public/data` / biblioteki.
2. Wyjście:
   - sekcja „Do materiałów” w tablicy kalendarium (W28-D07, przypięte zgłoszenie);
   - plik `library/materials/<RRRR-MM-DD>.md` na gałęzi `data/library` (do pobrania i do prywatnego repo), plus `library/materials/latest.json` z tą samą treścią w strukturze;
   - przebieg w dniu premiery, gdy księga ma nowe `downloaded`.
3. W `docs/KONCEPT-ODKRYCIA.md` krótko: kolejność priorytetów pakietu i zasada „liczby tylko z danych”.

Gotowe, gdy:
- Test: przy premierze i świeżym wskaźniku premiera jest pierwsza, a świeży wskaźnik drugi. Bez premier i świeżych danych pakiet zawiera skrajności.
- Test: ranking pomija gminy poniżej progu ludności i ze zmianą granic. Każda pozycja ma źródło z rokiem i link do mapy z poprawnymi parametrami.
- Test: tytuł ≤ 90 znaków i zgodny z szablonem (porównanie z `src/core/facts/sentences.ts`).
- Test: `latest.json` i plik `.md` są deterministyczne dla tych samych danych.

Nie ruszaj: `src/view/*`, `config/indicators.json`, `scripts/data/library*.mjs`.
Tytuł PR zaczyna się od `[W29-D08]`; opis ma „Po ludzku” (gdzie co tydzień znaleźć pakiet).
