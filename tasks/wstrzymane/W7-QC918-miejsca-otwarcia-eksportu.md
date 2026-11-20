# QC918 – Miejsca otwarcia eksportu przekazują kontekst (mapa, profil, porównanie, rankingi, biblioteka)
Cel: Każdy przycisk „Pobierz i udostępnij” mówi oknu, skąd został kliknięty, więc zestaw startuje od właściwych stron.
Zmieniaj: src/view/share/useShareData.ts, src/view/share/LazyShareDialog.tsx, tests/unit/share-entry-points.test.ts
Wymagane: tests/unit/share-entry-points.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/share-map.spec.ts tests/e2e/share-profile.spec.ts tests/e2e/share-compare.spec.ts
Przeczytaj najpierw: src/view/share/useShareData.ts (233 linie – jak dziś powstaje `availableKinds` i dane kart), LazyShareDialog.tsx, ShareDialog.tsx (po QC917: propsy `entry`, `ctx`), src/core/share/deck-defaults.ts (QC903: `ShareEntry`, `DeckContext`), src/view/share/ShareBar.tsx, miejsca użycia przycisku (`rg "LazyShareDialog|useShareData"`), istniejące testy udostępniania (**nie zmieniaj**)

## Kontekst
`useShareData` buduje dane kart (mapa, ranking, profil, porównanie) z tego, co otwarte. Teraz musi dodatkowo wyliczyć `entry` (skąd kliknięto) i `ctx` (aktywny wskaźnik, „Moje wskaźniki”, czy jest miejsce, czy jest para) oraz mapę wartości już dostępnych w pamięci strony (`initialValues`, żeby `useDeck` nie pobierał ich ponownie).

## Research
1. Wypisz w opisie PR wszystkie miejsca wywołania (`rg`) i ich przypisanie do `entry`: mapa (panel wskaźnika) → `map`; profil (stopka profilu) → `profile`; zakładka/strona porównania → `compare`; strony Rankingi → `rankings`; strona wskaźnika z biblioteki → `library`.
2. Pliki ekranu (`Home.tsx`, `ProfileSheet*.tsx`, `AtlasMap.tsx`, `map/hooks/*`) **nie wolno zmieniać** – jeśli którykolwiek wywołujący musi dostać nowy prop `entry`, a jest plikiem ekranu: **zatrzymaj się** i opisz (alternatywą: wyliczać `entry` wewnątrz `useShareData` z dostępnego stanu: `selectedUnit`/`pair`/`route`).
3. Preferowany wariant: `entry` wyliczone w `useShareData` z jego dotychczasowych argumentów (`kind`/dostępne dane) + opcjonalny argument `entry?` dla nowych stron (Rankingi, Biblioteka, które sam wołasz w QC802/QC804 – tam dopisz `entry` w przyszłym zadaniu, nie tu).

## Zadanie
- `useShareData` zwraca dodatkowo `entry: ShareEntry`, `deckContext: DeckContext`, `initialValues: Map<string, IndicatorValues>`.
- `LazyShareDialog` przekazuje je do `ShareDialog`.
- Reguły wyliczenia `entry` (bez zmian po stronie wywołujących): dostępny tylko profil → `profile`; dostępne dwa profile → `compare`; w przeciwnym razie `map`; opcjonalny argument `entry` nadpisuje (dla `rankings`/`library`).
- `deckContext.mine` = `useMyIndicators().list` w chwili otwarcia; `hasUnit` = jest wybrane miejsce; `hasPair` = są dwa miejsca.

## Testy (`tests/unit/share-entry-points.test.ts`)
1. Z kontekstu „profil otwarty” → `entry === 'profile'` i `defaultDeck` zaczyna od „Profil”.
2. Z kontekstu „dwa profile” → `compare`; zestaw zaczyna od „Porównanie”.
3. Z samą mapą → `map`, zestaw: Mapa, Ranking×2, Tabela.
4. Argument `entry: 'rankings'` nadpisuje; `library` analogicznie.
5. `deckContext.mine` odzwierciedla listę „Moich wskaźników” (po usunięciu jednego – 6).
6. `initialValues` zawiera wartości już obecne (mapa/profil), brak wartości, których strona nie ma.
7. Istniejące testy i e2e udostępniania zielone bez zmian.

## Gotowe, gdy
- Z profilu zestaw zaczyna się od „Profil”; testy zielone; istniejące bez zmian.
Nie ruszaj: plików ekranu, `ShareDialog.tsx` (QC917), istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
