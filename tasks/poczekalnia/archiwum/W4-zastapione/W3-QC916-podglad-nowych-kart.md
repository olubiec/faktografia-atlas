# QC916 – Złożenie sceny z dowolnej strony zestawu i podgląd 9 rodzajów kart
Cel: Jedna funkcja zamienia stronę zestawu na scenę karty (dla wszystkich 9 rodzajów), a komponent podglądu ją rysuje.
Zmieniaj: src/core/share/card.ts, src/core/share/deck-scene.ts, src/view/share/CardSvg.tsx, tests/unit/card-svg-kinds.test.tsx
Wymagane: tests/unit/card-svg-kinds.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card.ts (`cardScene`, `CardKind`, `CardData`), card-{map,ranking,profile,compare,table,bignumber,trend,histogram,versus}.ts (QC906–QC910), src/core/share/deck.ts, src/view/share/CardSvg.tsx, src/view/share/useShareData.ts (jak dziś powstają `MapCardData` itd.), tests/unit/card*.test.ts i share*.test.tsx (**istniejące – nie zmieniaj**), AGENTS.md (pliki do ~200 linii)

## Kontekst
`cardScene` zna 4 rodzaje (map, ranking, profile, compare). Dochodzi 5 nowych (table, bignumber, trend, histogram, versus), a „Ranking najwyżej/najniżej” to wariant rankingu. Trzeba je złożyć w jednym miejscu i dać numer „n/N”. **Wszystkie istniejące testy kart muszą pozostać zielone bez zmian.**

## Research
1. `card.ts` ma 96 linii: rozszerzenie `cardScene` o 5 gałęzi `else if` zmieści się w ~200 linii, ale **sprawdź**; jeśli się nie mieści – wydziel tytuły i dispatch do `deck-scene.ts` (czyli `cardScene` zostaje, a `deck-scene.ts` je woła).
2. Każdy nowy `render…Content` ma tę samą sygnaturę argumentu co `renderRankingContent` (QC906–QC910) – to umożliwia prosty dispatch.
3. Kolejność prac: (a) rozszerz `CardKind`/`CardData`/tytuły i dispatch w `card.ts`; (b) `deck-scene.ts` buduje `CardData` z danych strony; (c) `CardSvg` tylko rysuje scenę (już to robi) – zmiana może ograniczyć się do obsługi ewentualnych nowych typów elementów (nie powinno być).

## Zadanie
- `card.ts`: `CardKind` += `'table'|'bignumber'|'trend'|'histogram'|'versus'`; tytuły: table → „<Miejsce> – wskaźniki”, bignumber → nazwa wskaźnika, trend → „<Wskaźnik> – <Miejsce>, lata”, histogram → „<Wskaźnik> – rozkład”, versus → „<A> i <B>: <Wskaźnik>”; dispatch do `render…Content`. Przekazanie `options.pageLabel` do stopki (QC905) – już jest.
- `src/core/share/deck-scene.ts`: `export function pageScene(page: DeckPage, label: string, ctx: PageSceneContext, format: ShareFormatKey, theme: CardTheme, measure: MeasureFn): CardScene | null` – z `ctx` (wartości wskaźników, nazwy, jednostki, wybrane miejsca, pary, formatery) buduje odpowiednie `…CardData` i woła `cardScene(kind, data, …, { measure, pageLabel: label })`. `null`, gdy brak wymaganych danych (np. `profile` bez miejsca) – UI pokaże „Brak danych dla tej strony”.
- `CardSvg.tsx`: bez zmian logiki rysowania; jeśli trzeba – drobna poprawka obsługi nowego elementu.
- Dla wskaźników z biblioteki **wartości jak dla głównych** (z `values` w `ctx`), `higherIsBetter: null`.

## Testy (`tests/unit/card-svg-kinds.test.tsx`)
1. Każdy z 9 rodzajów (`map, ranking(top), ranking(bottom), table, bignumber, trend, histogram, profile, compare, versus` – 10 przypadków) → `pageScene` zwraca scenę, a `CardSvg` renderuje bez błędu (`container.querySelector('svg')`).
2. Scena z `label='3/5'` zawiera „3/5”; z `label=''` – nie.
3. `profile` bez miejsca / `compare` bez pary → `pageScene` zwraca `null`.
4. Każda scena mieści wszystkie elementy w obrębie `width×height` w 4 formatach.
5. Tytuł strony `table` zawiera nazwę miejsca; `versus` – obie nazwy.
6. Wskaźnik `b101` w `table`/`bignumber` działa (wartości z `ctx.values`).
7. **Istniejące** testy kart uruchomione i zielone bez zmian; `card.ts` ≤ 200 linii (test czyta plik) – albo wydzielone do `deck-scene.ts`.

## Gotowe, gdy
- Każdy z rodzajów renderuje się bez błędu; istniejące testy kart bez zmian.
Nie ruszaj: `card-map.ts`, `card-ranking.ts`, `card-profile.ts`, `card-compare.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
