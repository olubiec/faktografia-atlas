# QC902 – Dane strony zestawu: lista wskaźników, dodaj/usuń/zmień
Cel: Czysta logika „Dane na tej stronie”: które wskaźniki ma strona i jakie reguły obowiązują dla danego rodzaju strony.
Zmieniaj: src/core/share/deck-page-data.ts, tests/unit/deck-page-data.test.ts
Wymagane: tests/unit/deck-page-data.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (QC901: `PageKind`, `DeckPage`), docs/PRODUKT.md §4b, §4f, src/core/my-indicators/my-indicators.ts

## Kontekst
Właściciel: „czy dodanie innych danych, czy podzielenie danych z pierwszej strony”. Każda strona ma listę wskaźników: tabela i profil mają ich wiele (domyślnie z „Moich wskaźników”), a mapa, ranking, duża liczba, wykres lat i rozkład – dokładnie jeden. Ten moduł zna reguły i pilnuje ich.

## Zadanie
`src/core/share/deck-page-data.ts`:
- `export const PAGE_DATA_RULES: Record<PageKind, { min: number; max: number }>`: `map/ranking/bignumber/trend/histogram/versus` → `{1,1}`; `table` → `{1, 20}`; `profile` → `{1, 20}`; `compare` → `{1, 20}`.
- `isSingleIndicator(kind): boolean` (`max === 1`).
- `addIndicatorToPage(page, id): DeckPage` – dopisuje na końcu; duplikat → ta sama referencja; strona jednowskaźnikowa **nie przyjmuje dodania** (zwraca ta sama referencja – dla niej służy `replaceIndicator`); powyżej `max` → bez zmian.
- `removeIndicatorFromPage(page, id): DeckPage` – nie zejdzie poniżej `min` (ostatniego wskaźnika **nie usuwa**; ta sama referencja).
- `replaceIndicator(page, id): DeckPage` – ustawia jedyny wskaźnik strony jednowskaźnikowej (dla wielowskaźnikowej: zamienia pierwszy? – **nie**: zwraca ta sama referencja; zmiana dotyczy tylko stron jednowskaźnikowych).
- `seedIndicators(kind, mine: readonly string[], activeId: string | null): string[]` – domyślne wskaźniki nowej strony: wielowskaźnikowa → kopia `mine` (≤ max; gdy pusta → `[activeId]` jeśli jest); jednowskaźnikowa → `activeId` lub pierwszy z `mine` (gdy żaden → `[]`).
- `canAddData(page): boolean` / `canRemoveData(page): boolean` – dla przycisków w QC915.

## Testy
1. Mapa przyjmuje dokładnie jeden wskaźnik: `addIndicatorToPage(map, 'x')` zwraca tę samą referencję; `replaceIndicator(map,'x')` ustawia `['x']`.
2. Tabela: dodaj → dopisane na końcu; dodaj to samo → ta sama referencja; 21. wskaźnik nie wchodzi.
3. `removeIndicatorFromPage` ostatniego wskaźnika tabeli → ta sama referencja (min 1).
4. `seedIndicators('table', mine7, 'density')` = 7 wskaźników; `seedIndicators('bignumber', mine7, 'density')` = `['density']`; z pustą `mine` i `activeId` → `[activeId]`.
5. `seedIndicators('map', [], null)` → `[]`.
6. `canAddData`/`canRemoveData` zgodne z regułami dla każdego z 9 rodzajów (tabela w teście).
7. Niemutowalność wejścia.
8. Wskaźnik z biblioteki (`b101`) przechodzi jak każdy inny string.

## Gotowe, gdy
- Testy operacji zielone; strona „Mapa” przyjmuje dokładnie jeden wskaźnik.
Nie ruszaj: `deck.ts`, widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
