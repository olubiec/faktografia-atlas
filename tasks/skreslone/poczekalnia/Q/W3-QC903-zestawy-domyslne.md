# QC903 – Zestawy domyślne dla pięciu miejsc otwarcia eksportu
Cel: Okno „Pobierz i udostępnij” zawsze startuje z sensownym zestawem stron, zależnym od tego, skąd je otwarto.
Zmieniaj: src/core/share/deck-defaults.ts, tests/unit/deck-defaults.test.ts
Wymagane: tests/unit/deck-defaults.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (QC901), deck-page-data.ts (QC902: `seedIndicators`), docs/PRODUKT.md §4b (lista zestawów), src/view/share/useShareData.ts (skąd dziś wiadomo, co jest otwarte: mapa/profil/porównanie)

## Kontekst
Zestawy domyślne (decyzja D7):
| Miejsce | Strony (kolejność) |
|---|---|
| `map` | Mapa · Ranking najwyżej · Ranking najniżej · Tabela (+ Profil na końcu, gdy wybrano miejsce) |
| `profile` | Profil · Duża liczba · Wykres lat · Tabela |
| `compare` | Porównanie · Tabela · Duża liczba A vs B |
| `rankings` | Ranking (najwyżej) · Mapa · Rozkład |
| `library` | Ranking (najwyżej) · Rozkład |
Strona „Ranking najniżej” w zestawie `map` to ta sama rodzaj `ranking` z `options.side = 'bottom'`.

## Research
Sprawdź w `useShareData.ts`, jakie informacje są dostępne w każdym miejscu (aktywny wskaźnik, wybrane miejsce, para, lista „Moich”). Kontekst funkcji ma obejmować dokładnie to – nic więcej.

## Zadanie
`src/core/share/deck-defaults.ts`:
- `export type ShareEntry = 'map' | 'profile' | 'compare' | 'rankings' | 'library'`.
- `export type DeckContext = { indicatorId: string | null; mine: readonly string[]; hasUnit: boolean; hasPair: boolean }`.
- `export function defaultDeck(entry: ShareEntry, ctx: DeckContext): Deck` – buduje zestaw z tabeli wyżej przez `createDeck`; dla stron wielowskaźnikowych `indicatorIds = seedIndicators('table', ctx.mine, ctx.indicatorId)`, dla jednowskaźnikowych `seedIndicators(kind, …)`.
- Reguły warunkowe: `map` bez wybranego miejsca nie ma „Profilu”; `profile` bez miejsca → traktuj jak `map`; `compare` bez pary → traktuj jak `map` (nie rzucaj; zestaw zawsze ma ≥ 1 stronę).
- `indicatorId === null` i pusta `mine` → strony wielowskaźnikowe z `[]` są niedopuszczalne (min 1): w takim razie użyj `DEFAULT_INDICATOR_ID` z `core/map/main-view.ts`.

## Testy (po jednym na miejsce + warunki)
1. `map` z miejscem: 5 stron `map, ranking(top), ranking(bottom), table, profile`; bez miejsca: 4 strony.
2. `profile`: `profile, bignumber, trend, table`; `compare` z parą: `compare, table, versus`.
3. `rankings`: `ranking, map, histogram`; `library`: `ranking, histogram`.
4. `compare` bez pary → zestaw jak `map`; `profile` bez miejsca → jak `map`.
5. Strony `table` dostają 7 podstawowych (gdy `mine` = podstawowe) w tej samej kolejności.
6. Strony jednowskaźnikowe dostają dokładnie 1 wskaźnik (aktywny); przy `indicatorId: null` – pierwszy z `mine`; gdy i tego brak – domyślny wskaźnik z `main-view`.
7. Każdy zestaw ma ≥ 1 stronę; numeracja z `numbering()` jest poprawna (`1/N … N/N`).
8. Kolejność „Ranking najniżej” zaraz po „Ranking najwyżej”, `options.side` ustawione.

## Gotowe, gdy
- Test każdego z 5 miejsc otwarcia; warunki brzegowe; testy zielone.
Nie ruszaj: `deck.ts`, `deck-page-data.ts`, widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
