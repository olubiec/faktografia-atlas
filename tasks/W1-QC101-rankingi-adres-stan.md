# QC101 – Stan rankingu zapisany w adresie (`?i=&l=&y=&w=&q=`)
Cel: Czysta logika odczytu i zapisu stanu strony Rankingi z/do adresu URL, żeby każdy ranking dało się skopiować jako link.
Zmieniaj: src/core/ranking/rankings-url.ts, tests/unit/rankings-url.test.ts
Wymagane: tests/unit/rankings-url.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4e i §4b, src/core/url/state.ts (wzorzec odczytu/zapisu), src/core/map/main-view.ts (`DEFAULT_INDICATOR_ID`, `DEFAULT_LEVEL`, `clampLevel`, `resolveYear`), src/core/ranking/ranking.ts, src/core/units/types.ts

## Kontekst
Strona `/rankingi` (`src/view/pages/Rankings.tsx`) to dziś atrapa bez stanu. Zanim powstanie ekran (QC104–QC106), potrzebujemy jednego, przetestowanego miejsca, które zamienia adres w stan i z powrotem. Mapa ma już swój odczyt (`readUrlState` w `src/core/url/state.ts`) – NIE zmieniaj go; ranking dostaje własny moduł, bo ma inne parametry (`w`, `q`).

## Research (10 min, bez nowych pakietów)
1. Zajrzyj do `docs/INSPIRACJE.md`: jest wpis `nuqs` (zweryfikowany, MIT) do stanu filtrów w adresie. Ocena: dla 5 parametrów własny moduł ~60 linii jest prostszy i testowalny w Vitest bez React Router. **Nie dodawaj pakietu.** Jedno zdanie w opisie PR: dlaczego nie nuqs.
2. Sprawdź, jak `readUrlState` radzi sobie z nieznanym wskaźnikiem (ignoruje) – ranking ma robić to samo.

## Zadanie
Utwórz `src/core/ranking/rankings-url.ts` (czysty TS, zero React, zero `window`):
- `export type RankingsState = { i: string; l: UnitLevel; y: number | null; w: string | null; q: string }`.
- `export const RANKINGS_DEFAULTS: RankingsState` – `i = DEFAULT_INDICATOR_ID`, `l = DEFAULT_LEVEL`, `y = null` (= najnowszy), `w = null` (cała Polska), `q = ''`.
- `export function readRankingsState(search: string, isKnownIndicator: (id: string) => boolean = defaultKnown): RankingsState`:
  - `i` – przyjmij, gdy `isKnownIndicator(i)`; inaczej domyślny. `defaultKnown` sprawdza zbiór id z `config/indicators.json` (import jak w `state.ts`). Parametr jest funkcją, bo w QC609 dojdą wskaźniki `b<id>` z biblioteki.
  - `l` – tylko `woj|pow|gmi`, inaczej domyślny.
  - `y` – liczba całkowita 1900–2100, inaczej `null`.
  - `w` – dokładnie 2 cyfry (kod województwa TERYT jako **string**, np. `"12"`), inaczej `null`.
  - `q` – tekst, `trim()`, maks. 60 znaków (ucięty), inaczej `''`.
  - Nieznane parametry (`?foo=1`) ignoruj – nie trafiają do stanu.
- `export function writeRankingsSearch(state: RankingsState): string` – zwraca np. `?i=density&l=gmi&w=12` (z `?`), **tylko wartości różne od domyślnych**, w stałej kolejności `i, l, y, w, q`; przy samych domyślnych zwraca `''`. Używaj `URLSearchParams` (poprawne kodowanie polskich znaków w `q`).
- `export function applyRankingsChange(prev: RankingsState, patch: Partial<RankingsState>): RankingsState` – zmiana `i` lub `l` zeruje `y` (rok z poprzedniego wskaźnika może nie istnieć) i `w` przy zmianie `l` na `woj`; zmiana `q` nie rusza reszty.

## Testy (`tests/unit/rankings-url.test.ts`)
1. Okrągłość: dla 6 różnych stanów `readRankingsState(writeRankingsSearch(s))` równa się `s`.
2. Pusty adres → `RANKINGS_DEFAULTS`; `writeRankingsSearch(RANKINGS_DEFAULTS) === ''`.
3. `?i=nie-ma-takiego` → wskaźnik domyślny; `?l=xyz` → poziom domyślny; `?y=abc` i `?y=99999` → `null`; `?w=1` i `?w=ab` → `null`.
4. `?q=%C5%81%C3%B3d%C5%BA` → `q === 'Łódź'`; zapis tego stanu daje to samo kodowanie.
5. `?foo=1&i=density` → tylko wskaźnik, brak śladu `foo`.
6. `isKnownIndicator` podane jako własna funkcja: `b60614` przechodzi, gdy funkcja je akceptuje.
7. `applyRankingsChange`: zmiana `i` zeruje `y`; zmiana `q` zachowuje `y`.
8. Kod TERYT `w` zachowuje wiodące zero (`"02"`), nigdy nie jest liczbą.

## Gotowe, gdy
- Wszystkie 8 grup testów zielone; lint, typecheck i build przechodzą.
- Plik ≤ 120 linii, komentarze po polsku, bez `any`.
Nie ruszaj: `src/core/url/state.ts`, `src/view/pages/Rankings.tsx`, `config/*`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
