# QT01 – e2e: Porównaj – × usuwa wiersz, wiersz z biblioteki
Cel: scenariusz e2e z fixture’ami: wiersz z biblioteki widać w Porównaj, × go usuwa i wiersz znika po odświeżeniu.
Zmieniaj: tests/e2e/q2-compare-remove.spec.ts
Wymagane: tests/e2e/q2-compare-remove.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tests/e2e/compare-table.spec.ts, tests/e2e/helpers/*, src/view/pages/ComparePage.tsx
Zadanie: Nowy plik; wzoruj się na compare-table.spec.ts (tytuły z @S<n> jak w sąsiednich plikach). Bez toHaveScreenshot.
Gotowe, gdy:
- test: × usuwa wiersz, localStorage faktografia-my-indicators bez id
- test: układ 390 px, × ma ≥ 44 px
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
