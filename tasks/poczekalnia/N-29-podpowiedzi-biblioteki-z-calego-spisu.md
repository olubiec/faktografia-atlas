# N-29 – Podpowiedzi wyszukiwarki biblioteki z całego spisu
Cel: Podpowiedzi pod polem „Szukaj wskaźnika” na `/biblioteka` pokazują pasujące wskaźniki z całego spisu, także jeszcze niepobrane (oznaczone), bo od P3-C lista domyślnie ma filtr „tylko z danymi”, a podpowiedzi używają tego samego zapytania – wpisanie „Mediana” nie daje żadnej podpowiedzi i nie da się dojść do „Mediana wieku” (104, `has: 0`) ani go zamówić. P3-C: „reszta po wyszukaniu lub przełączniku”. Pada przez to library-search „wybór wskaźnika z podpowiedzi wyszukiwarki (onPick)”.
Zmieniaj: src/view/library/LibrarySearchBar.tsx, tests/unit/library-suggestions-all.test.tsx, tests/e2e/library-suggestions-all.spec.ts
Wymagane: tests/unit/library-suggestions-all.test.tsx, tests/e2e/library-suggestions-all.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/library-suggestions-all.spec.ts tests/e2e/library-search.spec.ts tests/e2e/library-page.spec.ts tests/e2e/header-library.spec.ts
Przeczytaj najpierw: src/view/library/LibrarySearchBar.tsx (`suggestions`, linie 31–36, render opcji 154–190), src/core/library/query.ts (`filterVars`, `onlyReady`), tests/unit/library-search-bar.test.tsx, tests/unit/library-view.test.tsx (test „wyszukiwanie zachowuje filtr” dotyczy LISTY wyników – ma zostać zielony), tests/fixtures/library/index.json, tasks/poczekalnia/P3-C.md, tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 5)

Zadanie:
1. `LibrarySearchBar.tsx`: podpowiedzi liczone z `filterVars(index, { ...query, onlyReady: false })` (pozostałe filtry – dział, poziom, jednostka – bez zmian), dalej najwyżej 5. Lista wyników (`LibraryResults`) i adres (`p`) bez zmian.
2. Przy podpowiedzi wskaźnika bez danych (`has` różne od 1/true i `hasReady !== true`) dopisz krótki znacznik tekstowy „do zamówienia” (klasy tokenów jak ścieżka kategorii: `text-xs text-olowek`), także w nazwie dostępnej opcji (czytnik ma usłyszeć, że danych jeszcze nie ma). Plik ≤ 200 linii.
3. `tests/unit/library-suggestions-all.test.tsx` (`renderToString` lub sposób z library-search-bar.test.tsx, spis z `tests/fixtures/library/index.json`): przy `query.text = 'Mediana'` i `onlyReady: true` w podpowiedziach jest „Mediana wieku” ze znacznikiem „do zamówienia”; przy `query.text = 'ludnosc'` wskaźnik z danymi nie ma znacznika.
4. `tests/e2e/library-suggestions-all.spec.ts` (nazwy z `@S21`, spis z fixture przez `page.route`): na `/biblioteka` wpisz „Mediana” → opcja `role="option"` z „Mediana wieku” i „do zamówienia”; klik → `/biblioteka/104`, widać „Ten wskaźnik jeszcze nie został pobrany”.

Gotowe, gdy:
- Nowe testy zielone; library-search-bar.test, library-view.test (w tym „wyszukiwanie zachowuje filtr”), library-page, header-library zielone bez zmian.
- library-search.spec.ts „wybór wskaźnika z podpowiedzi wyszukiwarki (onPick) nawiguje do /biblioteka/:id” zielony bez zmian w nim.

Nie rób: zmian w filtrze listy wyników, w query.ts, library-params.ts, istniejących testach; nie zmieniaj domyślnego „tylko z danymi”; bez nowych pakietów.
