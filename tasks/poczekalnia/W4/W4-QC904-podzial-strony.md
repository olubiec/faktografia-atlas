# QC904 – Podział strony zestawu (tabela, profil, porównanie) na kilka stron
Cel: „Podziel tę stronę” rozbija za długą stronę zestawu na kilka stron tego samego rodzaju, żeby wiersze mieściły się na karcie.
Zależy od: QC901 (`deck.ts` – na main), QC903 (kolejność w torze; plik `deck-defaults.ts` nie jest tu importowany). Tor: QC903 → **QC904** → QC912.
Kolizje plików: brak (oba pliki nowe). Funkcji użyje QC912 (`useDeck`), a przycisk „Podziel” w oknie podłącza QC917.
Zmieniaj: src/core/share/deck-split.ts (nowy), tests/unit/deck-split.test.ts (nowy)
Wymagane: tests/unit/deck-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (`Deck`, `DeckPage`, `numbering`, `pageIndex`; `options.part/parts` już istnieją w typie), src/core/share/deck-page-data.ts (`PAGE_DATA_RULES`), src/core/share/formats.ts (`ShareFormatKey`, `SHARE_FORMATS`), src/core/share/card-table.ts (`renderTableContent`: tnie listę i dopisuje „… jeszcze N wskaźników”, gdy się nie mieści), tests/unit/card-table.test.ts (jego pomocnik `render` – wzór do testu limitów), src/view/share/AddPageMenu.tsx (przyjmuje już `splitHint` i `canSplitCurrent`), docs/PRODUKT.md §4b

## Kontekst
Właściciel: „podzielenie danych z pierwszej strony”. Limity zależą od formatu karty (Story wyższe, Wide niższe). Podział działa na **modelu** (bez rysowania): z jednej strony powstaje kilka stron, każda ze swoją porcją wskaźników. Model nie ma strony rankingu „oba” (jest `side: 'top' | 'bottom'`), więc ranking się nie dzieli – „najwyżej/najniżej” to dwie osobne strony dodawane z menu.

## Research (wynik wpisz w komentarz nad stałymi)
Limity wierszy tabeli: **Post 8, Story 10** (z planu), **Square 6, Wide 5** (propozycja). Uzasadnia je test 8: dla każdego formatu `renderTableContent` z tylu wierszami o najdłuższej nazwie (`LONGEST` z `card-table.test.ts`) nie dopisuje „… jeszcze”. Gdy Square lub Wide nie przejdzie, **zmniejsz ich limit** (nie Postu/Story) i opisz w PR; gdy nie przejdzie Post lub Story – zatrzymaj się i opisz w PR.

## Zadanie
`src/core/share/deck-split.ts` (≈ 70–90 linii, komentarze po polsku):
- `export const TABLE_ROW_LIMIT: Record<ShareFormatKey, number>`; `export const PROFILE_ROW_LIMIT = 5`.
- `limitFor(page, format)` (wewnętrzna): `table` i `compare` → `TABLE_ROW_LIMIT[format]`; `profile` → `PROFILE_ROW_LIMIT`; reszta → `null`.
- `export function canSplit(page: DeckPage, format: ShareFormatKey): boolean` – `limitFor != null && indicatorIds.length > limit`. `map`, `ranking`, `bignumber`, `trend`, `histogram`, `versus` → `false`.
- `export function splitPage(deck: Deck, pageId: string, format: ShareFormatKey): Deck` – zastępuje stronę kolejnymi **tego samego rodzaju**, po `limit` wskaźników (ostatnia dostaje resztę), z `options.part`/`parts` (np. 1/3); kolejność wskaźników i pozycja w zestawie zachowane; nowe id jak w `addPage` z `deck.ts` (największy numer + 1, pierwsza część zachowuje id oryginału); gdy `!canSplit` albo brak strony → ta sama referencja decku.
- `export function splitHint(page: DeckPage, format: ShareFormatKey): string | null` – np. „Ta strona ma 10 wskaźników – podziel ją na 2 strony”; `null`, gdy `!canSplit`. Liczba stron = `Math.ceil(n / limit)`.
- Nie zmieniaj `deck.ts`; potrzebne id twórz lokalnie wg tej samej reguły (jeśli wygodniej, użyj `addPage` z `deck.ts` w pętli).

## Testy (`tests/unit/deck-split.test.ts`)
1. Tabela 10 wierszy w `post` → 2 strony (8 + 2); zestaw 4 stron → 5 stron, `numbering` daje `1/5 … 5/5`.
2. Tabela 10 wierszy w `story` → `canSplit === false`, `splitPage` zwraca tę samą referencję.
3. Tabela 25 wierszy w `post` → 4 strony (8, 8, 8, 1).
4. Profil z 12 wskaźnikami → 3 strony (5, 5, 2); `compare` dzieli się jak tabela.
5. `map`, `ranking`, `bignumber`, `trend`, `histogram`, `versus`: `canSplit === false`, `splitPage` zwraca tę samą referencję.
6. Suma i kolejność wskaźników zachowane (spłaszczone listy przed i po są równe, bez duplikatów).
7. `options.part/parts` poprawne (`1/2`, `2/2`), a `side` strony źródłowej nie ginie.
8. Limity 4 formatów mieszczą się w obszarze treści (wzór z Research, dla `TABLE_ROW_LIMIT[fmt]` wierszy – brak tekstu „… jeszcze”).
9. `splitHint` zwraca polski tekst z liczbami (10 wskaźników, 2 strony); `null`, gdy nie ma co dzielić.
10. Strona w środku zestawu: nowe strony wchodzą dokładnie w jej miejsce, pozostałe strony bez zmian (te same referencje obiektów).

## Gotowe, gdy
- Tabela 10 wierszy w Post → 2 strony (8 + 2), numeracja przeliczona (test 1); Story nie dzieli (test 2); limity mieszczą się w karcie (test 8); wszystkie testy zielone.
Nie ruszaj: `deck.ts`, `card-table.ts`, `deck-page-data.ts`, widoków (przycisk „Podziel” w `AddPageMenu`/oknie podłącza QC917), istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
