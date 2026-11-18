# QC702 – Strona Biblioteka pokazuje tylko pobrane + zdanie „m z n”
Cel: Lista na `/biblioteka` zawiera tylko wskaźniki z danymi; bez przełącznika „tylko pobrane”; nad listą zdanie z licznikami.
Zmieniaj: src/view/pages/Library.tsx, src/view/library/LibraryFilters.tsx, tests/unit/library-page-fetched.test.tsx
Wymagane: tests/unit/library-page-fetched.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/Library.tsx, src/view/library/LibraryFilters.tsx, src/view/library/LibraryResults.tsx, src/core/library/query.ts (QC701: `filterFetched`, `libraryCounts`), tests/unit/library-filters.test.tsx, tests/unit/library-results.test.tsx, tests/e2e/library-page.spec.ts, tests/e2e/library-search.spec.ts, docs/PRODUKT.md §4d

## Kontekst
Istniejące testy (`library-filters.test.tsx`, `library-results.test.tsx`, e2e biblioteki) **nie mogą się zmienić ani paść**. Jeśli sprawdzają przełącznik „tylko pobrane” – zatrzymaj się i opisz w PR (wtedy rozwiązaniem jest zachowanie przełącznika w `LibraryFilters` jako ukrytego prop `showReadyToggle` domyślnie `true`, a `Library.tsx` przekazuje `false`). **Preferuj to rozwiązanie z góry**, bo nie narusza istniejących testów.

## Research
Zobacz, jak `Library.tsx` buduje zapytanie z adresu (`?k= &q= &l= &p=`) i gdzie wstawia `onlyReady`. Adres z `&o=1` (jeśli istnieje) po zmianie ma być ignorowany.

## Zadanie
- `Library.tsx`: używaj `filterFetched` (QC701) i `libraryCounts`; usuń z adresu parametr „tylko pobrane”, jeśli istnieje (czytany, ale ignorowany).
- `LibraryFilters.tsx`: prop `showReadyToggle?: boolean` (domyślnie `true`, dla zgodności z testami); `Library.tsx` przekazuje `false`.
- Nad listą (rola `status`): **„<m> wskaźników z danymi (z <n> w spisie GUS). Kolejne dane dochodzą co noc.”** Liczby po polsku (spacje tysięcy).
- Brak wyników (np. fraza bez trafień) – obsługa w QC705; tu zostaw dotychczasowy komunikat.
- Wejście na `/biblioteka` nadal = **jedno** żądanie indeksu (PRODUKT §7).

## Testy (`tests/unit/library-page-fetched.test.tsx`, fixture `index.json`)
1. Zdanie „6 wskaźników z danymi (z 12 w spisie GUS). Kolejne dane dochodzą co noc.” (liczby z fixture’a).
2. Na liście **nie ma** niepobranych („Stopa bezrobocia” z `has:0`); są pobrane („Liczba ludności ogółem”).
3. Przełącznika „tylko pobrane” nie ma w DOM (`queryByLabelText(/tylko pobrane/i)` = null).
4. Wyszukiwanie „lud” zawęża tylko w obrębie pobranych; licznik `m` w zdaniu **nie zmienia się** (to liczba globalna), a liczba wyników widoczna osobno.
5. `LibraryFilters` renderowany samodzielnie (bez nowego propa) nadal pokazuje przełącznik (zgodność z istniejącymi testami).
6. Parametr `&o=1` w adresie nie psuje strony.
7. Jedno żądanie indeksu przy wejściu (zlicz mock `fetch`).

## Gotowe, gdy
- Test znajduje zdanie z liczbami; przełącznika nie ma; istniejące testy biblioteki zielone bez zmian.
Nie ruszaj: `query.ts`, istniejących testów, `LibraryResults.tsx` (QC705).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
