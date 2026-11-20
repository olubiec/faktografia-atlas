# QC912 – Stan edytora zestawu w Reakcie (`useDeck`): strony, wybór, dociąganie wartości
Cel: Hook trzymający zestaw stron, bieżącą stronę, format i motyw oraz dociągający wartości dodanych wskaźników (jedno żądanie na wskaźnik).
Zmieniaj: src/view/share/useDeck.ts, src/view/share/deckReducer.ts (nowy), src/view/share/valueLoader.ts (nowy), tests/unit/deck-reducer.test.ts (nowy), tests/unit/value-loader.test.ts (nowy)
Wymagane: tests/unit/deck-reducer.test.ts, tests/unit/value-loader.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/{deck,deck-page-data,deck-defaults,deck-split}.ts (QC901–QC904), src/core/indicators/load-any-values.ts (QC604), src/core/data/load-values.ts, src/view/share/useShareData.ts (skąd dziś dane), src/view/hooks/useMyIndicators.ts, docs/PRODUKT.md §4b, D8

## Kontekst
Okno eksportu potrzebuje jednego miejsca stanu: aktualny zestaw, zaznaczona strona, format (`post|square|story|wide`), motyw (`light|dark`) – wspólne dla **całego** zestawu – oraz wartości wskaźników, które pojawiają się w zestawie. Wartości głównych wskaźników zwykle są już w pamięci strony (mapa/profil); wskaźnik dodany przez użytkownika, którego nie ma w pamięci, wymaga **dokładnie jednego** pobrania (D8).

## Research
1. Hook ma być **testowalny bez sieci**: loader wartości przyjmij jako parametr (`loadValues?: (id: string) => Promise<IndicatorValues | null>`; domyślnie `loadAnyValues` z kontekstem `units`), a „wartości już dostępne” jako `initialValues: Map<string, IndicatorValues>` z `useShareData`.
2. Cache modułowy loaderów (`load-values`, `load-library`) już gwarantuje jedno żądanie na wskaźnik; hook dodatkowo śledzi stany `idle|loading|ready|error` per wskaźnik, żeby UI pokazał „Wczytujemy…”.
3. Zmiana „Moich wskaźników” w trakcie otwartego okna **nie** zmienia zestawu (zestaw jest kopią w chwili otwarcia).

## Zadanie
`src/view/share/useDeck.ts`:
- `useDeck({ entry, ctx, initialValues, loadValues? }): { deck; current: DeckPage; setCurrent(id); format; setFormat; theme; setTheme; numbering; addPage(kind, afterId?); removePage(id); movePage(id, dir); splitPage(id); addIndicator(pageId, id); removeIndicator(pageId, id); replaceIndicator(pageId, id); values: Map<string, IndicatorValues>; status: Map<string, 'idle'|'loading'|'ready'|'error'> }`.
- Start: `defaultDeck(entry, ctx)`; `current` = pierwsza strona.
- `removePage` bieżącej → `current` przechodzi na sąsiednią (następną, a gdy brak – poprzednią).
- `addPage(kind)`: `indicatorIds = seedIndicators(kind, mine, activeId)`; po dodaniu `current` = nowa strona.
- Każde użycie wskaźnika, którego brak w `values`, uruchamia `loadValues(id)` **raz** (strażnik: `status` ≠ `idle` → nie ponawiaj); wynik do `values`; błąd → `status 'error'` (UI pokaże „Nie udało się wczytać”, wskaźnik zostaje na liście).
- Po `unmount` spóźniona odpowiedź nie ustawia stanu (anuluj/flaga).

## Uwaga o testach (audyt 20.11)
W repo nie ma Testing Library ani jsdom (Vitest działa w `node`, istniejące testy widoków używają `renderToString`). `renderHook` nie jest dostępny i nie wolno dodawać pakietu. Dlatego logikę wydziel z hooka do czystych plików i testuj je w Vitest: `deckReducer.ts` (`deckReducer(state, action)` + typ akcji: setCurrent, setFormat, setTheme, addPage, removePage, movePage, splitPage, addIndicator, removeIndicator, replaceIndicator) oraz `valueLoader.ts` (`createValueLoader(load)` ze statusami `idle|loading|ready|error` na wskaźnik, strażnikiem „raz na wskaźnik”, flagą `dispose()` ignorującą spóźnioną odpowiedź). `useDeck.ts` ma być cienką warstwą (`useReducer` + efekt) bez własnej logiki. Zależności: `defaultDeck` (QC903) i `splitPage` (QC904) są już na main, gdy to zadanie startuje (kolejność QC903 → QC904 → QC912).

## Testy (czyste pliki, loader zamockowany; numery 1–9 poniżej dotyczą `deck-reducer.test.ts` (1,2,6,7,9) i `value-loader.test.ts` (3,4,5,8))
1. Start: zestaw z `defaultDeck`, `current` = pierwsza strona.
2. `removePage(current)` przesuwa `current`; ostatniej strony nie usuwa.
3. `addIndicator(pageId, 'b101')` wywołuje `loadValues('b101')` **dokładnie raz**; `status` przechodzi `loading → ready`; ponowne dodanie/usunięcie/dodanie – nadal jedno wywołanie.
4. Wskaźnik już w `initialValues` – zero wywołań loadera, `status 'ready'` od razu.
5. Błąd loadera → `status 'error'`, hook nie rzuca, wskaźnik pozostaje na stronie.
6. Zmiana `format`/`theme` nie zmienia zestawu i nie uruchamia ładowania.
7. `splitPage` wywołuje logikę z QC904 dla bieżącego `format`; zmiana formatu **nie** rozdziela/łączy stron automatycznie (podpowiedź z QC904 pokaże UI).
8. Odmontowanie przed odpowiedzią loadera: brak ostrzeżeń Reacta o zmianie stanu po odmontowaniu.
9. `numbering` zgodne z `numbering(deck)` po każdej operacji.

## Gotowe, gdy
- Dodanie wskaźnika = jedno żądanie; ponowne – zero; testy zielone.
Nie ruszaj: `core/share/*` (tylko import), `useShareData.ts` (QC918), istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
