# QT04 – Test pól dotykowych 44 px nowych komponentów
Cel: strażnik: przyciski × (Porównaj), DeckStrip, AddPageMenu i Dodaj (QS01) mają min. 44 px.
Zmieniaj: tests/unit/q2-touch-targets.test.tsx
Wymagane: tests/unit/q2-touch-targets.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/profile/ProfileCompareTable.tsx, src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, tests/unit/share-deck-wiring.test.tsx
Zadanie: Nowy test jednostkowy sprawdzający klasy rozmiaru z tokenów (min-h/min-w odpowiadające 44 px) w wyrenderowanych komponentach. Bez zmian w kodzie produkcyjnym.
Gotowe, gdy:
- test dla każdego z 3 komponentów
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
