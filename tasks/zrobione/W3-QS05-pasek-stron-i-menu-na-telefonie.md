# QS05 – Okno udostępniania: widoczny napis strony i klikalne menu Dodaj stronę
Cel: na telefonie 390 px napis aktywnej strony w pasku jest widoczny, menu „+ Dodaj stronę” otwiera się nad oknem i jest klikalne, a pasek przy jednej stronie się nie przewija.
Zmieniaj: src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, tests/unit/share-deck-mobile.test.tsx
Wymagane: tests/unit/share-deck-mobile.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q2-telefon-390.md (PR #537, gałąź claude/QR02), src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, tests/unit/share-deck-wiring.test.tsx, tests/unit/q2-touch-targets.test.tsx
Zadanie: Napraw trzy usterki z raportu QR02: kolor napisu aktywnej strony równy tłu (DeckStrip.tsx ok. l.59 – użyj tokenów kontrastu), popover menu pod oknem (AddPageMenu.tsx ok. l.85 – warstwa z-index nad oknem dialogu), poziome przewijanie paska przy 1 stronie. Tylko klasy z tokenów.
Gotowe, gdy:
- test: aktywna strona ma klasę koloru tekstu różną od tła
- test: menu ma warstwę wyższą niż okno dialogu
- test: pasek z 1 stroną nie ma klasy overflow-x-scroll
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): Claude decyduje sam. Pełne CI musi być zielone; jeśli lokalny test czasowy (próg ms) pada przy równoległych przebiegach, uruchom go osobno i opisz w PR uczciwie, co padło.
