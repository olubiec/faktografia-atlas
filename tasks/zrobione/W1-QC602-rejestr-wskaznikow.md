# QC602 – Wspólny rejestr wskaźników (20 głównych + pobrane z biblioteki)
Cel: Jedno miejsce, które zna wszystkie wskaźniki z danymi (główne i z biblioteki) w kształcie `Indicator`.
Zmieniaj: src/core/indicators/registry.ts, tests/unit/indicator-registry.test.ts
Wymagane: tests/unit/indicator-registry.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4d, tests/fixtures/library/available.json (format spisu pobranych – **ustalony w C0**), config/indicators.json, src/core/profile/profile.ts (`Indicator`), src/core/units/types.ts

## Format `available.json` (ustalony)
`{"version":1,"generatedAt":"…","variables":[{"id":"101","n":"Liczba ludności ogółem","u":"osoba","s":"11","c":"Ludność > Struktura ludności","lv":["pow"],"y":[2022,2023,2024]}]}` – `lv` to poziomy z danymi (`woj|pow|gmi`), `y` lata, `c` ścieżka działu, `u` jednostka (tekst).

## Kontekst
Decyzja D3: wskaźniki z biblioteki działają jak główne. Reszta kodu pracuje na typie `Indicator`, więc rejestr konwertuje wpis `available.json` na `Indicator` o id `b<id>` (prefiks `b`, żeby nie kolidował z id głównych i żeby adres `?i=b60614` był jednoznaczny).

## Research
1. `Indicator.minLevel` to **najmniejsza jednostka, na której wskaźnik ma dane** (`gmi` = gminy i wyższe, `pow` = powiaty i wyższe, `woj`). Ustal z `lv`: zawiera `gmi` → `gmi`; w przeciwnym razie zawiera `pow` → `pow`; inaczej `woj`. Sprawdź w `src/core/map/main-view.ts` (`clampLevel`), że tak to jest interpretowane.
2. `higherIsBetter` dla biblioteki = `null` (nie oceniamy dobry/zły).
3. `bdlVarId` = `Number(id)`; `description` = `c` (ścieżka działu); `group` = pierwszy człon `c` przed „ > ” (nazwa działu głównego) – np. „Ludność”; ta sama nazwa grupy co dla głównych jest dopuszczalna.

## Zadanie
`src/core/indicators/registry.ts`:
- `export const LIBRARY_ID_PREFIX = 'b'`; `libraryIndicatorId(varId: string|number): string`; `isLibraryIndicatorId(id): boolean` (`/^b\d+$/`); `libraryVarId(id): string | null`.
- `export type AvailableVariable = { id: string; n: string; u: string; s?: string; c?: string; lv: ('woj'|'pow'|'gmi')[]; y: number[] }` i `AvailableFile`.
- `export function buildRegistry(main: Indicator[], available: AvailableFile | null): { all: Indicator[]; byId: Map<string, Indicator>; library: Indicator[]; years: Map<string, number[]>; levels: Map<string, UnitLevel[]> }`.
  - kolejność: główne (jak w configu), potem biblioteka (po `n`, `localeCompare('pl')`);
  - wpis biblioteki o nazwie identycznej (po `normalize`) z istniejącym głównym **nie jest** pomijany (to inny wskaźnik GUS), ale dostaje w `description` dopisek „(z biblioteki GUS)”; duplikat **id** pomijany;
  - `available == null` → tylko główne (bez błędu);
  - uszkodzone wpisy (brak `id`/`n`, `lv` puste) pomijane.
- Funkcje czyste, bez sieci.

## Testy (fixture `tests/fixtures/library/available.json`)
1. 20 głównych + 5 z biblioteki = **25** pozycji; `byId.get('b101')` istnieje.
2. Wskaźnik tylko powiatowy (101, `lv:['pow']`) ma `minLevel: 'pow'`; 102 (`gmi`) → `gmi`; 202 (`pow`,`gmi`) → `gmi`.
3. `higherIsBetter === null` dla wszystkich z biblioteki; `bdlVarId === 101`.
4. Brak duplikatów id; kolejność: najpierw 20 głównych.
5. `buildRegistry(main, null)` → 20.
6. Uszkodzony wpis (bez `n`) pominięty, reszta zostaje.
7. `isLibraryIndicatorId('b101') === true`, `'population'`, `'b'`, `'b1x'` → false; `libraryVarId('b101') === '101'`.
8. `years.get('b101')` = `[2022,2023,2024]`; `levels.get('b202')` = `['pow','gmi']`.

## Gotowe, gdy
- Test na fixture: 25 pozycji, wskaźnik tylko powiatowy ma `minLevel: 'pow'`, brak duplikatów id; testy zielone.
Nie ruszaj: `config/indicators.json`, `core/profile/profile.ts`, `core/library/*` (tylko import typów).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
