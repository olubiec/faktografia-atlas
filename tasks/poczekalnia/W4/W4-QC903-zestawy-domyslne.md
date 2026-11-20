# QC903 – Zestawy domyślne dla pięciu miejsc otwarcia eksportu
Cel: Czysta funkcja `defaultDeck(entry, ctx)` buduje sensowny zestaw stron zależnie od tego, skąd otwarto okno „Pobierz i udostępnij”.
Zależy od: QC901 i QC902 (na main: `deck.ts`, `deck-page-data.ts`). Tor: **QC903 → QC904 → QC912**.
Kolizje plików: brak (oba pliki nowe). Funkcji użyje dopiero QC918 (W7), nic w widoku nie zmienia się w tym zadaniu.
Zmieniaj: src/core/share/deck-defaults.ts (nowy), tests/unit/deck-defaults.test.ts (nowy)
Wymagane: tests/unit/deck-defaults.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (`createDeck`, `numbering`, `NewPage`, `PageKind`), src/core/share/deck-page-data.ts (`seedIndicators`, `PAGE_DATA_RULES`, `isSingleIndicator`), src/core/map/main-view.ts (`DEFAULT_INDICATOR_ID` = `'density'`), src/core/my-indicators/my-indicators.ts (`BASIC_INDICATORS`), src/view/share/useShareData.ts (`initialDeck` – dzisiejszy zestaw startowy; **tylko czytasz, nie zmieniasz**), docs/PRODUKT.md §4b

## Kontekst
Dziś `initialDeck(data)` w `useShareData.ts` składa zestaw z tego, co okno ma w danych (mapa, ranking, profil, porównanie). Plan (D7) wymaga zestawów zależnych od miejsca otwarcia. To zadanie dodaje samą logikę w `src/core`; podłączenie do okna to QC918 (W7), a wizualne zastąpienie `initialDeck` – tam, nie tutaj.

Zestawy (kolejność stron):
| Miejsce | Strony |
|---|---|
| `map` | `map` · `ranking` (top) · `ranking` (bottom) · `table` (+ `profile` na końcu, gdy `hasUnit`) |
| `profile` | `profile` · `bignumber` · `trend` · `table` |
| `compare` | `compare` · `table` · `versus` |
| `rankings` | `ranking` (top) · `map` · `histogram` |
| `library` | `ranking` (top) · `histogram` |
„Ranking najniżej” to ta sama rodzaj `ranking` z `options: { side: 'bottom' }`, zaraz po „najwyżej”.

## Zadanie
`src/core/share/deck-defaults.ts` (komentarze po polsku, ≈ 60–80 linii):
- `export type ShareEntry = 'map' | 'profile' | 'compare' | 'rankings' | 'library'`.
- `export type DeckContext = { indicatorId: string | null; mine: readonly string[]; hasUnit: boolean; hasPair: boolean }`.
- `export function defaultDeck(entry: ShareEntry, ctx: DeckContext): Deck` – tabela wyżej przez `createDeck`. Wskaźniki każdej strony: `seedIndicators(kind, ctx.mine, activeId)`, gdzie `activeId = ctx.indicatorId ?? ctx.mine[0] ?? DEFAULT_INDICATOR_ID` (dzięki temu żadna strona nie dostaje `[]`; strony jednowskaźnikowe dostają dokładnie `[activeId]`).
- Reguły zastępcze (nie rzucaj; zestaw ma zawsze ≥ 1 stronę): `profile` bez `hasUnit` → zestaw `map`; `compare` bez `hasPair` → zestaw `map`; `map` bez `hasUnit` nie ma strony `profile`.

## Testy (`tests/unit/deck-defaults.test.ts`, bez sieci; wskaźniki jako stałe id, np. `BASIC_INDICATORS`)
1. `map` z `hasUnit`: rodzaje `map, ranking, ranking, table, profile`, `options.side` = `top`, `bottom` na stronach 2 i 3; bez `hasUnit`: `map, ranking, ranking, table`.
2. `profile` z `hasUnit`: `profile, bignumber, trend, table`; `compare` z `hasPair`: `compare, table, versus`.
3. `rankings`: `ranking, map, histogram`; `library`: `ranking, histogram`.
4. `compare` bez `hasPair` → rodzaje jak `map`; `profile` bez `hasUnit` → jak `map`.
5. Strony `table` (i `compare`, `profile`) dostają `mine` w tej samej kolejności, przycięte do `PAGE_DATA_RULES[kind].max`.
6. Strony jednowskaźnikowe mają dokładnie 1 wskaźnik: aktywny; przy `indicatorId: null` – pierwszy z `mine`; gdy `mine` puste – `DEFAULT_INDICATOR_ID`.
7. Dla `indicatorId: null` i `mine: []` żadna strona nie ma pustego `indicatorIds` (każda spełnia `PAGE_DATA_RULES[kind].min`), dla wszystkich 5 miejsc.
8. Każdy zestaw ma ≥ 1 stronę, id stron `p1…pN` bez powtórzeń, a `numbering(deck)` daje etykiety `1/N … N/N`.

## Gotowe, gdy
- Test każdego z 5 miejsc otwarcia w `deck-defaults.test.ts` (testy 1–3 sprawdzają dokładną kolejność rodzajów); warunki zastępcze (test 4) i wskaźnik awaryjny (testy 6–7) zielone.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
Nie ruszaj: `deck.ts`, `deck-page-data.ts`, `useShareData.ts` (jego `initialDeck` zostaje do QC918), żadnych widoków, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
