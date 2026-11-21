# QT03 – Testy skrajne compareExtraRows
Cel: pokrycie przypadków brzegowych logiki wierszy z biblioteki.
Zmieniaj: tests/unit/compare-extra-edge.test.ts
Wymagane: tests/unit/compare-extra-edge.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/compare/compare-extra.ts, tests/unit/compare-extra.test.ts
Zadanie: Nowy plik testowy: brak wartości dla A lub B, wskaźnik bez poziomu gminy, duplikaty id, pusta lista, kolejność wierszy. Kodu produkcyjnego nie zmieniasz; jeśli test wykrywa błąd, opisz w PR.
Gotowe, gdy:
- co najmniej 6 nowych przypadków, wszystkie zielone albo błąd opisany w PR
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
