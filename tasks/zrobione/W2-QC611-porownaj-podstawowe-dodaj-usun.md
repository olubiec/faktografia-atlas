# QC611 – Porównaj: na start 7 podstawowych wskaźników, dodawanie i usuwanie
Cel: Tabela na stronie Porównaj pokazuje na start tylko 7 podstawowych wskaźników (PRODUKT §4f), każdy wiersz da się usunąć (×), „+ Dodaj wskaźnik” dopisuje inny (także z biblioteki), „Przywróć podstawowe” wraca do startu.
Zmieniaj: src/view/pages/ComparePage.tsx, src/view/compare/CompareIndicatorPicker.tsx, tests/unit/compare-page-defaults.test.tsx
Wymagane: tests/unit/compare-page-defaults.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4a i §4f, src/view/pages/ComparePage.tsx, src/core/compare/compare.ts, src/core/compare/compare-extra.ts (jeśli jest), istniejące „Moje wskaźniki” (grep `faktografia-my-indicators`)
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe, resztę użytkownik dodaje i usuwa. Istniejących testów nie zmieniasz.
