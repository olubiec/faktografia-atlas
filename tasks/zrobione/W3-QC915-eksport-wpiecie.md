# QC915 – Eksport: wpięcie pasków stron, menu „Dodaj stronę”, karty A vs B i CSV zestawu
Cel: komponenty z QC902/910/911/913/914 (AddPageMenu, DeckStrip, deck-csv, card-versus, deck-page-data) są faktycznie użyte w oknie udostępniania (ShareDialog/ShareBar/ShareControls): pasek stron zestawu, "Dodaj stronę", pobranie CSV zestawu. Na start zestaw ma tylko podstawowe strony (PRODUKT §4a); resztę użytkownik dodaje i usuwa.
Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareBar.tsx, src/view/share/ShareControls.tsx, src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, src/view/share/useShareData.ts, src/core/share/card.ts, tests/unit/share-deck-wiring.test.tsx
Wymagane: tests/unit/share-deck-wiring.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4a i sekcja o udostępnianiu, src/view/share/*, src/core/share/deck.ts
Decyzja 19.11.2026 (właściciel): istniejących testów nie zmieniasz; jeśli któryś kolidujący, domyślne zachowanie zostaje jak dziś (nowe elementy za opcjonalnym propem lub dodane bez zmiany starych selektorów). Jeśli trzeba pliku spoza listy, napisz w PR i zatrzymaj się.
