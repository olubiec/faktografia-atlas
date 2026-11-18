# QC103 – Filtr listy rankingu (szukanie po nazwie i województwo)
Cel: Funkcja zawężająca ranking do wpisanej nazwy (bez względu na polskie znaki i wielkość liter) oraz do jednego województwa.
Zmieniaj: src/core/ranking/rankings-filter.ts, tests/unit/rankings-filter.test.ts
Wymagane: tests/unit/rankings-filter.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/search/normalize.ts (`normalize`), src/core/ranking/ranking.ts, src/core/units/types.ts i units.ts (jak TERYT zdradza województwo)

## Kontekst
Na `/rankingi` jest martwe pole „Szukaj”. Filtr ma działać na już policzonym rankingu **bez zmiany miejsc** (miejsce w całej Polsce zostaje; użytkownik szuka „Łodzi” i widzi, że jest np. 14.).

## Research
Przeczytaj `normalize` – sprawdź, że zamienia „ł→l”, „ą→a” itd. (test w `tests/unit` może już istnieć). Użyj go; nie twórz drugiego normalizatora. Ustal z `units.ts`, jak z `Unit` dostać kod województwa (pierwsze 2 cyfry TERYT albo `parent`).

## Zadanie
Utwórz `src/core/ranking/rankings-filter.ts`:
- `export function filterRanking(items: RankedUnit[], opts: { q: string; w: string | null }, unitsByTeryt: Map<string, Unit>): RankedUnit[]`.
- `w` – zostaw tylko jednostki, których TERYT zaczyna się od `w` (dwie cyfry; porównuj jako string).
- `q` – po `normalize` zarówno zapytania, jak i nazwy; dopasowanie „zawiera” (podciąg); puste `q` = bez filtra; zapytanie z samych spacji = puste.
- Kolejność i pole `rank` bez zmian (zwracasz podzbiór tych samych obiektów, nie kopie z nowym `rank`).
- Wynik filtrowania nie mutuje wejścia.

## Testy
1. „lodz” znajduje „Łódź”; „LÓDŹ” też; „ł” znajduje wszystkie z „ł”.
2. `w: '12'` zostawia tylko jednostki z TERYT zaczynającym się od `12`; `w: '02'` nie myli się z `20`.
3. `q` + `w` razem = przecięcie.
4. `rank` pierwszego elementu po filtrze zachowuje wartość z pełnego rankingu (np. 14).
5. Brak trafień → `[]`; puste `q` i `w: null` → ta sama zawartość.
6. Wejście nie zostało zmienione (porównaj długość i referencję pierwszego elementu).
7. Wydajność: 2 500 jednostek filtrowane < 50 ms (jak `tests/unit/library-query-perf.test.ts` – ten sam styl pomiaru, z luzem na wolny CI).

## Gotowe, gdy
- „lodz” znajduje „Łódź”; `w=12` zostawia tylko małopolskie; test wydajności zielony.
Nie ruszaj: `normalize.ts`, `ranking.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
