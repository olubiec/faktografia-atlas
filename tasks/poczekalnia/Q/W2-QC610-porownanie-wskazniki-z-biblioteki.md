# QC610 – Porównanie: dodatkowe wiersze z wskaźników biblioteki
Cel: Logika wierszy porównania dla wskaźników spoza profilu (z biblioteki), z wartościami obu miejsc i słowną różnicą.
Zmieniaj: src/core/compare/compare-extra.ts, tests/unit/compare-extra.test.ts
Wymagane: tests/unit/compare-extra.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/compare/compare.ts (`CompareRow`, `compare` – **wzór słownej różnicy**, nie zmieniaj), src/core/profile/profile.ts (`IndicatorValues`, `Indicator`), src/core/indicators/load-any-values.ts, src/core/format/, tests/unit/compare.test.ts, docs/PRODUKT.md §4a

## Kontekst
Profil miejsca zawiera 20 głównych wskaźników (jeden plik na województwo). Wskaźniki z biblioteki **nie są w profilu** (D3). Tabela Porównaj ma jednak pokazywać także te, które użytkownik dodał do „Moich” – wartości bierzemy z pliku wartości biblioteki (jedno pobranie na wskaźnik, QC604), a wiersz ma ten sam kształt co `CompareRow`.

## Research
1. Przeczytaj `compare()` i `CompareRow`: pola, jak liczona „słowna różnica” („wyżej o 1,2 p.p.”), jak traktowane brakujące wartości i `higherIsBetter`. **Użyj tej samej funkcji pomocniczej** (jeśli nie wyeksportowana, wyeksportuj minimalnie ją w `compare.ts` i dopisz `src/core/compare/compare.ts` do „Zmieniaj” – ale wtedy najpierw zatrzymaj się i opisz w PR, bo `compare.test.ts` nie może się zmienić).
2. Miejsce w rankingu (rang) dla wskaźnika z biblioteki: policz `rankUnits` na poziomie danego miejsca (jednostki tego samego poziomu).

## Zadanie
`src/core/compare/compare-extra.ts`:
- `export function compareExtraRow(indicator: Indicator, values: IndicatorValues, a: Unit, b: Unit, year?: number | null): CompareRow | null`.
  - rok: `year` albo najnowszy, dla którego **oba** miejsca mają wartość; brak wspólnego → najnowszy dla każdego osobno, a różnica „brak porównania (różne lata)”.
  - wartości i miejsca w rankingu obu miejsc, słowna różnica według zasad `compare()` (neutralnie, bez „lepiej/gorzej”, gdy `higherIsBetter === null`).
  - brak wartości dla którejś strony → wiersz z „brak danych” po tej stronie, bez wyjątku; brak dla obu → `null`.
- `export function compareExtraRows(entries: { indicator; values }[], a, b, year?): CompareRow[]` – pomija `null`.
- Czyste funkcje; bez sieci.

## Testy (`values-sample.json` + jednostki z fixture’ów)
1. Wiersz ma wartości obu miejsc i niepustą słowną różnicę.
2. Różnica słowna zgodna w stylu z `compare()` (porównaj z wynikiem `compare` dla analogicznych liczb – test pomocniczy na wskaźniku głównym).
3. `higherIsBetter: null` → brak słów „lepiej/gorzej”.
4. Brak wartości u jednej strony → „brak danych” po tej stronie.
5. Brak u obu → `null`; `compareExtraRows` ich nie zwraca.
6. Wspólny rok: A ma 2024, B tylko 2023 → rok 2023, oznaczony poprawnie.
7. Miejsce w rankingu liczone wśród jednostek tego samego poziomu (powiat nie rywalizuje z gminą).

## Gotowe, gdy
- Wiersz z wartościami obu miejsc i słowną różnicą; testy zielone; `compare.ts` i jego testy nietknięte.
Nie ruszaj: `compare.ts`, `compare.test.ts`, widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
