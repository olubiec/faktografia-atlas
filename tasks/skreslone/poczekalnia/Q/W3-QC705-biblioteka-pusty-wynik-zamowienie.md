# QC705 – Pusty wynik biblioteki: „Nie mamy jeszcze danych o …” + zamówienie
Cel: Gdy fraza nic nie znajduje, użytkownik widzi jasny komunikat i przycisk zamówienia tematu; przycisk jest też zawsze nad listą.
Zmieniaj: src/view/library/LibraryResults.tsx, src/view/pages/Library.tsx, tests/unit/library-empty-order.test.tsx
Wymagane: tests/unit/library-empty-order.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/library/LibraryResults.tsx, src/view/library/OrderTopicButton.tsx (QC704), src/view/pages/Library.tsx (po QC702/QC703), tests/unit/library-results.test.tsx, tests/e2e/library-page.spec.ts, docs/PRODUKT.md §4d

## Kontekst
**Istniejące `library-results.test.tsx` i e2e biblioteki nie mogą się zmienić ani paść.** Jeśli sprawdzają obecny komunikat pustego wyniku – dodaj nowy komunikat tylko, gdy przekazany jest nowy prop `emptyTopic`/`orderTopic`, a stary tekst zostaw domyślnie.

## Research
Sprawdź dokładny obecny tekst pustego wyniku w `LibraryResults.tsx` i w testach. Ustal minimalny sposób dodania propsu bez naruszenia istniejących asercji.

## Zadanie
- `LibraryResults.tsx`: nowy opcjonalny prop `orderTopic?: string | null`. Gdy lista pusta **i** `orderTopic !== undefined`: komunikat „Nie mamy jeszcze danych o „<temat>”.” (gdy temat pusty: „Nie mamy jeszcze takich danych.”) + `<OrderTopicButton topic={orderTopic} />`. Bez propsu – dotychczasowe zachowanie.
- `Library.tsx`: przekaż `orderTopic={query.text}`; **oraz** pokaż `OrderTopicButton` (bez tematu lub z bieżącą frazą) zawsze nad listą obok zdania „m z n” (jedno miejsce, wyrównane, zawija się na telefonie); przekaż `onlyWithData` do `CategoryTiles` (QC703).
- Układ 390 px bez poziomego przewijania; przycisk ≥ 44 px.

## Testy
1. Fraza bez trafień („xyzxyz”) → widoczne „Nie mamy jeszcze danych o „xyzxyz”.” i link zamówienia z zakodowanym tematem w `href`.
2. Z trafieniami przycisk „Zamów dane na temat…” jest nadal nad listą, a komunikat pustego wyniku nie.
3. `LibraryResults` renderowany bez nowego propsu zachowuje stary komunikat (zgodność ze starymi testami).
4. Kafelki działów dostały `onlyWithData` (dział bez pobranych nie ma kafelka na stronie).
5. Link zamówienia prowadzi na GitHub (`https://github.com/olubiec/faktografia-atlas/issues/new`).

## Gotowe, gdy
- Pusty wynik pokazuje „Nie mamy jeszcze danych o „…”” + przycisk; istniejące testy bez zmian.
Nie ruszaj: `query.ts`, `OrderTopicButton.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
