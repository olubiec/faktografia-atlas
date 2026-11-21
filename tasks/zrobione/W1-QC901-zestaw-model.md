# QC901 – Model zestawu stron eksportu (strony, dodaj, usuń, przesuń, numeracja n/N)
Cel: Czysta logika zestawu kart: lista stron z rodzajem i danymi, operacje na niej i numeracja „n/N”.
Zmieniaj: src/core/share/deck.ts, tests/unit/deck.test.ts
Wymagane: tests/unit/deck.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4b (zestaw edytowalny) i D7–D9, src/core/share/card.ts (`CardKind`), src/core/share/formats.ts, src/view/share/ShareDialog.tsx (jak dziś przełącza 4 karty – żeby zrozumieć dotychczasowe zachowanie)

## Kontekst
Dziś okno eksportu ma 4 stałe karty (mapa, ranking, profil, porównanie), jedną naraz, bez numeracji i bez dodawania/usuwania. Właściciel: „każda strona ma × i + do dodania wykresów, tabel…; strony numerowane 1/5, 3/5”. To zadanie dostarcza **model** zestawu bez Reacta i bez rysowania.

## Research
1. Rodzaje stron (zbiór zamknięty, wspólny dla całego C9): `'map' | 'ranking' | 'table' | 'bignumber' | 'trend' | 'histogram' | 'profile' | 'compare' | 'versus'`. „Ranking najwyżej/najniżej” to jedna strona `ranking` z opcją `side: 'top' | 'bottom'`.
2. Identyfikatory stron muszą być **stabilne** i deterministyczne (potrzebne Reactowi jako `key` i testom): `p1`, `p2`… – kolejny numer = największy użyty + 1 (usunięcie nie powoduje ponownego użycia).
3. Nie dodawaj pakietów (np. `nanoid`).

## Zadanie
`src/core/share/deck.ts`:
```ts
export type PageKind = 'map'|'ranking'|'table'|'bignumber'|'trend'|'histogram'|'profile'|'compare'|'versus';
export type DeckPage = { id: string; kind: PageKind; indicatorIds: string[]; options?: { side?: 'top'|'bottom'; part?: number; parts?: number } };
export type Deck = { pages: DeckPage[] };
```
- `createDeck(pages: Omit<DeckPage,'id'>[]): Deck` – nadaje id `p1…`.
- `addPage(deck, page: Omit<DeckPage,'id'>, afterId?: string | null): Deck` – wstawia **za** wskazaną (domyślnie na końcu).
- `removePage(deck, id): Deck` – usuwa; **ostatniej strony nie da się usunąć** (zwraca ten sam obiekt).
- `movePage(deck, id, dir: -1 | 1): Deck` – przesuwa; na krawędzi bez zmian (ta sama referencja).
- `numbering(deck): { id: string; n: number; total: number; label: string }[]` – `label = "n/N"` (np. „2/5”); dla N = 1 etykieta pusta (`""`) – karta nie pokazuje numeru (QC905).
- `pageIndex(deck, id)`, `getPage(deck, id)`, `updatePage(deck, id, patch)`.
- Funkcje niemutujące; zmiana nic nie robiąca zwraca tę samą referencję.

## Testy
1. `createDeck` z 4 stron → id `p1…p4`, numeracja „1/4…4/4”.
2. Usunięcie strony 2 z 4 → numery 1/3, 2/3, 3/3; kolejna dodana strona dostaje `p5` (nie `p2`).
3. Usunięcie jedynej/ostatniej strony → ta sama referencja, `pages.length === 1`.
4. `movePage` środkowej w górę/dół zamienia miejscami; na krawędzi ta sama referencja.
5. `addPage` z `afterId` wstawia dokładnie za; bez – na końcu; nieznane `afterId` → na końcu.
6. N = 1 → `label === ''`.
7. Niemutowalność: wejściowy deck zamrożony (`Object.freeze` głęboki) – operacje nie rzucają.
8. `updatePage` zmienia tylko wskazaną stronę, reszta ma te same referencje.

## Gotowe, gdy
- Usunięcie strony 2 z 4 daje numery 1/3, 2/3, 3/3; ostatniej nie da się usunąć; testy zielone.
Nie ruszaj: `card.ts`, `ShareDialog.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
