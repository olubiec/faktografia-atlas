# QT02 – e2e: okno udostępniania – pasek stron i CSV zestawu
Cel: scenariusz e2e: dodanie strony z menu, przycisk CSV zestawu widoczny tylko przy 2+ stronach.
Zmieniaj: tests/e2e/q2-share-deck.spec.ts
Wymagane: tests/e2e/q2-share-deck.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/share/ShareDialog.tsx, src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, tests/e2e/helpers/*
Zadanie: Nowy plik. Bez toHaveScreenshot i bez pobierania plików z sieci.
Gotowe, gdy:
- test: z 1 stroną brak „Pobierz CSV zestawu”, po dodaniu 2. jest
- test: menu Dodaj stronę nie oferuje rodzajów bez danych
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
