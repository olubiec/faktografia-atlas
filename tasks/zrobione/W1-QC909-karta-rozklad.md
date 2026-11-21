# QC909 – Karta „Rozkład” (ile jednostek w każdej z 5 klas kolorystycznych)
Cel: Histogram: ile jednostek poziomu trafia do każdej klasy legendy mapy + „brak danych”, z zaznaczeniem klasy wybranego miejsca.
Zmieniaj: src/core/share/card-histogram.ts, tests/unit/card-histogram.test.ts
Wymagane: tests/unit/card-histogram.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/map/classes.ts (`computeBreaks`, `classify`, `classColorToken`, `ClassifyResult`), src/core/legend/ (jak legenda opisuje przedziały), src/core/share/card-map.ts (jak karta mapy używa klas i legendy), config/tokens.json (`data.sequential`, `data.noData`), tests/unit/classes.test.ts, docs/PRODUKT.md §4b, §3 (legenda 5 klas)

## Kontekst
Strona „Rozkład” pokazuje, jak wartości wskaźnika rozkładają się w kraju: 5 słupków w kolorach legendy mapy (te same klasy co na mapie – `computeBreaks`/`classify`), szósty „brak danych”. Liczba jednostek nad słupkiem, przedział pod słupkiem. Wybrane miejsce: słupek jego klasy wyróżniony obrysem w `korekta` (**jedno** zakreślenie).

## Research
1. Użyj **tych samych** funkcji klasyfikacji co mapa; nie liczysz progów drugi raz. Zobacz, jak `card-map.ts` je woła (parametry: metoda `quantile`/`equal`, schemat `sequential`/`diverging` zależny od wskaźnika).
2. Kolory słupków: `tokens.data.sequential[theme]` (tablica 5 kolorów) i `tokens.data.noData[theme]`; dla schematu rozbieżnego – sprawdź w `classColorToken`.
3. Etykiety przedziałów: użyj formatowania liczb jak legenda (`src/core/format`).

## Zadanie
`src/core/share/card-histogram.ts`:
- `export type HistogramCardData = { indicator: { name: string; unit?: string }; year: number; levelName: string; values: (number | null)[]; selectedValue?: number | null; breaks?: number[] /* opcjonalnie gotowe */ ; method?: 'quantile'|'equal'; scheme?: 'sequential'|'diverging'; formatValue?: (n: number) => string }`.
- `export function histogramCounts(values, breaks | method, scheme): { counts: number[]; noData: number; breaks: number[] }` – **czysta funkcja eksportowana** (testowana osobno).
- `export function renderHistogramContent(args)` – ta sama sygnatura co `renderRankingContent`.
- 6 słupków (5 klas + „brak danych”), wysokość proporcjonalna do liczby (maks. = pełna wysokość), liczba nad słupkiem, etykieta przedziału pod (`od – do`), słupek klasy `selectedValue` obrysowany w `korekta` (jeden `RectItem` z `stroke`).

## Testy
1. **Suma słupków (5 klas + brak danych) = liczba wszystkich jednostek wejścia** (`values.length`), dla `quantile` i `equal`.
2. `null` i `NaN` trafiają do „brak danych”.
3. Klasyfikacja zgodna z mapą: dla 20 wartości `histogramCounts` daje te same przypisania co `classify` wywołane bezpośrednio.
4. Słupek klasy wybranego miejsca ma obrys `korekta`; pozostałe nie; brak `selectedValue` → brak obrysu.
5. Tylko pusta lista → brak wyjątku, same zera.
6. Wszystkie elementy mieszczą się w obszarze treści w 4 formatach; etykiety przedziałów nie nachodzą na siebie (porównaj `x`+szerokość sąsiadów, `post` i `wide`).
7. Kolory słupków = `tokens.data.sequential[theme][i]`; „brak danych” = `tokens.data.noData[theme]`.
8. Wszystkie wartości równe (zerowa rozpiętość) – nie dzieli przez zero; wszystkie w jednej klasie.

## Gotowe, gdy
- Suma słupków = liczba jednostek poziomu; testy zielone.
Nie ruszaj: `classes.ts`, `card-map.ts`, `card.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
