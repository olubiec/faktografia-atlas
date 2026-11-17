# QC804 – Strona wskaźnika z biblioteki: „Kopiuj link” i „Pobierz i udostępnij” (karta rankingu)
Cel: `/biblioteka/<id>` ma pasek udostępniania, a okno otwiera się z kartą rankingu tego wskaźnika.
Zmieniaj: src/view/pages/LibraryVariable.tsx, tests/unit/library-variable-share.test.tsx
Wymagane: tests/unit/library-variable-share.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-variable.spec.ts
Przeczytaj najpierw: src/view/pages/LibraryVariable.tsx (po QC508, QC608), src/view/share/ShareBar.tsx, LazyShareDialog.tsx, useShareData.ts, src/core/library/load-library.ts (`valuesByTeryt`), src/core/share/card-ranking.ts (`RankingCardData`), tests/unit/library-variable*.test.tsx i tests/e2e/library-variable.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4b, §4d, D10

## Kontekst
Strona wskaźnika z biblioteki ma już listę „najwyżej / najniżej” (po 10) z danych biblioteki. Pasek ma otworzyć okno z kartą **rankingu** zbudowaną z tych samych danych (bez nowego pobrania).

## Research
Sprawdź, jak strona buduje listę „najwyżej/najniżej” (jakie struktury) i jak zamienić je na `RankingCardData` (`items` z `name`, `value`/`valueText`, `rank`). Użyj już policzonych; nazwy jednostek z `units` (strona je ma, bo pokazuje nazwy).

## Zadanie
- Pasek `ShareBar` (url = `location.href` ze stanem `?y=&l=` jeśli strona go ma) w gałęzi pobranego wskaźnika; dla niepobranego – tylko „Kopiuj link”.
- `onOpenDialog` otwiera `LazyShareDialog` z rodzajem „ranking” i danymi bieżącego poziomu/roku (20 pozycji: 10 najwyżej + 10 najniżej, jak istniejąca karta rankingu; gdy ≤ 20 – całość).
- Nie zwiększ początkowego JS (okno ładowane po kliknięciu).

## Testy
1. Pobrany wskaźnik: pasek z dwoma przyciskami; niepobrany: tylko „Kopiuj link”.
2. „Pobierz i udostępnij” otwiera okno z kartą rankingu: dane karty zawierają nazwę wskaźnika, rok i do 20 pozycji z nazwami (nie kodami).
3. Link zawiera bieżące `?y=`/`?l=` po ich zmianie na stronie.
4. Brak dodatkowych żądań sieciowych po kliknięciu paska (zlicz mock `fetch` – jak przed kliknięciem).
5. Istniejące testy strony zielone bez zmian.

## Gotowe, gdy
- Okno otwiera się z kartą rankingu tego wskaźnika; istniejące testy bez zmian.
Nie ruszaj: `ShareBar.tsx`, `card-ranking.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
