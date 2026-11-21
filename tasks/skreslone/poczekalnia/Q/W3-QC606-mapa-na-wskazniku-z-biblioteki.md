# QC606 – Mapa działa na wskaźniku z biblioteki (`/?i=b60614`)
Cel: Wskaźnik pobrany z biblioteki koloruje mapę tak samo jak 20 głównych: legenda, rok, poziomy, wybór miejsca.
Zmieniaj: src/view/map/hooks/useMainView.ts, src/view/hooks/useIndicatorRegistry.ts, tests/e2e/q-library-on-map.spec.ts
Wymagane: tests/e2e/q-library-on-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-library-on-map.spec.ts tests/e2e/main-screen.spec.ts tests/e2e/choropleth.spec.ts
Przeczytaj najpierw: src/view/map/hooks/useMainView.ts, src/core/indicators/{registry,load-available,load-any-values}.ts (QC602–QC604), src/core/url/state.ts (QC605: trzeci parametr `isKnownIndicator`), src/core/map/main-view.ts (`resolveYear`, `clampLevel`, `DEFAULT_*`), src/view/search/useSearch.ts (jak ładowany `units.json` – **wspólny loader**), tests/e2e/choropleth.spec.ts, tests/e2e/main-screen.spec.ts, tests/e2e/helpers/, docs/PRODUKT.md §4d, §7

## Zgoda na plik ekranu
Ten prompt **wprost** pozwala zmienić `src/view/map/hooks/useMainView.ts`. Innych plików ekranu nie ruszaj. Nowy plik `src/view/hooks/useIndicatorRegistry.ts` NIE jest plikiem ekranu.

## Kontekst
To jest zadanie, w którym „pobrane wskaźniki są na mapie”. Wszystkie klocki są gotowe: rejestr (QC602), spis (QC603), wspólny loader wartości (QC604), adres (QC605). `useMainView` dziś zna tylko `INDICATORS` z configu i `loadIndicatorValues`. **Eksport `INDICATORS` ma zostać** (używają go inne pliki).

## Research
1. `rg "INDICATORS|useMainView"` – kto jeszcze korzysta; nie psuj ich.
2. Skąd `Unit[]` z `bdlId` dla `loadAnyValues`: wspólny loader jednostek używany przez wyszukiwarkę (`UNITS_URL`/`loadSearchIndex`) – użyj go (jedno żądanie, już wykonywane przez stronę); **nie** dodawaj drugiego pobrania `units.json`.
3. Wejście z `?i=b…` zanim spis jest wczytany: pokaż stan ładowania zamiast cofania do domyślnego; dopiero gdy spis się wczyta i wskaźnika nie ma → domyślny + poprawka adresu.
4. PRODUKT §7: wejście = granice + jednostki + **jeden** plik wskaźnika + `available.json`; **nigdy** `index.json` biblioteki.

## Zadanie
- `src/view/hooks/useIndicatorRegistry.ts`: hook ładujący `loadAvailable()` raz i zwracający `{ registry, ready }` (`buildRegistry(INDICATORS, available)`); przed wczytaniem registry = tylko główne.
- `useMainView`: `indicators` = `registry.all` (główne najpierw); wartości przez `loadAnyValues(id, { units, levels })`; `level` ograniczony przez `minLevel` i `levels` wskaźnika (`clampLevel`); `year` i `years` z danych; zmiana wskaźnika = jedno żądanie.
- Adres: `readUrlState(search, undefined, registry.byId.has)` po wczytaniu rejestru; nieznany `b…` po wczytaniu spisu → wskaźnik domyślny i `replaceState` bez złego `i`.
- Brak `available.json` (404) → `indicators` to 20 głównych, `?i=b…` → domyślny (bez błędu w konsoli).
- Jeśli plik wartości biblioteki nie istnieje → komunikat/stan „Brak danych dla tego wskaźnika” (istniejący wzorzec błędu wartości) i wskaźnik domyślny; **bez** wyjątku.

## Testy e2e (`tests/e2e/q-library-on-map.spec.ts`, `@Q`, `?e2e`, mock sieci z fixture’ami `available.json`, `values-sample.json`)
1. `/?e2e&i=b101&l=pow`: `__atlas.choropleth.indicatorId === 'b101'`, `level === 'pow'`, legenda ma 5 klas (jak w `choropleth.spec.ts`).
2. Żądania: dokładnie **jedno** żądanie pliku wartości wskaźnika i **jedno** `available.json`; **zero** żądań `index.json` biblioteki (zlicz po URL).
3. `/?i=b999999` (nie ma w spisie) → po wczytaniu `indicatorId` domyślny, adres bez `b999999`.
4. 404 na `available.json` → mapa działa na domyślnym; w konsoli brak błędów.
5. Wskaźnik tylko powiatowy (`b101`) z `?l=gmi` → poziom obniżony do `pow`.
6. Wybór miejsca na mapie dla `b101` zachowuje `?i=b101` w adresie.
7. Istniejące `main-screen.spec.ts` i `choropleth.spec.ts` zielone bez edycji.

## Gotowe, gdy
- `__atlas.choropleth.indicatorId = 'b<id>'`, legenda 5 klas; dokładnie jedno żądanie wartości; zero żądań pełnego indeksu; istniejące testy bez zmian.
Nie ruszaj: `Home.tsx`, `AtlasMap.tsx`, pozostałych `map/hooks/*`, `registry.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
