# M04 – Biblioteka GUS mobile i statystyki opisowe
Cel: Zwijany pasek filtrow na telefonie, 2-liniowe podpowiedzi n4/n5, statystyki opisowe i klikalny ranking na stronie wskaznika biblioteki.
Zmieniaj: src/view/pages/Library.tsx, src/view/library/LibraryFilters.tsx, src/view/library/LibrarySearchBar.tsx, src/view/pages/LibraryVariable.tsx, src/view/library/VariableStatsBar.tsx, tests/e2e/library-search.spec.ts, tests/e2e/library-variable.spec.ts
Wymagane: src/view/library/VariableStatsBar.tsx, tests/e2e/library-search.spec.ts, tests/e2e/library-variable.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4d Biblioteka), src/view/pages/Library.tsx, src/view/pages/LibraryVariable.tsx

Zadanie:
1. W `Library.tsx` i `LibraryFilters.tsx`: dodaj `SiteFooter`; na telefonie (< 768 px) umiesc wyszukiwarke i kompaktowy pasek `Filtry (aktywne: N) ▾` tak, aby pierwsze wyniki listy byly widoczne na pierwszym ekranie; dodaj przyciski „Popularne wyszukiwania”.
2. W `LibrarySearchBar.tsx`: usun `shadow-md`; zawijaj podpowiedzi do 2 linii, aby na telefonie byl widoczny koncowy czlon zmiennej BDL (n4/n5).
3. Utworz `src/view/library/VariableStatsBar.tsx`: pasek 4 statystyk opisowych (Liczba jednostek, Mediana, Min-Max, Lata) + pasek 5 klas kwantylowych.
4. W `LibraryVariable.tsx`: wstaw `VariableStatsBar.tsx`, dodaj `SiteFooter`, podepnij `onSelect` w `RankingBars` (klikniecie wiersza prowadzi do profilu jednostki na mapie `/?u=`), zawijaj kontrolke poziomu na 360 px.

Gotowe, gdy:
- Testy e2e `tests/e2e/library-search.spec.ts` i `tests/e2e/library-variable.spec.ts` przechodza na 1440x900 i 360x740.
- Na `/biblioteka/:id` wyswietlaja sie 4 karty statystyk, a klikniecie pozycji w rankingu prowadzi do profilu na mapie.

Nie ruszaj: src/core/library/, src/view/library/CategoryTiles.tsx
