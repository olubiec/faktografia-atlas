# QC608 – „Pokaż na mapie” na stronie wskaźnika z biblioteki
Cel: Pobrany wskaźnik z biblioteki ma przycisk prowadzący na mapę z tym wskaźnikiem i właściwym poziomem.
Zmieniaj: src/view/pages/LibraryVariable.tsx, tests/unit/library-show-on-map.test.tsx
Wymagane: tests/unit/library-show-on-map.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-variable.spec.ts
Przeczytaj najpierw: src/view/pages/LibraryVariable.tsx (po QC508 – ma już `MyToggleButton`), src/core/indicators/registry.ts (`libraryIndicatorId`), tests/unit/library-variable*.test.tsx i tests/e2e/library-variable.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4d

## Kontekst
PRODUKT §4d (po zmianie 17.11): na stronie wskaźnika „Pokaż na mapie”. Poziom: najwyższy dostępny z danych tego wskaźnika (`gmi` > `pow` > `woj` – wybieramy **najdokładniejszy**, bo to wynik QC602 `minLevel`); rok: bieżący wybór strony, jeśli jest.

## Research
Sprawdź w `LibraryVariable.tsx`, skąd strona zna poziomy i rok (selektory „rok” i „poziom” na stronie). Link ma odzwierciedlać **bieżący wybór** roku i poziomu, a nie sztywne wartości.

## Zadanie
- W gałęzi „pobrany”: link/przycisk „Pokaż na mapie” (`<Link>` z React Router, ≥ 44 px) do `/?i=b<id>&l=<poziom>` plus `&y=<rok>` gdy wybrano rok.
- Poziom z biblioteki → poziom mapy: `5`→`pow`, `6`→`gmi`, `3`→`woj` (jeśli strona trzyma liczby; użyj tego samego mapowania co `registry.ts`, nie duplikuj tabeli – wyeksportuj z registry funkcję, jeśli jej brak; wtedy dopisz `src/core/indicators/registry.ts` do „Zmieniaj” w opisie PR i zatrzymaj się na zgodę).
- Dla niepobranego – przycisku nie ma.

## Testy
1. Pobrany wskaźnik powiatowy → `href === '/?i=b101&l=pow'` (+ `&y=2024` po wybraniu roku 2024).
2. Wskaźnik z poziomem gminnym → `l=gmi`.
3. Zmiana poziomu/roku na stronie zmienia `href`.
4. Niepobrany → brak przycisku „Pokaż na mapie”.
5. Przycisk ma ≥ 44 px i dostępną nazwę.
6. Istniejące testy strony wskaźnika zielone bez zmian.

## Gotowe, gdy
- Link prowadzi do `/?i=b<id>&l=<poziom>`; istniejące testy bez zmian.
Nie ruszaj: `MyToggleButton.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
