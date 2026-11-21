# M03 – Tabela porownania karty na telefonie i prawdziwe testy E2E
Cel: Zastapienie scisnietej 4-kolumnowej tabeli porownania na telefonie czytelnymi kartami dwupoziomowymi i zastapienie testow ze sztucznym innerHTML prawdziwymi testami E2E.
Zmieniaj: src/view/profile/ProfileCompareTable.tsx, src/view/profile/CompareMaps.tsx, tests/e2e/compare-table.spec.ts, tests/e2e/compare-maps.spec.ts, tests/e2e/s18-compare.spec.ts, tests/e2e/share-compare.spec.ts
Wymagane: tests/e2e/compare-table.spec.ts, tests/e2e/compare-maps.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4b Porownanie), docs/STYL.md, src/view/profile/ProfileCompareTable.tsx, src/view/profile/CompareMaps.tsx

Zadanie:
1. W `ProfileCompareTable.tsx`: na telefonie (< 768 px) uzyj ukladu dwupoziomowego ze sticky naglowkiem nazw obu jednostek: pelna szerokosc wiersza na nazwe wskaznika i roznice (np. „wyzej o 14,2%”), a pod spodem 2 rowne kolumny z wartosciami A i B w `font-mono`. Na komputerze zachowaj 4 kolumny tabeli.
2. W `CompareMaps.tsx`: usun hack `window.__renderCompareMaps`.
3. W testach `compare-table.spec.ts`, `compare-maps.spec.ts`, `s18-compare.spec.ts` i `share-compare.spec.ts`: zastap wstrzykiwanie sztucznego HTML na `/design` prawdziwym testowaniem zakladki „Porownaj” w profilu na komputerze (1440x900) i telefonie (360x740).

Gotowe, gdy:
- Wszystkie 4 testy e2e porownania przechodza w aplikacji na komputerze i telefonie (360x740).
- Na 360 px brak poziomego przewijania i sciskania kolumn; brak bledow axe.

Nie ruszaj: src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileOverview.tsx
