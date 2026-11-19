# QS02 – useShareData dostarcza dane karty A vs B
Cel: okno udostępniania na stronie Porównaj ma dane A i B i może pokazać kartę A vs B.
Zmieniaj: src/view/share/useShareData.ts, tests/unit/share-versus-data.test.tsx
Wymagane: tests/unit/share-versus-data.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/share/useShareData.ts, src/core/share/card.ts, tests/unit/share-deck-wiring.test.tsx
Zadanie: Dodaj do useShareData dane kind 'versus' (jednostki A i B, wiersze z compare) z istniejących źródeł strony Porównaj, bez nowych pobrań. Gdy brak A lub B – menu nie oferuje karty.
Gotowe, gdy:
- test: z A i B dane versus mają oba tytuły i wiersze
- test: bez B brak karty versus
- test: CSV zestawu zawiera sekcję A vs B
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
