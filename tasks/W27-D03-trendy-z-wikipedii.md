# D03 – Sygnał „o czym się teraz mówi” z odsłon Wikipedii (działa bez Search Console)
Cel: co tydzień robot sprawdza, które tematy (grupy wskaźników) zyskują zainteresowanie w Polsce. Mnożnik `trendBoost` przesuwa w górę fakty z tych tematów, nawet gdy sekrety Search Console nie są ustawione. Nic nie publikuje się bez scalenia przez właściciela.
Zmieniaj: src/core/facts/wiki-trend.ts, scripts/seo/wiki-topics.mjs, config/topic-wiki.json, .github/workflows/gsc-trend-boost.yml, docs/ELEMENTY.md, docs/KONCEPT-ODKRYCIA.md, tests/fixtures/wiki/*, tests/unit/w27-d03-wiki-trend.test.ts
Wymagane: tests/unit/w27-d03-wiki-trend.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md §7a–§7b, src/core/facts/trend-boost.ts, scripts/seo/gsc-topics.mjs, .github/workflows/gsc-trend-boost.yml, config/topic-keywords.json, config/facts.json (trendBoost, calendarPeaks)

Dlaczego Wikipedia:
- Google Trends nie ma ogólnodostępnego oficjalnego API, a zbieranie danych z jego strony jest kruche i niezgodne z regulaminem.
- Wikimedia ma publiczne, darmowe API odsłon artykułów: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/pl.wikipedia/all-access/user/<Artykuł>/daily/<RRRRMMDD>/<RRRRMMDD>`, bez klucza.

Zanim cokolwiek wejdzie:
- sprawdź licencję danych i zasady API (User-Agent z adresem repozytorium, **bez** e-maila i danych właściciela);
- wpisz usługę do `docs/ELEMENTY.md` (źródło, licencja, limity).

Bez sprawdzonej licencji zatrzymaj się i opisz to w PR.

Zadanie:
1. Utwórz `config/topic-wiki.json`: grupa wskaźników z `config/indicators.json` → 2–5 tytułów artykułów polskiej Wikipedii.
   - Propozycja do sprawdzenia:

     | grupa | artykuły |
     |---|---|
     | Ludność | „Demografia Polski”, „Współczynnik dzietności”, „Starzenie się społeczeństwa” |
     | Praca | „Bezrobocie”, „Płaca minimalna” |
     | Pieniądze | „Inflacja”, „Podatek dochodowy od osób fizycznych” |
     | Mieszkania | „Kredyt hipoteczny”, „Rynek nieruchomości” |
     | Środowisko | „Smog”, „Zanieczyszczenie powietrza” |
     | Życie | „Żłobek”, „Apteka” |
     | Transport | „Droga dla rowerów”, „Samochód osobowy” |

   - Tytuł, który nie istnieje albo jest przekierowaniem, wymień albo usuń.
   - Grupy niezmapowane w słowniku nie dostają mnożnika.
2. `src/core/facts/wiki-trend.ts` (czyste funkcje, ten sam kształt wyniku co `TopicTrend` z `trend-boost.ts`):
   - suma odsłon artykułów grupy z ostatnich 7 dni porównana ze średnią tygodniową z 4 tygodni wcześniej;
   - mnożnik `1 + min(0,5, wzrost)` tylko przy wzroście ≥ 30% i co najmniej 2000 odsłon w tygodniu (stałe w pliku, z komentarzem);
   - jeden artykuł nie może dać więcej niż 70% wzrostu grupy, żeby jednorazowy skok (np. śmierć znanej osoby) nie przestawiał tematów;
   - funkcja łącząca: `max(gsc, wiki)` dla każdej grupy.
3. `scripts/seo/wiki-topics.mjs [--write]`:
   - jedno zapytanie na artykuł (≤ 20 zapytań), odstęp ≥ 200 ms;
   - błąd sieci = brak sygnału, kod 0, `config/facts.json` bez zmian;
   - `--write` zapisuje `trendBoost` przez istniejące `replaceTrendBoost` i łączy z wynikiem kroku GSC z tego samego przebiegu;
   - tabelę tematów dopisuje do `$GITHUB_STEP_SUMMARY` i do opisu PR robota (sekcja „Tematy na czasie (Wikipedia)”).
4. `.github/workflows/gsc-trend-boost.yml`: po kroku GSC dodaj krok `node scripts/seo/wiki-topics.mjs --write`. Resztę (przebudowa faktów, PR robota bez automatycznego scalania) zostaw, ale ma działać także wtedy, gdy krok GSC nic nie zmienił, bo brakuje sekretu.
5. Fikstury:
   - nagraj prawdziwe odpowiedzi API (po jednej na 2–3 artykuły) do `tests/fixtures/wiki/`;
   - jeśli sieć sesji blokuje `wikimedia.org`, napisz w PR, że potrzebna jest zgoda na ten host, i zatrzymaj się. Zmyślonych odpowiedzi nie robisz.
6. W `docs/KONCEPT-ODKRYCIA.md` dopisz w §7 akapit „Sygnał z Wikipedii (W27-D03)”: źródło, progi, łączenie z GSC i granice. Mnożnik zmienia tylko kolejność prawdziwych faktów, nie tworzy nowych.

Gotowe, gdy:
- Test na fiksturach: wzrost +40% przy ≥ 2000 odsłon daje mnożnik 1,4. Wzrost przy 500 odsłonach i wzrost 20% dają 1 (brak wpisu).
- Test: skok jednego artykułu jest przycięty do 70% wzrostu grupy.
- Test: łączenie z GSC bierze większy mnożnik, a grupa tylko w jednym źródle zostaje z tamtym mnożnikiem.
- Test: błąd sieci lub HTTP 404 dla artykułu nie rzuca wyjątku i nie zmienia `config/facts.json`. Skrypt wywołany z wstrzykniętym fetch zwracającym błąd kończy się kodem 0.
- Test: `config/topic-wiki.json` ma tylko grupy istniejące w `config/indicators.json`, a każda grupa ma 1–5 artykułów.
- Workflow ma `permissions` co najwyżej takie jak dziś. Żaden sekret nie trafia do logu.

Nie ruszaj: `scripts/data/*`, `src/view/*`, `config/facts.json` w commicie (zapisuje go robot w swoim PR), pozostałych workflowów.
Tytuł PR zaczyna się od `[W27-D03]`; opis ma „Po ludzku”. Napisz w nim, jak ręcznie uruchomić workflow („Run workflow”), żeby zobaczyć pierwszy wynik.
