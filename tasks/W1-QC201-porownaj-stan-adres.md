# QC201 – Stan porównania w adresie (`?c=a,b`) i operacje na parze
Cel: Czysta logika pary porównywanych miejsc: odczyt/zapis `?c=`, ustaw A/B, zamień, wyczyść, flaga „różne poziomy”.
Zmieniaj: src/core/compare/compare-url.ts, tests/unit/compare-url.test.ts
Wymagane: tests/unit/compare-url.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4a, src/core/compare/compare.ts, src/core/url/state.ts (pole `c`), src/view/pages/ComparePage.tsx (`setComparison`, 6 stałych par), src/core/units/units.ts (`getUnit`)

## Kontekst
Porównaj dziś ma 6 gotowych par i nie pozwala wybrać miejsca. Zanim powstanie ekran z polami (QC202, QC203), potrzebujemy modelu pary. Link `?c=<teryt>,<teryt>` już istnieje w PRODUKT §4a – zachowujemy format.

## Research
Sprawdź w `state.ts`, jak dziś parsowane jest `c` (jeden string „a,b”). Nowy moduł ma być zgodny wstecznie: `?c=1261,0264` zostaje poprawny. Sprawdź, czy testy `tests/unit/url-state*.test.ts` coś zakładają o `c` – nie zmieniaj ich.

## Zadanie
Utwórz `src/core/compare/compare-url.ts`:
- `export type ComparePair = { a: string | null; b: string | null }` (TERYT jako string).
- `readComparePair(search: string, index?: UnitIndex): ComparePair` – `?c=a,b`; `?c=14` = tylko A; `?c=,14` = tylko B; więcej niż 2 elementy → pierwsze 2; z `index` nieznany TERYT → `null` (jak `readUrlState`); ten sam kod dwa razy (`?c=14,14`) → `b = null`.
- `writeCompareSearch(pair: ComparePair): string` – `''` gdy oba `null`; `?c=a` gdy tylko A; `?c=a,b` gdy oba; `?c=,b` gdy tylko B.
- `setA(pair, teryt)`, `setB(pair, teryt)` – ustaw; jeśli ustawiane miejsce jest już po drugiej stronie, zamień (nie dopuszczaj duplikatu).
- `swapPair(pair)` – zamiana A↔B.
- `clearSlot(pair, 'a' | 'b')`.
- `levelsDiffer(pair, index: UnitIndex): boolean` – `true`, gdy oba są ustawione i mają różny poziom (np. powiat vs gmina); wynik napędza dopisek „różne poziomy – porównuj ostrożnie”.

## Testy
1. Odczyt/zapis okrągły dla: oba, tylko A, tylko B, żadne.
2. `?c=14` → `{a:'14', b:null}`; `?c=,14` → `{a:null,b:'14'}`; `?c=1,2,3` → `{a:'1',b:'2'}`.
3. Duplikat: `?c=14,14` → `b` null; `setA(pair, pair.b)` zamienia zamiast duplikować.
4. `swapPair` dwa razy = identyczność.
5. `clearSlot` zeruje tylko wskazane miejsce.
6. `levelsDiffer` na `tests/fixtures` (znajdź powiat i gminę w istniejących fixture’ach jednostek): powiat+gmina → true; dwa powiaty → false; jedno puste → false.
7. TERYT z wiodącym zerem zostaje stringiem.

## Gotowe, gdy
- Testy każdej operacji zielone; `?c=14` = tylko A.
Nie ruszaj: `compare.ts`, `state.ts`, `ComparePage.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
