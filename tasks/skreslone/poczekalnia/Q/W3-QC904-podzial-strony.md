# QC904 – Podział strony zestawu (tabela, ranking, profil) na kilka stron
Cel: „Podziel tę stronę” rozbija zbyt długą stronę na kilka kart tak, żeby napisy się mieściły.
Zmieniaj: src/core/share/deck-split.ts, tests/unit/deck-split.test.ts
Wymagane: tests/unit/deck-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (QC901), deck-page-data.ts (QC902), formats.ts (`ShareFormatKey`), card-table.ts (QC906: jak wiersze mieszczą się w obszarze), docs/PRODUKT.md §4b (profil: 5 wskaźników na karcie)

## Kontekst
Właściciel: „podzielenie danych z pierwszej strony”. Limity treści zależą od formatu karty (`post`, `square`, `story`, `wide`), bo Story jest wyższe, a Poziomy niższe. Podział działa na **modelu** (bez rysowania): z jednej strony powstaje kilka stron, każda ze swoją porcją wskaźników.

## Research
1. Limity wierszy tabeli: **Post 8, Story 10** (z planu). Dla **Square** i **Wide** zaproponuj wartości na podstawie wysokości obszaru treści i wysokości wiersza z QC906 (np. Square 6, Wide 5) – **uzasadnij je testem**, który sprawdza, że wiersze o tej liczbie mieszczą się w obszarze treści danego formatu (policz z `SHARE_FORMATS` i stałych układu z `card-table.ts`; jeśli nie da się wyliczyć bez rysowania, użyj `cardScene` z miarą testową z istniejących testów i sprawdź, że `contentBottom` nie zostaje przekroczone).
2. Profil: 5 wskaźników na stronę (PRODUKT §4b: „5 wybranych wskaźników”).
3. Ranking: podział to nie dzielenie listy, tylko rozdzielenie „najwyżej” i „najniżej” na dwie strony (`options.side`).

## Zadanie
`src/core/share/deck-split.ts`:
- `export const TABLE_ROW_LIMIT: Record<ShareFormatKey, number>`; `export const PROFILE_ROW_LIMIT = 5`.
- `export function canSplit(page: DeckPage, format: ShareFormatKey): boolean`:
  - `table`/`compare`: `indicatorIds.length > limit`;
  - `profile`: `> 5`;
  - `ranking`: gdy brak `options.side` (strona „oba” – jeśli taka istnieje w zestawie; w przeciwnym razie `false`);
  - pozostałe (`map`, `bignumber`, `trend`, `histogram`, `versus`) → `false`.
- `export function splitPage(deck: Deck, pageId: string, format: ShareFormatKey): Deck` – zastępuje stronę kolejnymi stronami **tego samego rodzaju**, po `limit` wskaźników (ostatnia dostaje resztę), `options.part`/`parts` ustawione (1/3 …); zachowuje kolejność wskaźników i pozycję w zestawie; numeracja z `numbering()` przeliczona.
- Strona, której nie da się podzielić → ta sama referencja decku.
- `export function splitHint(page, format): string | null` – tekst podpowiedzi dla `PageDataEditor` („Ta strona ma 10 wskaźników – podziel ją na 2 strony”), gdy `canSplit`.
- Wskaźniki nie są tracone ani duplikowane (suma po podziale = przed).

## Testy
1. Tabela 10 wierszy w `post` → 2 strony (8 + 2), numeracja całego zestawu przeliczona (np. zestaw 4 → 5 stron, „1/5…5/5”).
2. Tabela 10 wierszy w `story` → 1 strona (limit 10) → `canSplit === false`.
3. Tabela 25 wierszy w `post` → 4 strony (8, 8, 8, 1).
4. Profil z 12 wskaźnikami → 3 strony (5, 5, 2).
5. Mapa, duża liczba, wykres, rozkład, versus: `canSplit === false`, `splitPage` zwraca tę samą referencję.
6. Suma i kolejność wskaźników zachowane (porównaj spłaszczone listy).
7. `options.part/parts` poprawne (`1/2`, `2/2`).
8. Limity dla 4 formatów mieszczą się w obszarze treści (test z Research pkt 1).
9. `splitHint` zwraca tekst po polsku z liczbami; `null`, gdy nie ma co dzielić.
10. Strona w środku zestawu: nowe strony wchodzą dokładnie w jej miejsce, inne strony bez zmian.

## Gotowe, gdy
- Tabela 10 wierszy w Post → 2 strony (8 + 2), numeracja przeliczona; testy zielone.
Nie ruszaj: `deck.ts`, `card-table.ts`, widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
