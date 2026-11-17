# QC609 – Rankingi na rejestrze: wskaźniki z biblioteki w `/rankingi`
Cel: `/rankingi?i=b101` pokazuje ranking ze nazwami i wartościami, a wybór wskaźnika obejmuje bibliotekę.
Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-library.test.tsx
Wymagane: tests/unit/rankings-library.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-rankings.spec.ts
Przeczytaj najpierw: src/view/pages/Rankings.tsx (po QC106/QC802), src/view/hooks/useIndicatorRegistry.ts (QC606), src/core/indicators/load-any-values.ts (QC604), src/core/ranking/rankings-url.ts (QC101: `isKnownIndicator`), tests/e2e/q-rankings.spec.ts (**istniejący z QC106 – nie zmieniaj**)

## Kontekst
Wskaźniki biblioteki mają `higherIsBetter: null`, `minLevel` z dostępnych poziomów, jednostkę z `available.json`. Strona rankingów musi z nich korzystać tak samo jak z głównych.

## Research
1. W `Rankings.tsx` zamień źródło listy wskaźników na `useIndicatorRegistry()` i `loadIndicatorValues` na `loadAnyValues` (z `units` z tego samego wspólnego loadera, co w QC606).
2. `readRankingsState(search, registry.byId.has)` – nieznany `b…` po wczytaniu spisu → domyślny.
3. `availableLevels` z `registry.levels` (dla biblioteki dokładne poziomy z `lv`, nie tylko `minLevel`): np. wskaźnik tylko powiatowy wyłącza „Województwa” i „Gminy”.

## Zadanie
- Podmień źródła na rejestr; reszta strony bez zmian zachowania dla wskaźników głównych (**e2e QC106 zielony bez edycji**).
- Jednostka z rejestru; formatowanie liczb jak dotąd.
- Podczas ładowania spisu (`ready=false`) i wejścia z `?i=b…` – stan „Wczytujemy ranking…”, bez cofania do domyślnego.
- `RankingsFilters` dostaje `indicators={registry.all}` (prop już istnieje – plik `RankingsFilters.tsx` bez zmian).

## Testy (jednostkowe z mockiem sieci)
1. `?i=b101&l=pow` → lista pokazuje nazwy jednostek i wartości z `values-sample.json`, **żadnego** surowego kodu BDL/TERYT jako treści.
2. Poziomy: dla `b101` (tylko `pow`) „Gminy” i „Województwa” mają `aria-disabled`.
3. Wskaźnik główny działa jak przed zmianą (ten sam wynik co w teście QC106 dla `density`).
4. `?i=b999` (brak w spisie) → po wczytaniu spisu domyślny wskaźnik, adres poprawiony.
5. Żądania: jedno `available.json`, jedno żądanie wartości wskaźnika; zero `index.json`.
6. 404 wartości biblioteki → komunikat błędu i „Spróbuj ponownie”, bez wyjątku.

## Gotowe, gdy
- Ranking dla `?i=b<id>` pokazuje nazwy i wartości; e2e QC106 bez zmian i zielony.
Nie ruszaj: `rankings-url.ts`, `RankingsFilters.tsx`, `RankingsList.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
