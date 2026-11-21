# QC612 – Porównaj: wskaźniki z biblioteki w tabeli i × w wierszu
Cel: wskaźnik dodany z biblioteki ("Dodaj wskaźnik") trafia do tabeli Porównaj jako wiersz (użyj `compareExtraRows` z src/core/compare/compare-extra.ts, wartości przez istniejący sposób pobierania z QC604/QC602); każdy wiersz ma przycisk × (min. 44 px) usuwający go z listy "Moje wskaźniki"; "Przywróć podstawowe" działa jak dotąd.
Zmieniaj: src/view/pages/ComparePage.tsx, src/view/compare/CompareIndicatorPicker.tsx, src/view/profile/ProfileCompareTable.tsx, tests/unit/compare-extra-wiring.test.tsx
Wymagane: tests/unit/compare-extra-wiring.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4a i §4f, src/view/pages/ComparePage.tsx, src/view/compare/CompareIndicatorPicker.tsx, src/core/compare/compare-extra.ts
Decyzja 19.11.2026 (właściciel): istniejących testów nie zmieniasz (w tym ProfileCompareTable – nowe prop opcjonalne, stare zachowanie domyślne).
