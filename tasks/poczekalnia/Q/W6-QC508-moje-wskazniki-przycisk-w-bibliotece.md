# QC508 – Przycisk „Dodaj do moich / Usuń z moich” przy wskaźniku w Bibliotece
Cel: Na stronie wskaźnika z biblioteki można jednym kliknięciem dodać go do „Moich wskaźników” albo usunąć.
Zmieniaj: src/view/my-indicators/MyToggleButton.tsx, src/view/pages/LibraryVariable.tsx, tests/unit/my-toggle-button.test.tsx
Wymagane: tests/unit/my-toggle-button.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-variable.spec.ts
Przeczytaj najpierw: src/view/pages/LibraryVariable.tsx, src/view/my-indicators/useMyIndicators.ts, src/core/indicators/registry.ts (`libraryIndicatorId`), tests/unit/library-variable*.test.tsx i tests/e2e/library-variable.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4d, §4f

## Kontekst
Tylko **pobrane** wskaźniki da się dodać do „moich” (mają dane). Strona `/biblioteka/<id>` wie, czy wskaźnik jest pobrany (pokazuje wartości zamiast „Zamów”).

## Research
Sprawdź w `LibraryVariable.tsx`, po czym rozpoznaje stan „pobrany” (jest plik wartości/`has`). Przycisk pokazujemy **tylko** w tej gałęzi; w gałęzi „niepobrany” zostaje „Zamów ten wskaźnik”.

## Zadanie
`MyToggleButton.tsx`: props `{ indicatorId: string; name: string }` (id już z prefiksem `b`); przycisk przełącza `add/remove`; tekst „Dodaj do moich” / „Usuń z moich”; `aria-pressed`; ≥ 44 px; obok krótka informacja po zmianie (`role="status"`: „Dodano do moich wskaźników” / „Usunięto z moich wskaźników”, znika po 3 s).
W `LibraryVariable.tsx`: w gałęzi pobranego wskaźnika dodaj `<MyToggleButton indicatorId={libraryIndicatorId(id)} name={nazwa} />` obok istniejących akcji; **niczego nie usuwaj**.

## Testy
1. Klik „Dodaj do moich” dopisuje `b<id>` do listy (`useMyIndicators().list`), tekst zmienia się na „Usuń z moich”, `aria-pressed=true`.
2. Drugi klik usuwa i wraca tekst początkowy.
3. Komunikat statusu pojawia się i po 3 s (fake timers) znika.
4. Stan początkowy odzwierciedla listę (id już w „moich” → „Usuń z moich”).
5. Dla niepobranego wskaźnika na stronie przycisku **nie ma** (test `LibraryVariable` z fixture’em bez wartości).
6. Zmiana w innej komponencie (`useMyIndicators().remove`) aktualizuje przycisk bez odświeżenia (wspólny stan).
7. Istniejące testy strony wskaźnika zielone bez zmian.

## Gotowe, gdy
- Klik przełącza, a lista w panelu mapy to widzi (wspólny stan – test 6); istniejące testy bez zmian.
Nie ruszaj: `useMyIndicators.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
