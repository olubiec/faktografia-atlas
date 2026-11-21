# QC604 – Jeden sposób pobierania wartości dla każdego wskaźnika (główny i z biblioteki)
Cel: Funkcja `loadAnyValues(id, units)` zwraca `IndicatorValues` w tym samym formacie niezależnie od źródła.
Zmieniaj: src/core/indicators/load-any-values.ts, tests/unit/load-any-values.test.ts
Wymagane: tests/unit/load-any-values.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/data/load-values.ts (`loadIndicatorValues`), src/core/library/load-library.ts (`loadLibraryValues`, `valuesByTeryt` – **most już istnieje**), src/core/indicators/registry.ts (`isLibraryIndicatorId`, `libraryVarId`), tests/fixtures/library/values-sample.json, tests/unit/load-values.test.ts, tests/unit/load-library.test.ts, src/core/units/types.ts

## Kontekst
Mapa, rankingi, porównanie i eksport mają pracować na `IndicatorValues { indicatorId, years, values (po TERYT), fetchedAt }`. Wskaźniki główne leżą w `public/data/values/<id>.json` (gotowy format); wskaźniki z biblioteki mają format zwarty (`l5/l6/l3: { y, d: { bdlId: [...] } }`) z kluczami BDL, które `valuesByTeryt` zamienia na TERYT na podstawie `units.json`.

## Research
1. Przeczytaj `valuesByTeryt(values, level, units)`: **bierze jeden poziom** (`pow`/`gmi`/`woj`). Wskaźnik z biblioteki bywa na kilku poziomach, a `IndicatorValues` ma jedną mapę TERYT → wartości. Skoro kody TERYT różnych poziomów się nie powtarzają (woj 2 cyfry, pow 4, gmi 7), **scal poziomy** w jedną mapę: dla każdego dostępnego w `AvailableFile.lv` poziomu wywołaj `valuesByTeryt` i połącz (lata muszą się zgadzać – jeśli różne zestawy lat, ujednolić do sumy posortowanej i wypełnić `null`).
2. Do `valuesByTeryt` potrzeba listy `Unit[]` z `bdlId` – przyjmij jako argument (nie ładuj tu `units.json`).
3. `loadLibraryValues(varId)` – sprawdź, czy ma własny cache i obsługę 404 (jedno żądanie na wskaźnik).

## Zadanie
`src/core/indicators/load-any-values.ts`:
- `export async function loadAnyValues(id: string, ctx: { units: Unit[]; levels?: UnitLevel[]; fetchImpl?: typeof fetch }): Promise<IndicatorValues | null>`:
  - `isLibraryIndicatorId(id)` → `loadLibraryValues(libraryVarId(id))` + scalanie poziomów + `indicatorId: id` (z prefiksem `b`) + `fetchedAt` z pliku lub `''`;
  - inaczej → `loadIndicatorValues(id)` bez zmian.
  - brak pliku / zły format → `null`; nie rzuca.
- Zachowuje **jedno żądanie** na wskaźnik (opieraj się na cache loaderów; nie dubluj cache).
- Funkcja `mergeLevels(parts: IndicatorValues[]): IndicatorValues` czysta, wyeksportowana i przetestowana.

## Testy
1. Wskaźnik główny → zwraca to samo co `loadIndicatorValues` (ta sama referencja lub równość głęboka).
2. Wskaźnik `b101` na `values-sample.json` + jednostki z `bdlId` (z fixture’ów geo/units) → wynik ma klucze **TERYT** (nie 12-znakowe BDL), lata `[2022,2023,2024]`, `indicatorId === 'b101'`.
3. `mergeLevels`: dwa poziomy o różnych zestawach lat → wspólna oś lat posortowana, braki jako `null`.
4. Nieznany `bdlId` w pliku jest pominięty (nie wpada do wyniku).
5. 404 → `null`; zły JSON → `null`.
6. Dwa wywołania `loadAnyValues('b101', …)` = jedno żądanie sieciowe.
7. Kształt wyniku przechodzi te same asercje co dla wskaźnika głównego: `years` rosnące, każdy wiersz `values[teryt].length === years.length`.

## Gotowe, gdy
- Test na `values-sample.json`: wynik ma kody TERYT i lata jak wskaźnik główny; jedno żądanie na wskaźnik.
Nie ruszaj: `load-library.ts`, `load-values.ts`, `registry.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
