# QC106 – Strona Rankingi złożona z działających części (adres, filtry, lista, podsumowanie)
Cel: `/rankingi` działa: zmiana wskaźnika/poziomu/roku/województwa/szukania zmienia listę i adres; link otwiera ten sam ranking; bez pustego prostokąta „Mapa”.
Zmieniaj: src/view/pages/Rankings.tsx, tests/e2e/q-rankings.spec.ts
Wymagane: tests/e2e/q-rankings.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-rankings.spec.ts
Przeczytaj najpierw: src/view/pages/Rankings.tsx (obecna atrapa), src/core/ranking/{ranking,rankings-url,rankings-summary,rankings-filter}.ts, src/view/ranking/{RankingsFilters,RankingsList,RankingBars}.tsx, src/view/map/hooks/useMainView.ts (jak ładuje wartości – `loadIndicatorValues`), src/core/data/load-values.ts, src/core/units/, tests/e2e/rankings-and-compare-pages.spec.ts, tests/e2e/helpers/, docs/PRODUKT.md §4e, §7

## Kontekst
To jest zadanie, w którym ranking zaczyna działać dla użytkownika. Wszystkie klocki istnieją (QC101–QC105). Istniejący test `tests/e2e/rankings-and-compare-pages.spec.ts` **nie może paść ani się zmienić** – jeśli sprawdza coś, co usuwasz (np. tekst atrapy), zatrzymaj się i opisz w PR.

## Research
1. Jak ładować wartości wskaźnika: `loadIndicatorValues(id)` z `core/data/load-values` (jedno żądanie `values/<id>.json`, potem pamięć). **Zmiana wskaźnika = jedno żądanie** (PRODUKT §7).
2. Skąd lista jednostek (`units.json`)? Znajdź loader używany przez `useSearch`/`loadSearchIndex` i użyj tego samego – nie dodawaj drugiego pobrania.
3. Jak wyliczyć `availableLevels` wskaźnika: `indicator.minLevel` (`gmi` = wszystkie poziomy; `pow` = woj+pow; `woj` = tylko woj) – napisz małą funkcję lokalną ≤ 8 linii albo użyj istniejącej z `core/map/main-view.ts` (`clampLevel`).
4. `higherIsBetter` z `indicator` przekaż do `rankUnits`.

## Zadanie
Przebuduj `Rankings.tsx` (≤ 200 linii; jeśli rośnie – wydziel hook do `src/view/ranking/useRankings.ts` i dopisz go do „Zmieniaj:” w opisie PR):
- Stan z `readRankingsState(location.search)`; zmiany przez `applyRankingsChange` + `navigate(path + writeRankingsSearch(state), { replace: true })`.
- Dane: wartości wskaźnika, jednostki; `rankUnits({ values, units, level, year, parentTeryt: w, higherIsBetter })`; potem `filterRanking` (q) → `RankingsList`.
- Rok domyślny = najnowszy, który ma dane dla tego wskaźnika; jeśli `y` z adresu spoza `years` – użyj najnowszego.
- Poziom z adresu spoza `availableLevels` → obniż do dozwolonego (`clampLevel`) i popraw adres.
- Nad listą trzy zdania z `summarizeRanking` (QC102) liczone dla **pełnego** rankingu (nie po filtrze `q`).
- Stany: ładowanie („Wczytujemy ranking…”, `role="status"`), błąd sieci („Nie udało się wczytać danych. Spróbuj ponownie.” + przycisk), pusty wynik.
- **Usuń** pusty prostokąt „Mapa” i martwe pole „Szukaj” (zastąpione polem z `q`; pole ≥ 44 px, etykieta).
- Układ: 390 px bez poziomego przewijania; filtry zawijają się; lista na pełną szerokość.
- Obsługa „podziału na strony” nie jest tu potrzebna (jest w `RankingsList`).

## Testy e2e (`tests/e2e/q-rankings.spec.ts`, `@Q`)
1. `/rankingi` pokazuje listę z nazwami (np. „Warszawa”), **zero** pozycji będących samym kodem; widoczne zdania „Najwyżej:”, „Najniżej:”, „Mediana:”.
2. Zmiana wskaźnika w oknie → adres ma `?i=<nowy>`, lista się zmienia, wysłane dokładnie **jedno** nowe żądanie `values/*.json` (zlicz przez `page.on('request')`).
3. Wskaźnik tylko powiatowy (`unemployment-rate`) → „Gminy” wyłączone; wejście z `?i=unemployment-rate&l=gmi` poprawia na `pow`.
4. Wpisanie „lodz” w „Szukaj” zawęża listę do Łodzi i zmienia adres na `?q=lodz`; miejsce Łodzi w liście = miejsce w całym rankingu.
5. Wybór województwa „Małopolskie” zostawia tylko jednostki z TERYT na `12`.
6. Skopiowany adres (`page.url()`) otwarty w nowej karcie daje ten sam ranking (te same 3 pierwsze nazwy).
7. Klik w wiersz prowadzi na `/?u=<teryt>&i=<id>…` i mapa otwiera się z tym miejscem.
8. Telefon 390×844: `document.documentElement.scrollWidth <= 390`; wszystkie pola i przyciski mają wysokość ≥ 44 px.
9. Błąd sieci (abort żądania wartości) → komunikat i przycisk „Spróbuj ponownie” działa.

## Gotowe, gdy
- E2E `@Q` zielone; istniejące testy stron zielone bez zmian; nigdzie nie ma pustego prostokąta ani kodu zamiast nazwy.
Nie ruszaj: `ranking.ts`, plików mapy, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
