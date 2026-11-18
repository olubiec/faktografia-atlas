# QC703 – Kafelki działów tylko z pobranymi wskaźnikami (z liczbą)
Cel: Kafelek działu istnieje tylko wtedy, gdy ma co najmniej jeden pobrany wskaźnik; pokazuje liczbę pobranych.
Zmieniaj: src/view/library/CategoryTiles.tsx, tests/unit/category-tiles-fetched.test.tsx
Wymagane: tests/unit/category-tiles-fetched.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/library/CategoryTiles.tsx, src/core/library/query.ts (QC701: `childCategoriesWithData`, `countFetchedByCategory`), tests/unit/library-categories.test.tsx, docs/PRODUKT.md §4d, docs/STYL.md

## Kontekst
Dziś kafelki działów pokazują wszystkie działy (też te bez żadnych danych). **Istniejący `library-categories.test.tsx` nie może się zmienić ani paść**; dlatego dodajesz prop `onlyWithData?: boolean` (domyślnie `false` – stare zachowanie), a `Library.tsx` w QC702 już przekazuje swoje; to zadanie ustawia tylko komponent. (Przekazanie `onlyWithData` z `Library.tsx` zrobi QC705 – zanotuj to w opisie PR.)

## Research
Sprawdź, jak `CategoryTiles` dostaje kategorie (props vs index) i jak pokazuje okruszki oraz liczbę. Zachowaj nawigację klawiaturą i etykiety.

## Zadanie
- Prop `onlyWithData?: boolean`; przy `true` używaj `childCategoriesWithData` i `countFetchedByCategory` (licznik = pobrane, w tekście „<k> wskaźników” z poprawną polską liczbą mnogą: 1 wskaźnik, 2–4 wskaźniki, 5+ wskaźników).
- Kafelek ≥ 44 px wysokości, napisy w kafelku zawijają się, nie wychodzą poza kafelek.
- Gdy po filtrze nie zostaje żaden dział: komunikat „Na razie nie ma pobranych wskaźników w tym dziale”.

## Testy
1. `onlyWithData` + fixture: działy z pobranymi (Ludność, Rynek pracy, Mieszkania) mają kafelki z licznikiem pobranych (policz z fixture’a).
2. Dział bez pobranych (wariant fixture’a zbudowany w teście) nie ma kafelka.
3. Liczba mnoga: 1 → „1 wskaźnik”, 3 → „3 wskaźniki”, 12 → „12 wskaźników”.
4. Bez propa komponent zachowuje się jak dotąd (te same kafelki jak w istniejącym teście).
5. Wejście w dział (klik) wywołuje dotychczasowy callback z id działu.
6. Pusty wynik → komunikat.

## Gotowe, gdy
- Dział bez pobranych nie ma kafelka; istniejący test kafelków zielony bez zmian.
Nie ruszaj: `Library.tsx`, `query.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
