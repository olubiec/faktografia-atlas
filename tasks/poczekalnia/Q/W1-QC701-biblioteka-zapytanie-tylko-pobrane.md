# QC701 – Zapytanie biblioteki zawsze tylko z danymi + liczniki (m z n)
Cel: Logika listy biblioteki pokazuje wyłącznie wskaźniki z pobranymi wartościami i zwraca dwa liczniki do napisu „m z n”.
Zmieniaj: src/core/library/query.ts, tests/unit/library-only-fetched.test.ts
Wymagane: tests/unit/library-only-fetched.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/library/query.ts (`filterVars`, `countByCategory`, `childCategories`, `emptyQuery`, pole `onlyReady`, `has`/`hasReady`), tests/unit/library-query.test.ts, tests/unit/library-query-perf.test.ts, tests/fixtures/library/index.json, docs/PRODUKT.md §4d

## Kontekst
Decyzja D5: niepobrane wskaźniki są ukryte. Dziś filtr „tylko pobrane” (`onlyReady`) jest opcją, domyślnie wyłączoną – lista pokazuje 63 960 zmiennych, a wartości ma ok. 101. **Istniejące testy `library-query*.test.ts` nie mogą się zmienić ani paść** (łamanie zasady AGENTS.md). Dlatego nie zmieniasz domyślnego zachowania istniejących funkcji, tylko **dodajesz nowe**, których użyje ekran w QC702.

## Research
1. Zobacz, jak `filterVars` interpretuje `onlyReady` i `has`. Fixture ma `has: 1` dla 6 zmiennych z 12.
2. Sprawdź, jak liczone są `countByCategory`/`childCategories` – nowe wersje „tylko z danymi” mają liczyć **tylko pobrane** (licznik kafelka = liczba pobranych w dziale).

## Zadanie
Dodaj w `query.ts` (bez zmiany istniejących eksportów):
- `export function filterFetched(index: LibraryIndex, query: LibraryQuery): LibraryVariable[]` = `filterVars(index, { ...query, onlyReady: true })`.
- `export function libraryCounts(index: LibraryIndex): { fetched: number; total: number }` – `fetched` = liczba zmiennych z danymi, `total` = wszystkie w spisie.
- `export function countFetchedByCategory(index: LibraryIndex): Map<string, number>` – licznik pobranych w dziale **łącznie z potomkami**.
- `export function childCategoriesWithData(index, parent: string | null): LibraryCategory[]` – tylko działy, które mają ≥ 1 pobrany wskaźnik (bezpośrednio lub w potomkach).
- Wszystko zachowuje wydajność (cache `WeakMap` jak istniejące; test czasu jak w `library-query-perf`).

## Testy (`tests/unit/library-only-fetched.test.ts`, fixture `index.json`)
1. `filterFetched` z pustym zapytaniem zwraca dokładnie 6 zmiennych i **każda ma `has` prawdziwe**.
2. `libraryCounts` → `{ fetched: 6, total: 12 }`.
3. Dział bez pobranych (zbuduj wariant fixture’a w teście, usuwając `has` z jednego działu) nie występuje w `childCategoriesWithData`.
4. `countFetchedByCategory` – dział nadrzędny „Ludność” = suma pobranych potomków (policz ręcznie).
5. Wyszukiwanie tekstowe `text: 'bezrob'` nie zwraca niepobranej „Stopa bezrobocia” (`has: 0`).
6. Filtr poziomu 5/6 działa razem z `filterFetched`.
7. Istniejące eksporty (`filterVars`, `emptyQuery`) zachowują dotychczasowe wyniki – test porównawczy na `emptyQuery()` (`onlyReady:false` → 12 wyników).
8. Wydajność: 64 000 syntetycznych zmiennych (wygeneruj w teście) → `filterFetched` < 200 ms.

## Gotowe, gdy
- Żaden wynik nie ma pustych wartości; liczniki zgodne z danymi testowymi; istniejące testy biblioteki zielone bez zmian.
Nie ruszaj: istniejących funkcji i testów biblioteki, `src/view/*`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
